"use client";

import { useEffect } from "react";
import { useUI } from "@/lib/store";

/** Applies RTL/LTR direction based on the selected language. */
export function AppShell({ children }: { children: React.ReactNode }) {
  const lang = useUI((s) => s.lang);

  useEffect(() => {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang]);

  return <div className="min-h-screen bg-surface">{children}</div>;
}
