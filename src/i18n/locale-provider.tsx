"use client";

import { createContext, useContext, useEffect, useMemo, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { createTranslator, dictionaries, languageTags } from "./dictionaries";
import type { Translator } from "./dictionaries";
import { getLocale, getServerLocale, setLocale, subscribeLocale } from "./locale-store";
import type { Locale } from "./locale-store";

const LocaleContext = createContext<{ locale: Locale; setLocale: typeof setLocale; t: Translator } | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(subscribeLocale, getLocale, getServerLocale);
  const t = useMemo(() => createTranslator(dictionaries[locale]), [locale]);
  useEffect(() => {
    document.documentElement.lang = languageTags[locale];
    const syncMetadata = () => {
      if (document.title !== t("meta.title")) document.title = t("meta.title");
      const description = document.querySelector('meta[name="description"]');
      if (description && description.getAttribute("content") !== t("meta.description")) {
        description.setAttribute("content", t("meta.description"));
      }
    };
    // Next.js can commit streamed metadata after hydration. Keep the saved locale
    // authoritative when that happens, without modifying the prerendered snapshot.
    syncMetadata();
    const observer = new MutationObserver(syncMetadata);
    observer.observe(document.head, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["content"] });
    return () => observer.disconnect();
  }, [locale, t]);
  return <LocaleContext.Provider value={{ locale, setLocale, t }}>{children}</LocaleContext.Provider>;
}

export function useI18n() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useI18n must be used within LocaleProvider");
  return context;
}
