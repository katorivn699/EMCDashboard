import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { authenticateToken } from "@/middleware/auth";
import MinigameItem from "@/entity/MinigameItem";

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
    // Lấy tất cả vật phẩm từ collection MinigameItems
    const items = await MinigameItem.find().lean();

    // Trả về danh sách vật phẩm
    return NextResponse.json({
      message: "ok",
      data: items,
    });
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const authResult = authenticateToken(req, ["admin"]);
    if (authResult.error) {
      return NextResponse.json(
        { message: authResult.error },
        { status: authResult.status }
      );
    }

    const body = await req.json();
    const item = new MinigameItem(body);
    await item.save();

    return NextResponse.json({ message: "ok", data: item }, { status: 201 });
  } catch (error) {
    console.error("Error adding item:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
