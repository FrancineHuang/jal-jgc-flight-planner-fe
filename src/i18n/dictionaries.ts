import ja from "./messages/ja.json";
import en from "./messages/en.json";
import zh from "./messages/zh.json";
import type { Locale } from "./locale-store";

export type MessageKey = keyof typeof ja;
export type Messages = Record<MessageKey, string>;
export type Translator = (key: MessageKey, values?: Record<string, string | number>) => string;

export const dictionaries: Record<Locale, Messages> = { ja, en, zh };
export const languageTags: Record<Locale, string> = { ja: "ja", en: "en", zh: "zh-Hans" };
export const localeNames: Record<Locale, string> = { ja: "日本語", en: "English", zh: "简体中文" };

export function createTranslator(messages: Messages): Translator {
  return (key, values) => messages[key].replace(/\{(\w+)\}/g, (placeholder, name: string) => String(values?.[name] ?? placeholder));
}
