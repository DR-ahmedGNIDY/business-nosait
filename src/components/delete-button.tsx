"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function DeleteButton({
  action,
  label = "Delete",
  message = "Are you sure? This cannot be undone.",
}: {
  action: () => Promise<{ error?: string } | void>;
  label?: string;
  message?: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [pending, start] = useTransition();

  if (!confirming) {
    return (
      <Button variant="outline" size="sm" onClick={() => setConfirming(true)} className="text-danger">
        <Trash2 className="h-4 w-4" /> {label}
      </Button>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">{message}</span>
      <Button variant="danger" size="sm" disabled={pending} onClick={() => start(async () => {
        const res = await action();
        if (res?.error) toast.error(res.error);
      })}>
        {pending ? "Deleting…" : "Confirm"}
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>Cancel</Button>
    </div>
  );
}
