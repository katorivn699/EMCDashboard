import {
  Home,
  Command,
  Calendar,
  Settings,
  ShoppingCart,
  Folder,
  Gamepad,
  Gem,
  Pickaxe,
} from "lucide-react";

interface MenuItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ size?: number }>;
  roles?: string[]; // Vai trò được phép truy cập
}

interface MenuGroup {
  id: string;
  label: string;
  defaultOpen: boolean;
  items: MenuItem[];
  roles?: string[]; // Vai trò được phép truy cập nhóm (nếu cần)
}

export const getMenuItems = (t: (key: string) => string): (MenuItem | MenuGroup)[] => [
  { title: t("home"), url: "/", icon: Home, roles: ["admin", "manager", "member"] },
  { title: t("about"), url: "/about", icon: Command, roles: ["admin", "manager", "member"] },
  {
    title: t("minigame"),
    url: "/minigame",
    icon: Gamepad,
    roles: ["admin", "manager", "member"],
  },
  {
    title: t("shop"),
    url: "/shop",
    icon: ShoppingCart,
    roles: ["admin", "manager", "member"],
  },
  {
    id: "activityManager",
    label: t("activitymanager"),
    defaultOpen: false,
    items: [
      { title: t("projects"), url: "/projects", icon: Folder, roles: ["admin", "manager", "member"] },
      { title: t("tasks"), url: "/tasks", icon: Calendar, roles: ["admin", "manager", "member"] },
    ],
  },
  {
    id: "administrator",
    label: t("administrator"),
    defaultOpen: false,
    items: [
      { title: t("mines"), url: "/admin/mines", icon: Gem, roles: ["admin"] },
      { title: t("items"), url: "/admin/items", icon: Pickaxe, roles: ["admin"] },
    ],
  },
];

export const getSettingsItem = (t: (key: string) => string): MenuItem => ({
  title: t("settings"),
  url: "/settings",
  icon: Settings,
  roles: ["admin", "manager", "member"],
});