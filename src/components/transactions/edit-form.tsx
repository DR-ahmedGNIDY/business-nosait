"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { PAYMENT_METHOD, TRANSACTION_STATUS } from "@/lib/constants";

type Tx = { title: string; amount: number; method: string; status: string; date: string; note?: string };

export function EditTransactionForm({ tx, action }: { tx: Tx; action: (fd: FormData) => Promise<{ error?: string; ok?: boolean } | void> }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <Card>
      <CardContent className="pt-6">
        <form
          className="grid gap-3 sm:grid-cols-2"
          action={(fd) => start(async () => {
            const r = await action(fd);
            if (r?.error) toast.error(r.error);
            else { toast.success("Transaction updated"); router.push("/transactions"); router.refresh(); }
          })}
        >
          <div className="sm:col-span-2"><Label>Title</Label><Input name="title" required defaultValue={tx.title} /></div>
          <div><Label>Amount</Label><Input name="amount" type="number" min="0" step="0.01" required defaultValue={tx.amount} /></div>
          <div><Label>Method</Label><Select name="method" defaultValue={tx.method}>{PAYMENT_METHOD.map((m) => <option key={m} value={m}>{m}</option>)}</Select></div>
          <div><Label>Status</Label><Select name="status" defaultValue={tx.status}>{TRANSACTION_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}</Select></div>
          <div><Label>Date</Label><Input name="date" type="date" defaultValue={tx.date} /></div>
          <div className="sm:col-span-2"><Label>Note</Label><Input name="note" defaultValue={tx.note || ""} /></div>
          <div className="sm:col-span-2"><Button type="submit" disabled={pending}><Save className="h-4 w-4" /> {pending ? "Saving…" : "Save changes"}</Button></div>
        </form>
      </CardContent>
    </Card>
  );
}
