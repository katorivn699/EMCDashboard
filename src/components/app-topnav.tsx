"use client";

import { usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"; // Import từ shadcn
import { Search, Globe, User } from "lucide-react";
import { useLocale } from "@/context/LocaleProvider";
import { SidebarTrigger } from "./ui/sidebar";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import getDiscordAvatar from "@/utils/discord";
import { useTranslations } from "next-intl";
import { getCookie } from "@/lib/utils";

const languages = [
  { code: "en", label: "English" },
  { code: "vi", label: "Tiếng Việt" },
];

export function TopNav() {
  const pathname = usePathname();
  const { locale, changeLocale } = useLocale();
  const [avatarUrl, setAvatarUrl] = useState("https://i.pravatar.cc/40");
  const t = useTranslations("ui");

  useEffect(() => {
    const token = getCookie("auth_token");

    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        const avatarFromToken =
          getDiscordAvatar(decoded.id, decoded.avatar) ||
          "https://i.pravatar.cc/40";
        setAvatarUrl(avatarFromToken);
      } catch (error) {
        console.error("Error decoding token:", error);
        setAvatarUrl("https://i.pravatar.cc/40"); // Default nếu lỗi
      }
    }
  }, []);

  const breadcrumbs = pathname.split("/").filter(Boolean);

  return (
    <div className="flex items-center justify-between p-4 border-b shadow-md bg-white">
      {/* BREADCRUMB */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <SidebarTrigger />
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => (
              <BreadcrumbItem key={index}>
                <BreadcrumbLink className="capitalize">
                  {crumb}
                </BreadcrumbLink>
                {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
              </BreadcrumbItem>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* SEARCH BAR */}
      <div className="flex items-center gap-2 w-1/3">
        <Search className="w-5 h-5 text-gray-400" />
        <Input type="text" placeholder={`${t("search")}...`} className="w-full" />
      </div>

      {/* LANGUAGE & PROFILE */}
      <div className="flex items-center gap-4">
        {/* LANGUAGE SWITCHER */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              {languages.find((l) => l.code === locale)?.label}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {languages.map((l) => (
              <DropdownMenuItem
                key={l.code}
                onClick={() => changeLocale(l.code)}
              >
                {l.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* USER PROFILE */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src={avatarUrl} alt="User" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <User className="w-4 h-4 mr-2" />
              {t("profile")}
            </DropdownMenuItem>
            <DropdownMenuItem>{t("logout")}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}