import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import MinigameItem, { IMinigameItem } from "@/entity/MinigameItem";
import UserCredit from "@/entity/UserCredit";
import PlayerInventory, { IPlayerInventory, IToolItem } from "@/entity/PlayerInventory";
import { authenticateToken } from "@/middleware/auth";

export async function POST(req: Request) {
  try {
    // Kết nối database trong hàm xử lý request
    await connectDB();

    const { itemId } = await req.json();
    const authResult = authenticateToken(req, ["admin", "manager", "member"]);
    console.log("🚀 ~ POST ~ itemId:", itemId);

    if (authResult.error) {
      return NextResponse.json(
        { message: authResult.error },
        { status: authResult.status }
      );
    }

    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { message: "No token provided" },
        { status: 401 }
      );
    }

    const decoded = token ? verifyToken(token) : null;
    const userId = decoded?.id;

    // Tìm vật phẩm trong MinigameItem
    const item = (await MinigameItem.findById(itemId)) as IMinigameItem | null;
    console.log("🚀 ~ POST ~ item:", item);
    if (!item) {
      return NextResponse.json({ message: "Item not found" }, { status: 404 });
    }

    // Tìm hoặc tạo UserCredit
    let user = await UserCredit.findOne({ userId });
    if (!user) {
      user = new UserCredit({
        userId,
        guildId: "default",
        eCredit: 1000, // Giá trị khởi tạo ban đầu
        achievements: [],
        lastUpdated: new Date(),
      });
    }

    // Kiểm tra đủ eCredit để mua không
    if (user.eCredit < item.sellValue) {
      return NextResponse.json(
        { message: "Insufficient eCredit" },
        { status: 400 }
      );
    }

    // Tìm hoặc tạo PlayerInventory
    let inventory = await PlayerInventory.findOne({ playerId: userId });
    if (!inventory) {
      inventory = new PlayerInventory({
        playerId: userId,
        resources: [],
        tools: [],
        lastUpdated: new Date(),
      });
    }

    // Đảm bảo inventory không null trước khi tiếp tục
    if (!inventory) {
      throw new Error("Failed to initialize inventory"); // Trường hợp này không nên xảy ra
    }

    // Kiểm tra xem công cụ đã sở hữu chưa
    if (inventory.tools.some((tool: IToolItem) => tool.itemId === item.itemId)) {
      return NextResponse.json(
        { message: "Item already owned" },
        { status: 400 }
      );
    }

    // Trừ eCredit và thêm công cụ vào inventory với currentDurability
    user.eCredit -= item.sellValue;
    user.lastUpdated = new Date(); // Cập nhật thời gian sau khi thay đổi

    // Thêm công cụ mới (không cần _id vì Mongoose tự tạo khi lưu)
    inventory.tools.push({
      itemId: item.itemId,
      currentDurability: item.durability,
    } as IToolItem); // Ép kiểu để khớp với IToolItem, _id sẽ được Mongoose thêm sau
    inventory.lastUpdated = new Date();

    // Lưu cả hai document
    await Promise.all([user.save(), inventory.save()]);

    return NextResponse.json({
      message: "Item purchased successfully",
      data: {
        eCredit: user.eCredit,
        item: {
          itemId: item.itemId,
          name: item.name,
          currentDurability: item.durability, // Trả về độ bền ban đầu
        },
      },
    });
  } catch (error) {
    console.error("Error buying item:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}