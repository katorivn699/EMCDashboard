// app/login/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import discord_icon from "@/assets/images/discord-icon.svg";
import Image from "next/image";
import { DISCORD_AUTH_URL } from "@/config/auth";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations("login");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cookies = document.cookie.split("; ");
    const errorCookie = cookies.find((cookie) =>
      cookie.startsWith("login_error=")
    );
    const token = cookies.find((cookie) => cookie.startsWith("auth_token="));
    const errorParam = errorCookie ? errorCookie.split("=")[1] : null;
    console.log("Error from cookie:", errorParam);

    if (errorParam) {
      setError(errorParam);
      // Xóa cookie sau khi đọc để tránh lặp lại khi refresh
      document.cookie = "login_error=; path=/; max-age=0";
    }

    if (token) {
      router.push("/");
      return;
    }
  }, []); // Chỉ chạy một lần khi mount

  useEffect(() => {
    if (error) {
      let errorMessage = "";
      switch (error) {
        case "no_code":
          errorMessage = t("no_code");
          break;
        case "auth_failed":
          errorMessage = t("auth_failed");
          break;
        case "invalid_user_data":
          errorMessage = t("invalid_user_data");
          break;
        case "server_error":
          errorMessage = t("server_error");
          break;
        case "no_auth":
          errorMessage = t("no_auth");
          break;
        case "invalid_token":
          errorMessage = t("invalid_token");
          break;
        case "invalid_signature":
          errorMessage = t("invalid_signature");
          break;
        case "no_discord_auth":
          errorMessage = t("no_discord_auth");
          break;
        default:
          errorMessage = t("default_error");
      }
      toast.error(errorMessage, {
        duration: 5000,
      });
      setError(null); // Reset error sau khi hiển thị
    }
  }, [error]);

  const handleDiscordLogin = () => {
    window.location.href = DISCORD_AUTH_URL;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-300">
      <Card className="w-full max-w-md shadow-xl border-none">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center text-gray-800">
            Đăng Nhập
          </CardTitle>
          <CardDescription className="text-center text-gray-600">
            Dùng tài khoản Discord để truy cập hệ thống
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col space-y-2">
          <Button
            onClick={handleDiscordLogin}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Image src={discord_icon} alt="Discord login" className="w-5" />
            Đăng nhập với Discord
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
