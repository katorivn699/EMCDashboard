"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { getMenuItems, getSettingsItem } from "@/data/menu";
import Icon from "@/assets/images/Belu_Icon.png";
import Image from "next/image";
import { getCookie } from "@/lib/utils";
import { jwtDecode } from "jwt-decode";

interface CustomJwtPayload {
  id?: string;
  role?: string;
  [key: string]: any;
}

export function AppSidebar() {
  const t = useTranslations("sidebar");
  const menuGroups = getMenuItems(t);
  const settingsItem = getSettingsItem(t);
  const pathname = usePathname();
  const token = getCookie("auth_token");
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode<CustomJwtPayload>(token); // Ép kiểu với CustomJwtPayload
        setUserRole(decoded.role || null); // Truy cập role, mặc định null nếu không có
      } catch (err) {
        console.error("Error verifying token:", err);
        setUserRole(null);
      }
    }
  }, [token]);

  const [openGroups, setOpenGroups] = useState(
    Object.fromEntries(
      menuGroups
        .filter((group) => "id" in group)
        .map((group) => [group.id, group.defaultOpen])
    )
  );

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Hàm kiểm tra quyền truy cập
  const hasAccess = (roles: string[] | undefined): boolean => {
    if (!userRole || !roles) return false;
    return roles.includes(userRole);
  };

  // Lọc menu items dựa trên quyền
  const filteredMenuGroups = menuGroups.filter((item) => {
    if ("items" in item) {
      // Với nhóm, chỉ hiển thị nếu có ít nhất 1 sub-item được phép truy cập
      const accessibleItems = item.items.filter((subItem) =>
        hasAccess(subItem.roles)
      );
      return accessibleItems.length > 0;
    } else {
      // Với item đơn, kiểm tra quyền trực tiếp
      return hasAccess(item.roles);
    }
  });

  // Kiểm tra quyền cho settings item
  const canAccessSettings = hasAccess(settingsItem.roles);

  return (
    <Sidebar variant="floating" className="w-64 flex flex-col h-screen">
      <div className="px-6 py-4 border-b">
        <Image src={Icon} alt="Icon" />
        <h1 className="font">EMC Dashboard</h1>
      </div>
      <SidebarContent className="flex-1">
        <SidebarMenu>
          {filteredMenuGroups.map((item) => {
            if ("items" in item) {
              const accessibleItems = item.items.filter((subItem) =>
                hasAccess(subItem.roles)
              );
              if (accessibleItems.length === 0) return null;

              return (
                <SidebarGroup key={item.id}>
                  <SidebarGroupLabel
                    onClick={() => toggleGroup(item.id)}
                    className="flex justify-between cursor-pointer px-4 py-6 text-sm hover:bg-gray-100 rounded-md transition"
                  >
                    {item.label}
                    <motion.div
                      animate={{ rotate: openGroups[item.id] ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown size={18} />
                    </motion.div>
                  </SidebarGroupLabel>

                  <motion.div
                    initial={false}
                    animate={{ height: openGroups[item.id] ? "auto" : 0 }}
                    className="overflow-hidden"
                  >
                    <SidebarGroupContent>
                      {accessibleItems.map((subItem) => {
                        const isActive = pathname === subItem.url;
                        return (
                          <SidebarMenuItem key={subItem.title}>
                            <SidebarMenuButton asChild>
                              <Link href={subItem.url}>
                                <div
                                  className={`flex items-center w-full gap-2 px-4 py-2 rounded-md transition ${
                                    isActive
                                      ? "bg-emerald-800 text-white"
                                      : "hover:bg-gray-100 text-gray-700"
                                  }`}
                                >
                                  <subItem.icon size={18} />
                                  <span>{subItem.title}</span>
                                </div>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarGroupContent>
                  </motion.div>
                </SidebarGroup>
              );
            } else {
              const isActive = pathname === item.url;
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <div
                        className={`flex items-center w-full gap-2 px-4 py-2 transition ${
                          isActive
                            ? "bg-emerald-800 rounded-md text-white"
                            : "hover:bg-gray-100 text-gray-700"
                        }`}
                      >
                        <item.icon size={18} />
                        <span>{item.title}</span>
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            }
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t">
        {canAccessSettings && (
          <Link href={settingsItem.url} className="w-full">
            <div
              className={`flex items-center w-full gap-2 px-4 py-3 rounded-lg transition ${
                pathname === settingsItem.url
                  ? "bg-emerald-800 text-white"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <settingsItem.icon size={18} />
              <span>{settingsItem.title}</span>
            </div>
          </Link>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
