import type { Locale } from "@/i18n/locale-store";

const intlLocales: Record<Locale, string> = { ja: "ja-JP", en: "en-GB", zh: "zh-CN" };
export const formatNumber = (value: number, locale: Locale = "ja") => new Intl.NumberFormat(intlLocales[locale], { maximumFractionDigits: 1 }).format(value);
export const formatJpy = (value: number, locale: Locale = "ja") => new Intl.NumberFormat(intlLocales[locale], { style: "currency", currency: "JPY", currencyDisplay: "narrowSymbol", maximumFractionDigits: 0 }).format(value);
export const formatDate = (value: string, locale: Locale = "ja") => new Intl.DateTimeFormat(intlLocales[locale], { day: "2-digit", month: locale === "en" ? "short" : "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
