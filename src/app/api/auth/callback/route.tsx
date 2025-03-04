// app/api/auth/callback/route.ts
import { generateToken } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import UserAuthorization from "@/model/UserAuthorization";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    console.log("🚀 ~ GET ~ code:", code);

    if (!code) {
      const response = NextResponse.redirect(new URL("/login", req.url).toString());
      response.cookies.set("login_error", "no_code", { path: "/", maxAge: 60 }); // Lưu lỗi vào cookie tạm thời
      return response;
    }

    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: `${process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID}`,
        client_secret: `${process.env.NEXT_PUBLIC_DISCORD_CLIENT_SECRET}`,
        grant_type: "authorization_code",
        code: code,
        redirect_uri: "http://localhost:3000/api/auth/callback",
        scope: "identify",
      }),
    });

    const tokenData = await tokenResponse.json();
    console.log("🚀 ~ GET ~ tokenData:", tokenData);

    if (!tokenData.access_token) {
      const response = NextResponse.redirect(new URL("/login", req.url).toString());
      response.cookies.set("login_error", "auth_failed", { path: "/", maxAge: 60 });
      return response;
    }

    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });
    const userData = await userResponse.json();
    console.log("🚀 ~ GET ~ userData:", userData);

    if (!userData.id) {
      const response = NextResponse.redirect(new URL("/login", req.url).toString());
      response.cookies.set("login_error", "invalid_user_data", { path: "/", maxAge: 60 });
      return response;
    }

    await connectDB();
    let userDB = await UserAuthorization.findOne({ userId: userData.id });

    if (!userDB) {
      const response = NextResponse.redirect(new URL("/login", req.url).toString());
      response.cookies.set("login_error", "no_auth", { path: "/", maxAge: 60 });
      return response;
    }

    const accessToken = generateToken(
      {
        id: userData.id,
        username: userData.username,
        avatar: userData.avatar || null,
      },
      "1w"
    );

    userDB.accessToken = accessToken;
    userDB.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    userDB.username = userData.username;
    userDB.avatar = userData.avatar || userDB.avatar;

    await userDB.save();

    const redirectResponse = NextResponse.redirect(new URL("/", req.url).toString());
    redirectResponse.cookies.set("auth_token", accessToken, {
      path: "/",
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60,
    });

    return redirectResponse;
  } catch (error) {
    console.error("Error in auth callback:", error);
    const response = NextResponse.redirect(new URL("/login", req.url).toString());
    response.cookies.set("login_error", "server_error", { path: "/", maxAge: 60 });
    return response;
  }
}