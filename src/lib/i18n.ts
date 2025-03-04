"use client";

import { createTranslator } from "next-intl";

import enMessages from "@/locales/en.json";
import viMessages from "@/locales/vi.json";

const messages = {
  en: enMessages,
  vi: viMessages,
};

export function getTranslator(locale: "en" | "vi") {
  return createTranslator({ locale, messages: messages[locale] });
}
