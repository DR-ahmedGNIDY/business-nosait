"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  sidebarOpen: boolean;
  lang: "en" | "ar";
  toggleSidebar: () => void;
  setSidebar: (v: boolean) => void;
  setLang: (l: "en" | "ar") => void;
}

export const useUI = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      lang: "en",
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebar: (v) => set({ sidebarOpen: v }),
      setLang: (l) => set({ lang: l }),
    }),
    { name: "nosait-ui" }
  )
);
