"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RowDelete({ action }: { action: () => Promise<void> }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <Button variant="ghost" size="sm" className="text-danger" disabled={pending}
      onClick={() => start(async () => { await action(); toast.success("Deleted"); router.refresh(); })}>
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
