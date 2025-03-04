"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const cookies = document.cookie.split("; ");
      const authCookie = cookies.find((cookie) =>
        cookie.startsWith("auth_token=")
      );
      const token = authCookie ? authCookie.split("=")[1] : null;

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const resp = await fetch("/api/auth/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if(!resp.ok) return false;
        const data = await resp.json();
        const isValid = data.success === true;
        if (isValid) {
          setIsAuthenticated(true);
        } else {
          document.cookie =
            "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
          router.push("/login");
        }
      } catch (error) {
        console.error("Lỗi khi xác thực token:", error);
        document.cookie =
          "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
        router.push("/login");
      }
    };

    checkAuth();
  }, [router]);

  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-300">
        <div className="flex flex-col items-center space-y-4">
          <svg
            className="animate-spin h-12 w-12 text-indigo-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="text-lg font-semibold text-gray-700 animate-pulse">
            Đang kiểm tra quyền truy cập...
          </p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
}
