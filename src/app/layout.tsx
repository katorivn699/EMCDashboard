"use client";
import "./globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import LocaleProvider from "@/context/LocaleProvider";
import { TopNav } from "@/components/app-topnav";
import { Toaster } from "sonner";
import ProtectedRoute from "@/components/route/ProtectedRoute";
import { Roboto_Slab } from "next/font/google";
import { getCookie } from "@/lib/utils";

const robotoSlab = Roboto_Slab({
  subsets: ["vietnamese", "latin"],
  style: ["normal"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-roboto-slab",
});

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const pathname = usePathname();
  const sidebarState = getCookie("sidebar_state") === "true";

  const formatTitle = (path: string) => {
    if (path === "/") return "EMC Dashboard - Home";
    return `EMC Dashboard - ${path
      .split("/")
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")}`;
  };

  useEffect(() => {
    document.title = formatTitle(pathname);
  }, [pathname]);

  const isLoginPage = pathname === "/login";

  return (
    <html lang={params.locale}>
      <body className={robotoSlab.className}>
        <LocaleProvider>
          {isLoginPage ? (
            // Chỉ hiển thị children khi ở trang login
            <>
              <main>{children}</main>
              <Toaster position="top-center" richColors />
            </>
          ) : (
            <ProtectedRoute>
              <SidebarProvider defaultOpen={sidebarState}>
                <div className="flex w-full min-h-screen">
                  <AppSidebar />
                  <div className="flex flex-col flex-1">
                    <TopNav />
                    <main>{children}</main>
                    <Toaster position="bottom-right" richColors />
                  </div>
                </div>
              </SidebarProvider>
            </ProtectedRoute>
          )}
        </LocaleProvider>
      </body>
    </html>
  );
}
