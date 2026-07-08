"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Eye, Pencil, Trash2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TransactionRowActions({ id, deleteAction }: { id: string; deleteAction: () => Promise<{ error?: string; ok?: boolean } | void> }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <div className="flex items-center justify-end gap-1">
      <Link href={`/transactions/${id}`} title="View"><Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button></Link>
      <Link href={`/transactions/${id}/edit`} title="Edit"><Button variant="ghost" size="sm"><Pencil className="h-4 w-4" /></Button></Link>
      <Link href={`/transactions/${id}/receipt`} title="Print receipt" target="_blank"><Button variant="ghost" size="sm"><Printer className="h-4 w-4" /></Button></Link>
      {!confirming ? (
        <Button variant="ghost" size="sm" className="text-danger" title="Delete" onClick={() => setConfirming(true)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      ) : (
        <span className="flex items-center gap-1">
          <Button variant="danger" size="sm" disabled={pending} onClick={() => start(async () => {
            const r = await deleteAction();
            if (r?.error) { toast.error(r.error); setConfirming(false); }
            else { toast.success("Transaction deleted"); setConfirming(false); router.refresh(); }
          })}>{pending ? "…" : "Confirm"}</Button>
          <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>Cancel</Button>
        </span>
      )}
    </div>
  );
}
