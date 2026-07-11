import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { LOCALES, translations, type Locale } from "../i18n/translations";

const STORAGE_KEY = "admin-locale";

function detectLocale(): Locale {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && LOCALES.includes(stored as Locale)) return stored as Locale;

  for (const lang of navigator.languages ?? [navigator.language]) {
    const short = lang.slice(0, 2).toLowerCase();
    if (LOCALES.includes(short as Locale)) return short as Locale;
  }
  return "ru";
}

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(detectLocale);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale;
  }, [locale]);

  function t(key: string): string {
    return translations[locale][key] ?? translations.ru[key] ?? key;
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
