"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { dictionaries, translate, LOCALE_COOKIE, isRTL, type Locale, type TFunc } from "@/lib/i18n";

interface I18nContextValue {
  locale: Locale;
  t: TFunc;
  rtl: boolean;
  setLocale: (l: Locale) => void;
  toggle: () => void;
}

const I18nContext = React.createContext<I18nContextValue | null>(null);

export function I18nProvider({ initialLocale, children }: { initialLocale: Locale; children: React.ReactNode }) {
  const router = useRouter();
  const [locale, setLocaleState] = React.useState<Locale>(initialLocale);

  // Keep <html dir/lang> in sync on the client for instant RTL flipping.
  React.useEffect(() => {
    document.documentElement.dir = isRTL(locale) ? "rtl" : "ltr";
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = React.useCallback(
    (l: Locale) => {
      document.cookie = `${LOCALE_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
      setLocaleState(l); // instant switch for client components
      router.refresh(); // re-render server components in the new locale
    },
    [router]
  );

  const value = React.useMemo<I18nContextValue>(() => {
    const dict = dictionaries[locale];
    return {
      locale,
      rtl: isRTL(locale),
      t: (key, vars) => translate(dict, key, vars),
      setLocale,
      toggle: () => setLocale(locale === "ar" ? "en" : "ar"),
    };
  }, [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = React.useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

/** Convenience hook that returns just the translator. */
export function useT(): TFunc {
  return useI18n().t;
}
