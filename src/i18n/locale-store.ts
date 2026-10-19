export type Locale = "ja" | "en" | "zh";
export const DEFAULT_LOCALE: Locale = "ja";
export const LOCALE_STORAGE_KEY = "jgc-planner.locale";
const CHANGE_EVENT = "jgc-planner:locale-change";
let memoryLocale: Locale = DEFAULT_LOCALE;

export function isLocale(value: unknown): value is Locale {
  return value === "ja" || value === "en" || value === "zh";
}

export function getLocale(): Locale {
  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    return isLocale(stored) ? stored : DEFAULT_LOCALE;
  } catch {
    // Remain usable when storage is unavailable (e.g. restricted browser settings).
    return memoryLocale;
  }
}

export function setLocale(locale: Locale) {
  memoryLocale = locale;
  try { window.localStorage.setItem(LOCALE_STORAGE_KEY, locale); } catch { /* Use memory for this session. */ }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribeLocale(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === LOCALE_STORAGE_KEY || event.key === null) onChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

// A stable Japanese snapshot keeps the prerendered HTML and hydration consistent.
export const getServerLocale = () => DEFAULT_LOCALE;
