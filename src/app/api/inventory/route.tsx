import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { authenticateToken } from "@/middleware/auth";
import PlayerInventory, { IPlayerInventory } from "@/entity/PlayerInventory";
import MinigameItem, { IMinigameItem } from "@/entity/MinigameItem";
import { verifyToken } from "@/lib/auth";
import UserAuthorization, { IUserAuthorization } from "@/entity/UserAuthorization";

export async function GET(req: Request) {
  try {
    await connectDB();
    const authResult = authenticateToken(req, ["manager", "admin", "member"]);
    if (authResult.error) {
      return NextResponse.json(
        { message: authResult.error },
        { status: authResult.status }
      );
    }

    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    const decoded = token ? verifyToken(token) : null;
    const playerId = decoded?.id;

    // Tìm thông tin người dùng từ UserAuthorization
    const user = (await UserAuthorization.findOne({ userId: playerId }).lean()) as IUserAuthorization | null;

    // Kiểm tra nếu user không tồn tại hoặc isLogin là false
    if (!user || !user.isLogin) {
      return NextResponse.json(
        { message: "Please log in to access this resource" },
        {
          status: 401, // Unauthorized
          headers: {
            Location: "/", // Chuyển hướng về trang chủ
          },
        }
      );
    }


    // Tìm kho của người chơi
    const inventory = (await PlayerInventory.findOne({
      playerId,
    }).lean()) as IPlayerInventory | null;
    if (!inventory) {
      return NextResponse.json({
        message: "Inventory not found, starting fresh",
        data: {
          playerId,
          resources: [],
          tools: [],
          lastUpdated: new Date(),
        },
      });
    }

    // Lấy danh sách itemId từ tools
    const toolItemIds = inventory.tools.map((tool) => tool.itemId);

    // Tra cứu MinigameItem dựa trên itemId
    const minigameItems = (await MinigameItem.find({
      itemId: { $in: toolItemIds },
    })
      .select("itemId name strength")
      .lean()) as unknown as Pick<
      IMinigameItem,
      "itemId" | "name" | "strength"
    >[];

    // Gộp thông tin từ MinigameItem vào tools
    const toolsWithDetails = inventory.tools.map((tool) => {
      const item = minigameItems.find((i) => i.itemId === tool.itemId);
      return {
        ...tool,
        name: item ? item.name : "Unknown Tool",
        strength: item ? item.strength : 1, // Fallback nếu không tìm thấy
      };
    });

    // Trả về inventory với tools đã được bổ sung thông tin
    return NextResponse.json({
      message: "ok",
      data: {
        ...inventory,
        tools: toolsWithDetails,
      },
    });
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
