"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Check, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const run = (fn: () => Promise<any>, msg: string) => start(async () => {
    const r = await fn();
    if (r?.error) toast.error(r.error);
    else { toast.success(msg); router.refresh(); }
  });

  return (
    <div className="flex justify-end gap-1">
      {!collected && (
        <Button variant="outline" size="sm" disabled={pending} onClick={() => run(onCollect, "Marked collected")}>
          <Check className="h-4 w-4" /> Collect
        </Button>
      )}
      <Button variant="outline" size="sm" disabled={pending} onClick={() => run(onRenew, "Renewed")}>
        <RefreshCw className="h-4 w-4" /> Renew
      </Button>
      <Button variant="ghost" size="sm" className="text-danger" disabled={pending}
        onClick={() => start(async () => { await onDelete(); toast.success("Deleted"); router.refresh(); })}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
