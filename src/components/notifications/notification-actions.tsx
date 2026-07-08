"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/components/i18n-provider";
import { markAllRead, clearRead } from "@/app/(app)/notifications/actions";

export function NotificationActions({ hasItems }: { hasItems: boolean }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  const t = useT();
  if (!hasItems) return null;
  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" disabled={pending} onClick={() => start(async () => { await markAllRead(); toast.success(t("notifications.markAllRead")); router.refresh(); })}>
        <Check className="h-4 w-4" /> {t("notifications.markAllRead")}
      </Button>
      <Button variant="outline" size="sm" className="text-danger" disabled={pending} onClick={() => start(async () => { await clearRead(); toast.success(t("notifications.clearRead")); router.refresh(); })}>
        <Trash2 className="h-4 w-4" /> {t("notifications.clearRead")}
      </Button>
    </div>
  );
}
