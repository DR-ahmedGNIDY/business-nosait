import en from "@/locales/en.json";
import ar from "@/locales/ar.json";

export type Locale = "en" | "ar";
export const LOCALES: Locale[] = ["en", "ar"];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "NEXT_LOCALE";

export const dictionaries = { en, ar } as const;
export type Dict = typeof en;

export function isRTL(locale: Locale) {
  return locale === "ar";
}

/**
 * Translate a dotted key against a dictionary, interpolating {vars}.
 * Falls back to the key itself if the path is missing.
 */
export function translate(dict: Dict, key: string, vars?: Record<string, string | number>): string {
  const raw = key.split(".").reduce<unknown>((obj, part) => {
    if (obj && typeof obj === "object" && part in (obj as Record<string, unknown>)) {
      return (obj as Record<string, unknown>)[part];
    }
    return undefined;
  }, dict);

  if (typeof raw !== "string") return key;
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (_, name) => (name in vars ? String(vars[name]) : `{${name}}`));
}

export type TFunc = (key: string, vars?: Record<string, string | number>) => string;
