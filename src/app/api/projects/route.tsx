import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Project from "@/entity/Project";
import { authenticateToken } from "@/middleware/auth";

async function ensureDbConnected() {
  await connectDB();
}

export async function GET(req: Request) {
  const authResult = authenticateToken(req, ["manager", "admin", "member"]);
  if (authResult.error) {
    return NextResponse.json(
      { message: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    await ensureDbConnected();
    const projects = await Project.find().lean();

    return NextResponse.json({
      message: "ok",
      data: projects,
    });
  } catch (error) {
    console.error("Lỗi khi lấy project:", error);
    return NextResponse.json({ message: "serverError" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const authResult = authenticateToken(req, ["admin", "manager"]);
  if (authResult.error) {
    return NextResponse.json(
      { message: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    await ensureDbConnected();
    const body = await req.json();
    const { _id, projectName, description } = body;

    if (!_id) {
      return NextResponse.json({ message: "missingId" }, { status: 400 });
    }

    if (!projectName || !description) {
      return NextResponse.json({ message: "missingFields" }, { status: 400 });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      _id,
      { projectName, description },
      { new: true }
    ).lean();

    if (!updatedProject) {
      return NextResponse.json({ message: "notFound" }, { status: 404 });
    }

    return NextResponse.json({
      message: "ok",
      data: updatedProject,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật project:", error);
    return NextResponse.json({ message: "serverError" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const authResult = authenticateToken(req, ["admin", "manager"]);
  if (authResult.error) {
    return NextResponse.json(
      { message: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    await ensureDbConnected();
    const body = await req.json();
    const { _id } = body;

    if (!_id) {
      return NextResponse.json({ message: "missingId" }, { status: 400 });
    }

    const deletedProject = await Project.findByIdAndDelete(_id).lean();

    if (!deletedProject) {
      return NextResponse.json({ message: "notFound" }, { status: 404 });
    }

    return NextResponse.json({
      message: "deleteSuccess",
      data: deletedProject,
    });
  } catch (error) {
    console.error("Lỗi khi xóa project:", error);
    return NextResponse.json({ message: "serverError" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  // Kiểm tra token và quyền (chỉ admin hoặc manager được tạo)
  const authResult = authenticateToken(req, ["admin", "manager"]);
  if (authResult.error) {
    return NextResponse.json(
      { message: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    await ensureDbConnected();
    const body = await req.json();
    const { projectName, description } = body;

    // Kiểm tra dữ liệu đầu vào
    if (!projectName || !description) {
      return NextResponse.json({ message: "missingFields" }, { status: 400 });
    }

    // Tạo dự án mới
    const newProject = new Project({
      projectName,
      description,
      createdAt: new Date(), // Thêm thời gian tạo mặc định
    });

    const savedProject = await newProject.save();

    return NextResponse.json({
      message: "createSuccess",
      data: savedProject.toObject(), // Chuyển đổi sang plain object
    });
  } catch (error) {
    console.error("Lỗi khi tạo project:", error);
    return NextResponse.json({ message: "serverError" }, { status: 500 });
  }
}
