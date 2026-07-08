"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { signOut, useSession } from "next-auth/react";
import { Menu, Search, Moon, Sun, Languages, LogOut, User as UserIcon } from "lucide-react";
import { useUI } from "@/lib/store";
import { useI18n } from "@/components/i18n-provider";
import { Avatar } from "@/components/ui/misc";
import { NotificationsBell } from "./notifications-bell";
import { GlobalSearch } from "./global-search";

export function Header() {
  const { toggleSidebar } = useUI();
  const { locale, toggle, t } = useI18n();
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur lg:px-6 print:hidden">
      <button className="lg:hidden" onClick={toggleSidebar} aria-label="Menu">
        <Menu className="h-5 w-5" />
      </button>

      <button
        onClick={() => setSearchOpen(true)}
        className="flex h-9 w-full max-w-md items-center gap-2 rounded-md border border-border bg-surface px-3 text-sm text-muted-foreground transition-colors hover:border-primary/40"
      >
        <Search className="h-4 w-4" />
        <span>{t("header.searchPlaceholder")}</span>
      </button>

      <div className="ms-auto flex items-center gap-1">
        <button
          onClick={toggle}
          className="flex h-9 items-center gap-1.5 rounded-md px-2.5 text-sm font-medium hover:bg-muted"
          title={t("common.toggleLanguage")}
        >
          <Languages className="h-[18px] w-[18px]" />
          {locale === "en" ? "العربية" : "EN"}
        </button>
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted"
          title={t("common.toggleTheme")}
        >
          <Sun className="h-[18px] w-[18px] dark:hidden" />
          <Moon className="hidden h-[18px] w-[18px] dark:block" />
        </button>

        <NotificationsBell />

        <div className="relative">
          <button onClick={() => setMenuOpen((v) => !v)} className="flex items-center gap-2 rounded-md p-1 hover:bg-muted">
            <Avatar name={session?.user?.name || "User"} src={session?.user?.image || undefined} className="h-8 w-8" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute z-20 mt-2 w-56 rounded-lg border border-border bg-popover p-1 shadow-pop ltr:right-0 rtl:left-0">
                <div className="border-b border-border px-3 py-2">
                  <p className="truncate text-sm font-medium">{session?.user?.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{session?.user?.email}</p>
                  <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium capitalize text-primary">
                    {(session?.user as { role?: string })?.role || "user"}
                  </span>
                </div>
                <a href="/settings" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted">
                  <UserIcon className="h-4 w-4" /> {t("nav.settings")}
                </a>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-danger hover:bg-danger/10"
                >
                  <LogOut className="h-4 w-4" /> {t("common.signOut")}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {searchOpen && <GlobalSearch onClose={() => setSearchOpen(false)} />}
    </header>
  );
}
