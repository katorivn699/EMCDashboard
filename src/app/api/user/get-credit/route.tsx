import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import { authenticateToken } from "@/middleware/auth";
import UserCredit, { IUserCredit } from "@/entity/UserCredit"; // Import IUserCredit

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

    if (!token) {
      return NextResponse.json(
        { message: "No token provided" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    const userId = decoded?.id;

    const user = await UserCredit.findOne({ userId }).lean() as IUserCredit | null;
    if (!user) {
      // Trả về thông báo yêu cầu verify Discord và redirect về home
      return NextResponse.json(
        { message: "Please verify your Discord account" },
        {
          status: 401,
          headers: {
            Location: "/", // Redirect về trang home
          },
        }
      );
    }

    return NextResponse.json({
      message: "ok",
      data: { eCredit: user.eCredit, achievements: user.achievements },
    });
  } catch (error) {
    console.error("Error fetching user credit:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}