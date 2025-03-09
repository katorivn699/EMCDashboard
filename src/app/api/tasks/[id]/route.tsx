
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import mongoose from "mongoose";
import { authenticateToken } from "@/middleware/auth";
import { connectDB } from "@/lib/mongodb";
import Task from "@/entity/Task";

async function ensureDbConnected() {
  await connectDB();
}


// PATCH: Cập nhật task theo ID
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // params là Promise
) {
  const authResult = authenticateToken(req, ["manager", "admin", "member"]);
    if (authResult.error) {
      return NextResponse.json(
        { message: authResult.error },
        { status: authResult.status }
      );
    }


  try {
    await ensureDbConnected();
    const { id } = await context.params;
    console.log("Task ID:", id);

    // Kiểm tra ID hợp lệ
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "ID không hợp lệ" }, { status: 400 });
    }

    // Lấy dữ liệu từ body
    const { status } = await req.json();

    // Kiểm tra status hợp lệ
    if (!["not_started", "in_progress", "review", "completed"].includes(status)) {
      return NextResponse.json({ message: "Trạng thái không hợp lệ" }, { status: 400 });
    }

    // Cập nhật task
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return NextResponse.json({ message: "Không tìm thấy công việc" }, { status: 404 });
    }

    return NextResponse.json({
      message: "ok",
      data: updatedTask,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật task:", error);
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 });
  }
}