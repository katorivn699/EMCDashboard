import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { authenticateToken } from "@/middleware/auth";
import MinigameItem from "@/entity/MinigameItem";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
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
    const updatedItem = await MinigameItem.findByIdAndUpdate(params.id, body, {
      new: true,
    }).lean();

    if (!updatedItem) {
      return NextResponse.json({ message: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "ok", data: updatedItem });
  } catch (error) {
    console.error("Error updating item:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const authResult = authenticateToken(req, ["admin"]);
    if (authResult.error) {
      return NextResponse.json(
        { message: authResult.error },
        { status: authResult.status }
      );
    }

    const deletedItem = await MinigameItem.findByIdAndDelete(params.id).lean();
    if (!deletedItem) {
      return NextResponse.json({ message: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "ok", data: deletedItem });
  } catch (error) {
    console.error("Error deleting item:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
