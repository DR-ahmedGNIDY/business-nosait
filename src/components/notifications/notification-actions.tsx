"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { markAllRead, clearRead } from "@/app/(app)/notifications/actions";

export function NotificationActions({ hasItems }: { hasItems: boolean }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  if (!hasItems) return null;
  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" disabled={pending} onClick={() => start(async () => { await markAllRead(); toast.success("All marked read"); router.refresh(); })}>
        <Check className="h-4 w-4" /> Mark all read
      </Button>
      <Button variant="outline" size="sm" className="text-danger" disabled={pending} onClick={() => start(async () => { await clearRead(); toast.success("Cleared read"); router.refresh(); })}>
        <Trash2 className="h-4 w-4" /> Clear read
      </Button>
    </div>
  );
}
