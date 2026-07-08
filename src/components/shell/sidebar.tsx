"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV, NAV_GROUPS } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { useUI } from "@/lib/store";
import { useT } from "@/components/i18n-provider";
import { X } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebar } = useUI();
  const t = useT();

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setSidebar(false)} />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 z-40 flex w-64 flex-col border-r border-border bg-card transition-transform duration-200 lg:translate-x-0",
          "ltr:left-0 rtl:right-0",
          sidebarOpen ? "translate-x-0" : "ltr:-translate-x-full rtl:translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-base font-bold text-white">N</div>
            <div className="leading-tight">
              <p className="text-sm font-bold">{t("brand.name")}</p>
              <p className="text-[10px] text-muted-foreground">{t("brand.tagline")}</p>
            </div>
          </Link>
          <button className="lg:hidden" onClick={() => setSidebar(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="scrollbar-thin flex-1 space-y-6 overflow-y-auto px-3 py-4">
          {NAV_GROUPS.map((group) => (
            <div key={group}>
              <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t(`nav.${group}`)}</p>
              <div className="space-y-0.5">
                {NAV.filter((n) => n.group === group).map((item) => {
                  const active = pathname === item.href || pathname.startsWith(item.href + "/");
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => window.innerWidth < 1024 && setSidebar(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        active ? "bg-primary text-primary-foreground shadow-soft" : "text-foreground/70 hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Icon className="h-[18px] w-[18px]" />
                      {t(`nav.${item.key}`)}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-border p-4">
          <div className="rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 p-3">
            <p className="text-xs font-semibold">{t("nav.premium")}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{t("nav.premiumSub")}</p>
          </div>
        </div>
      </aside>
    </>
  );
}
