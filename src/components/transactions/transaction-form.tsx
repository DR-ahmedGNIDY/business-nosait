"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { PAYMENT_METHOD, TRANSACTION_STATUS } from "@/lib/constants";

export function TransactionForm({ action, clients }: { action: (fd: FormData) => Promise<{ error?: string; ok?: boolean } | void>; clients: { _id: string; name: string }[] }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <Card>
      <CardContent className="pt-6">
        <form id="txn-form" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7 lg:items-end"
          action={(fd) => start(async () => { const r = await action(fd); if (r?.error) toast.error(r.error); else { toast.success("Transaction recorded"); router.refresh(); (document.getElementById("txn-form") as HTMLFormElement)?.reset(); } })}>
          <div className="lg:col-span-2"><Label>Title</Label><Input name="title" required placeholder="Incoming payment" /></div>
          <div><Label>Amount</Label><Input name="amount" type="number" min="0" step="0.01" required /></div>
          <div><Label>Method</Label><Select name="method">{PAYMENT_METHOD.map((m) => <option key={m} value={m}>{m}</option>)}</Select></div>
          <div><Label>Source</Label><Select name="source"><option value="other">other</option><option value="project">project</option><option value="subscription">subscription</option></Select></div>
          <div><Label>Status</Label><Select name="status" defaultValue="completed">{TRANSACTION_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}</Select></div>
          <div><Label>Client</Label><Select name="clientId"><option value="">—</option>{clients.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}</Select></div>
          <div><Label>Date</Label><Input name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} /></div>
          <Button type="submit" disabled={pending}><Plus className="h-4 w-4" /> {pending ? "Adding…" : "Add"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
