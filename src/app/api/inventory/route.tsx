import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { authenticateToken } from "@/middleware/auth";
import PlayerInventory from "@/entity/PlayerInventory";
import MinigameItem from "@/entity/MinigameItem";
import { verifyToken } from "@/lib/auth";

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

    const decoded = verifyToken(token);
    const playerId = decoded.id;

    // Tìm kho của người chơi
    const inventory = await PlayerInventory.findOne({ playerId }).lean();
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
    const minigameItems = await MinigameItem.find({ itemId: { $in: toolItemIds } })
      .select("itemId name strength") // Lấy các field cần thiết
      .lean();

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