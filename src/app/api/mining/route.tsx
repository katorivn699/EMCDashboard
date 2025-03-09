import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { authenticateToken } from "@/middleware/auth";
import Mine from "@/entity/Mine";
import PlayerInventory from "@/entity/PlayerInventory";
import MinigameItem from "@/entity/MinigameItem";
import { verifyToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await connectDB();
    const authResult = authenticateToken(req, ["manager", "admin", "member"]);
    if (authResult.error) {
      return NextResponse.json(
        { message: authResult.error },
        { status: authResult.status }
      );
    }

    const { mineId, itemId } = await req.json();
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];
    const decoded = verifyToken(token);
    const playerId = decoded.id;

    // Tìm mỏ
    const mine = await Mine.findById(mineId);
    if (!mine) {
      return NextResponse.json(
        { message: "Mine not found" },
        { status: 404 }
      );
    }

    // Tìm inventory của người chơi
    const inventory = await PlayerInventory.findOne({ playerId });
    if (!inventory) {
      return NextResponse.json(
        { message: "Player inventory not found" },
        { status: 404 }
      );
    }

    // Tìm công cụ trong inventory.tools
    const toolIndex = inventory.tools.findIndex((t) => t._id.toString() === itemId);
    if (toolIndex === -1) {
      return NextResponse.json(
        { message: "Tool not found in inventory" },
        { status: 404 }
      );
    }
    const tool = inventory.tools[toolIndex];

    // Tìm MinigameItem để lấy strength
    const minigameItem = await MinigameItem.findOne({ itemId: tool.itemId });
    if (!minigameItem) {
      return NextResponse.json(
        { message: "Tool details not found in MinigameItem" },
        { status: 404 }
      );
    }
    const toolStrength = minigameItem.strength;

    // Kiểm tra độ bền
    if (mine.mineDurability <= 0) {
      return NextResponse.json(
        { message: "Mine is exhausted" },
        { status: 400 }
      );
    }
    if (tool.currentDurability <= 0) {
      return NextResponse.json(
        { message: "Tool is broken" },
        { status: 400 }
      );
    }

    // Giảm độ bền
    mine.mineDurability -= toolStrength;
    tool.currentDurability -= 1;

    // Tính tài nguyên nhận được và tỷ lệ rơi
    const collectedResources: { resourceName: string; quantity: number }[] = [];
    const dropRates: { resourceName: string; dropRate: number }[] = []; // Lưu tỷ lệ rơi

    mine.resources.forEach((resource) => {
      // Lưu tỷ lệ rơi của tài nguyên
      dropRates.push({
        resourceName: resource.resourceName,
        dropRate: resource.dropRate,
      });

      // Tính toán khả năng nhận tài nguyên
      if (Math.random() < resource.dropRate / 100) {
        const existingResource = inventory.resources.find(
          (r) => r.resourceName === resource.resourceName
        );
        if (existingResource) {
          existingResource.quantity += 1;
        } else {
          inventory.resources.push({ resourceName: resource.resourceName, quantity: 1 });
        }
        collectedResources.push({ resourceName: resource.resourceName, quantity: 1 });
      }
    });

    // Tính xác suất nhận được ít nhất 1 tài nguyên
    const probabilityNoResource = dropRates.reduce(
      (acc, resource) => acc * (1 - resource.dropRate / 100),
      1
    );
    const probabilityAtLeastOne = 1 - probabilityNoResource;

    // Tính kỳ vọng số lượng tài nguyên
    const expectedResources = dropRates.reduce(
      (acc, resource) => acc + resource.dropRate / 100,
      0
    );

    // Xóa công cụ nếu hết độ bền
    if (tool.currentDurability <= 0) {
      inventory.tools.splice(toolIndex, 1);
    }

    // Lưu thay đổi
    await mine.save();
    await inventory.save();

    return NextResponse.json({
      message: "Mining successful",
      data: {
        mineDurability: mine.mineDurability,
        itemDurability: tool.currentDurability,
        collectedResources,
      },
    });
  } catch (error) {
    console.error("Error during mining:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}