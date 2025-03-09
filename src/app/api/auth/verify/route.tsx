// /api/auth/verify
import { verifyToken } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

async function verifyTokenOnServer(token: string) {
  return verifyToken(token);
}

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    const response = NextResponse.redirect(
      new URL("/login", req.url).toString()
    );
    response.cookies.set("login_error", "no_auth", { path: "/", maxAge: 60 });
    return response;
  }

  try {
    const isValid = await verifyTokenOnServer(token);
    if (isValid) {
      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      const response = NextResponse.redirect(
        new URL("/login", req.url).toString()
      );
      response.cookies.set("login_error", "invalid_token", {
        path: "/",
        maxAge: 60,
      });
      return response;
    }
  } catch (error) {
    if (error instanceof Error && error.name === "JsonWebTokenError") {
      const response = NextResponse.redirect(
        new URL("/login", req.url).toString()
      );
      response.cookies.set("login_error", "invalid_signature", {
        path: "/",
        maxAge: 60,
      });
      return response;
    }
    console.error("Error verifying token:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
