"use client";

import { useLocale } from "@/context/LocaleProvider";

export default function LanguageSwitcher() {
  const { locale, changeLocale } = useLocale();

  return (
    <div className="flex gap-4">
      <button
        className={`px-4 py-2 rounded ${locale === "en" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        onClick={() => changeLocale("en")}
      >
        English
      </button>
      <button
        className={`px-4 py-2 rounded ${locale === "vi" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        onClick={() => changeLocale("vi")}
      >
        Tiếng Việt
      </button>
    </div>
  );
}
