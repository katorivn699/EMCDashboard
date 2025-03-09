import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import MinigameItem from "@/entity/MinigameItem";
import UserCredit from "@/entity/UserCredit";
import PlayerInventory from "@/entity/PlayerInventory";
import { authenticateToken } from "@/middleware/auth";

// Kết nối database trước khi xử lý request
await connectDB();

export async function POST(req: Request) {
  try {
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

    const decoded = verifyToken(token);
    const userId = decoded.id;

    // Tìm vật phẩm trong MinigameItem
    const item = await MinigameItem.findById(itemId);
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
      });
    }

    // Kiểm tra xem công cụ đã sở hữu chưa
    if (inventory.tools.some((tool) => tool.itemId === itemId)) {
      return NextResponse.json(
        { message: "Item already owned" },
        { status: 400 }
      );
    }

    // Trừ eCredit và thêm công cụ vào inventory với currentDurability
    user.eCredit -= item.sellValue;
    inventory.tools.push({
      itemId: item.itemId,
      currentDurability: item.durability, // Gán độ bền ban đầu từ MinigameItem
    });
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