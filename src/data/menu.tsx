import { Home, Command, Calendar, Settings } from "lucide-react";

export const getMenuItems = (t: (key: string) => string) => [
  { title: t("home"), url: "/", icon: Home },
  { title: t("about"), url: "/about", icon: Command },
  {
    id: "tools",
    label: t("tools"),
    defaultOpen: false,
    items: [{ title: t("tasks"), url: "/task", icon: Calendar }],
  },
];

export const getSettingsItem = (t: (key: string) => string) => ({
  title: t("settings"),
  url: "/settings",
  icon: Settings,
});
