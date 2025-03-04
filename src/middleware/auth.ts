import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function verifyToken(req: NextRequest) {
  const token = req.headers.get("Authorization")?.split(" ")[1];

  if (!token) {
    return NextResponse.json({ error: "Không có token!" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.NEXT_PUBLIC_JWT_SECRET_KEY || "default_secret");
    return decoded;
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Token không hợp lệ!" }, { status: 403 });
  }
}