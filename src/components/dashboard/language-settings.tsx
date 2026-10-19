"use client";

import { useEffect, useRef } from "react";
import { useI18n } from "@/i18n/locale-provider";
import { localeNames } from "@/i18n/dictionaries";
import { Icon } from "@/components/ui/icon";
import "./language-settings.css";

export function LanguageSettings() {
  const { locale, setLocale, t } = useI18n();
  const menu = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      if (menu.current && !menu.current.contains(event.target as Node)) menu.current.open = false;
    };
    const closeEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && menu.current?.open) {
        menu.current.open = false;
        menu.current.querySelector("summary")?.focus();
      }
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeEscape);
    };
  }, []);

  return <details ref={menu} className="locale-settings" data-language-menu>
    <summary aria-label={t("language.settings")}>
      <Icon name="language" size={18} />
      <span className="locale-label">{t("language.settings")}</span>
      <span className="locale-current">{localeNames[locale]}</span>
      <Icon name="chevron" size={12} className="locale-chevron" />
    </summary>
    <fieldset className="locale-options" data-language-options>
      <legend className="sr-only">{t("language.choose")}</legend>
      {(["ja", "en", "zh"] as const).map((option) => <label key={option} lang={option === "zh" ? "zh-Hans" : option}>
        <input type="radio" name="locale" value={option} checked={locale === option} onChange={() => {
          setLocale(option);
          if (menu.current) {
            menu.current.open = false;
            menu.current.querySelector("summary")?.focus();
          }
        }} />
        <span>{localeNames[option]}</span>
        {locale === option && <Icon name="check" size={15} />}
      </label>)}
    </fieldset>
  </details>;
}
