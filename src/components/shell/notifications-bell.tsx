"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Check } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDate } from "@/lib/utils";
import { useT } from "@/components/i18n-provider";

interface Notif {
  _id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();
  const t = useT();

  const { data } = useQuery<{ items: Notif[]; unread: number }>({
    queryKey: ["notifications"],
    queryFn: async () => (await fetch("/api/notifications")).json(),
    refetchInterval: 30_000,
  });

  const markAll = useMutation({
    mutationFn: async () => fetch("/api/notifications", { method: "PATCH" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const unread = data?.unread || 0;
  const items = data?.items || [];

  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)} className="relative flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted" title="Notifications">
        <Bell className="h-[18px] w-[18px]" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-2 w-80 rounded-lg border border-border bg-popover shadow-pop ltr:right-0 rtl:left-0">
            <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
              <p className="text-sm font-semibold">{t("notifications.title")}</p>
              {unread > 0 && (
                <button onClick={() => markAll.mutate()} className="flex items-center gap-1 text-xs text-primary hover:underline">
                  <Check className="h-3 w-3" /> {t("notifications.markAllRead")}
                </button>
              )}
            </div>
            <div className="scrollbar-thin max-h-96 overflow-y-auto">
              {items.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">{t("notifications.empty")}</p>
              ) : (
                items.map((n) => (
                  <Link
                    key={n._id}
                    href={n.link || "/notifications"}
                    onClick={() => setOpen(false)}
                    className={`block border-b border-border px-4 py-3 transition-colors hover:bg-muted ${!n.read ? "bg-primary/5" : ""}`}
                  >
                    <div className="flex items-start gap-2">
                      {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{n.title}</p>
                        <p className="truncate text-xs text-muted-foreground">{n.message}</p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground">{formatDate(n.createdAt)}</p>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
            <Link href="/notifications" onClick={() => setOpen(false)} className="block border-t border-border py-2 text-center text-xs font-medium text-primary hover:underline">
              {t("notifications.viewAll")}
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
