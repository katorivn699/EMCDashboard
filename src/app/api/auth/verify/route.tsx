import { verifyToken } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

async function verifyTokenOnServer(token: string) {
  return verifyToken(token);
}

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ message: "No token provided" }, { status: 401 });
  }

  try {
    const isValid = await verifyTokenOnServer(token);
    if (isValid) {
      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }
  } catch (error) {
    console.error("Error verifying token:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
