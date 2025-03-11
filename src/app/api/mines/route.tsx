import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Mine from "@/entity/Mine";
import { authenticateToken } from "@/middleware/auth";

// Danh sách mẫu để sinh ngẫu nhiên resources
const resourceNames = ["Than", "Sắt", "Vàng", "Kim cương", "Ngọc lục bảo"];
const rarities = ["Common", "Uncommon", "Rare", "Epic"];

const generateRandomResources = () => {
  const numberOfResources = Math.floor(Math.random() * 3) + 1; // 1-3 tài nguyên
  const resources = [];

  for (let i = 0; i < numberOfResources; i++) {
    const rarity = rarities[Math.floor(Math.random() * rarities.length)];
    let dropRate;

    // Điều chỉnh dropRate dựa trên rarity
    if (rarity === "Rare" || rarity === "Epic") {
      dropRate = Math.floor(Math.random() * 1) + 1; // 1% cho Rare và Epic
    } else {
      dropRate = Math.floor(Math.random() * 100) + 1; // 1-100% cho Common và Uncommon
    }

    resources.push({
      resourceName:
        resourceNames[Math.floor(Math.random() * resourceNames.length)],
      rarity,
      dropRate,
      baseValue: Math.floor(Math.random() * 991) + 10, // 10-1000
    });
  }
  return resources;
};

// GET: Lấy tất cả mines
export async function GET(req: Request) {
  await connectDB();
  try {
    const authResult = authenticateToken(req, ["admin", "manager", "member"]);
    if (authResult.error) {
      return NextResponse.json(
        { message: authResult.error },
        { status: authResult.status }
      );
    }
    const mines = await Mine.find({});
    return NextResponse.json(mines, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch mines" },
      { status: 500 }
    );
  }
}

// POST: Tạo mine mới với resources ngẫu nhiên
export async function POST(req: NextRequest) {
  await connectDB();
  try {
    const authResult = authenticateToken(req, ["admin"]);
    if (authResult.error) {
      return NextResponse.json(
        { message: authResult.error },
        { status: authResult.status }
      );
    }
    const body = await req.json();
    const { mineId, mineName, mineDurability } = body;

    // Kiểm tra dữ liệu đầu vào
    if (!mineId || !mineName || mineDurability === undefined) {
      return NextResponse.json(
        {
          error: "Missing required fields: mineId, mineName, or mineDurability",
        },
        { status: 400 }
      );
    }

    // Tạo mine mới với resources ngẫu nhiên
    const mineData = {
      mineId,
      mineName,
      mineDurability,
      resources: generateRandomResources(), // Sinh ngẫu nhiên ở server
      createAt: new Date().toISOString(),
    };

    const mine = new Mine(mineData);
    await mine.save();

    return NextResponse.json(mine, { status: 201 });
  } catch (error) {
    console.error("Error creating mine:", error);
    return NextResponse.json(
      { error: "Failed to create mine" },
      { status: 400 }
    );
  }
}

// PUT: Cập nhật mine theo mineId
export async function PUT(req: NextRequest) {
  await connectDB();
  try {
    const authResult = authenticateToken(req, ["admin"]);
    if (authResult.error) {
      return NextResponse.json(
        { message: authResult.error },
        { status: authResult.status }
      );
    }
    const body = await req.json();
    const { mineId, ...updateData } = body;
    const mine = await Mine.findOneAndUpdate({ mineId }, updateData, {
      new: true,
    });
    if (!mine) {
      return NextResponse.json({ error: "Mine not found" }, { status: 404 });
    }
    return NextResponse.json(mine, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update mine" },
      { status: 400 }
    );
  }
}

// DELETE: Xóa mine theo mineId
export async function DELETE(req: NextRequest) {
  await connectDB();
  try {
    const authResult = authenticateToken(req, ["admin"]);
    if (authResult.error) {
      return NextResponse.json(
        { message: authResult.error },
        { status: authResult.status }
      );
    }
    const { mineId } = await req.json();
    const mine = await Mine.findOneAndDelete({ mineId });
    if (!mine) {
      return NextResponse.json({ error: "Mine not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Mine deleted" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete mine" },
      { status: 400 }
    );
  }
}
