"use client";

import { NextIntlClientProvider } from "next-intl";
import { createContext, useContext, useEffect, useState } from "react";

// Định nghĩa kiểu cho messages
type Messages = Record<string, string>;

interface LocaleContextType {
  locale: string;
  changeLocale: (newLocale: string) => void;
}

const LocaleContext = createContext<LocaleContextType>({
  locale: "en",
  changeLocale: (_newLocale: string) => {}, // Thêm _ để bỏ qua newLocale
});

export function useLocale() {
  return useContext(LocaleContext);
}

export default function LocaleProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [locale, setLocale] = useState("en"); // Mặc định là "en"
  const [messages, setMessages] = useState<Messages | null>(null);
  const [loading, setLoading] = useState(true); // Thêm state loading

  useEffect(() => {
    const savedLocale = localStorage.getItem("locale") || "en";
    setLocale(savedLocale);
    loadMessages(savedLocale);
  }, []);

  const loadMessages = async (lang: string) => {
    setLoading(true); // Bắt đầu tải
    try {
      const moduli = await import(`@/locales/${lang}.json`);
      setMessages(moduli.default);
    } catch (error) {
      console.error("Error loading locale:", error);
    } finally {
      setLoading(false); // Kết thúc tải
    }
  };

  const changeLocale = (newLocale: string) => {
    localStorage.setItem("locale", newLocale);
    setLocale(newLocale);
    loadMessages(newLocale);
  };

  if (loading || !messages) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce delay-75"></div>
          <div className="w-3 h-3 bg-gray-500 rounded-full animate-bounce delay-150"></div>
          <div className="w-3 h-3 bg-gray-600 rounded-full animate-bounce delay-300"></div>
        </div>
      </div>
    );
  }

  return (
    <LocaleContext.Provider value={{ locale, changeLocale }}>
      <NextIntlClientProvider messages={messages} locale={locale}>
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}