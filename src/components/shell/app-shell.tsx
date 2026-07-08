"use client";

/**
 * Layout wrapper for the authenticated app. Direction (LTR/RTL) is managed
 * globally by I18nProvider, so this just provides the surface background.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-surface">{children}</div>;
}
