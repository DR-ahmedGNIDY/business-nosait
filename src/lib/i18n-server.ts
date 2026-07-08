import { cookies } from "next/headers";
import { dictionaries, translate, DEFAULT_LOCALE, LOCALE_COOKIE, type Locale, type TFunc } from "./i18n";

/** Read the active locale from the cookie (server components / actions). */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return value === "ar" ? "ar" : DEFAULT_LOCALE;
}

/** Server-side translator bound to the request's locale. */
export async function getT(): Promise<{ locale: Locale; t: TFunc; rtl: boolean }> {
  const locale = await getLocale();
  const dict = dictionaries[locale];
  return { locale, t: (key, vars) => translate(dict, key, vars), rtl: locale === "ar" };
}
