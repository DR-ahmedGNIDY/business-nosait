"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Check, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/components/i18n-provider";

export function SubRowActions({
  collected,
  onCollect,
  onRenew,
  onDelete,
}: {
  collected: boolean;
  onCollect: () => Promise<{ error?: string; ok?: boolean } | void>;
  onRenew: () => Promise<{ error?: string; ok?: boolean } | void>;
  onDelete: () => Promise<void>;
}) {
  const [pending, start] = useTransition();
  const router = useRouter();
  const t = useT();
  const run = (fn: () => Promise<any>, msg: string) => start(async () => {
    const r = await fn();
    if (r?.error) toast.error(r.error);
    else { toast.success(msg); router.refresh(); }
  });

  return (
    <div className="flex justify-end gap-1">
      {!collected && (
        <Button variant="outline" size="sm" disabled={pending} onClick={() => run(onCollect, t("subscriptions.collect"))}>
          <Check className="h-4 w-4" /> {t("subscriptions.collect")}
        </Button>
      )}
      <Button variant="outline" size="sm" disabled={pending} onClick={() => run(onRenew, t("subscriptions.renew"))}>
        <RefreshCw className="h-4 w-4" /> {t("subscriptions.renew")}
      </Button>
      <Button variant="ghost" size="sm" className="text-danger" disabled={pending}
        onClick={() => start(async () => { await onDelete(); toast.success(t("common.delete")); router.refresh(); })}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
