import { NextResponse } from "next/server";
import Task from "@/entity/Task";
import User from "@/entity/User";
import Project from "@/entity/Project"; // Đảm bảo import hoạt động
import { authenticateToken } from "@/middleware/auth";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";

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

  const authHeader = req.headers.get("authorization");
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return NextResponse.json({ message: "No token provided" }, { status: 401 });
  }

  let userIdToken;
  try {
    await ensureDbConnected();

    const decoded = verifyToken(token);
    userIdToken = decoded?.id || decoded?._id;

    const user = await User.findOne({ userId: userIdToken }).lean(); // Dùng _id nếu token trả về _id
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    userIdToken = user._id;

    const project = new Project();

    const tasks = await Task.find({ userId: userIdToken })
      .populate("projectId", "projectName")
      .populate("userId", "username")
      .populate("support", "username")
      .populate("assigner", "username")
      .lean();

    if (!tasks) {
      NextResponse.json({ message: "Can't find Task" }, { status: 500 });
    }

    return NextResponse.json({
      message: "ok",
      data: tasks,
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
