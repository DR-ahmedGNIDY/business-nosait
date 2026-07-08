"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { LABELS } from "@/lib/constants";
import { useI18n } from "@/components/i18n-provider";

const toneClasses: Record<string, string> = {
  success: "bg-success/10 text-success ring-success/20",
  warning: "bg-warning/10 text-warning ring-warning/20",
  danger: "bg-danger/10 text-danger ring-danger/20",
  accent: "bg-accent/10 text-accent ring-accent/20",
  muted: "bg-muted text-muted-foreground ring-border",
  primary: "bg-primary/10 text-primary ring-primary/20",
};

export function Badge({
  children,
  tone = "muted",
  className,
}: {
  children: React.ReactNode;
  tone?: keyof typeof toneClasses;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        toneClasses[tone] || toneClasses.muted,
        className
      )}
    >
      {children}
    </span>
  );
}

/** Status badge that reads tone + localized label from the shared LABELS map. */
export function StatusBadge({ status }: { status: string }) {
  const { locale } = useI18n();
  const meta = LABELS[status];
  const tone = (meta?.tone as keyof typeof toneClasses) || "muted";
  return <Badge tone={tone}>{meta?.[locale] || status}</Badge>;
}
