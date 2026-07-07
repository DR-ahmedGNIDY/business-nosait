"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { EXPENSE_CATEGORY, PAYMENT_METHOD } from "@/lib/constants";

export function ExpenseForm({ action }: { action: (fd: FormData) => Promise<{ error?: string; ok?: boolean } | void> }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <Card>
      <CardContent className="pt-6">
        <form
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6 lg:items-end"
          action={(fd) => start(async () => {
            const r = await action(fd);
            if (r?.error) toast.error(r.error);
            else { toast.success("Expense added"); router.refresh(); (document.getElementById("exp-form") as HTMLFormElement)?.reset(); }
          })}
          id="exp-form"
        >
          <div className="lg:col-span-2"><Label>Title</Label><Input name="title" required placeholder="e.g. Server hosting" /></div>
          <div><Label>Category</Label><Select name="category">{EXPENSE_CATEGORY.map((c) => <option key={c} value={c}>{c}</option>)}</Select></div>
          <div><Label>Amount</Label><Input name="amount" type="number" min="0" step="0.01" required /></div>
          <div><Label>Method</Label><Select name="method">{PAYMENT_METHOD.map((m) => <option key={m} value={m}>{m}</option>)}</Select></div>
          <div><Label>Date</Label><Input name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} /></div>
          <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-5">
            <label className="flex items-center gap-2"><input type="checkbox" name="recurring" className="h-4 w-4" /><span className="text-sm">Recurring</span></label>
          </div>
          <Button type="submit" disabled={pending} className="lg:col-span-1"><Plus className="h-4 w-4" /> {pending ? "Adding…" : "Add"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
