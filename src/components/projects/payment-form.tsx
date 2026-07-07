"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { PAYMENT_METHOD } from "@/lib/constants";
import { Plus } from "lucide-react";

export function PaymentForm({ action }: { action: (fd: FormData) => Promise<{ error?: string; ok?: boolean } | void> }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <form
      className="flex flex-wrap items-end gap-2"
      action={(fd) => start(async () => {
        const r = await action(fd);
        if (r?.error) toast.error(r.error);
        else { toast.success("Payment recorded"); router.refresh(); (document.getElementById("pay-amount") as HTMLInputElement).value = ""; }
      })}
    >
      <Input id="pay-amount" name="amount" type="number" min="1" step="0.01" placeholder="Amount" className="w-32" required />
      <Select name="method" className="w-40" defaultValue="cash">
        {PAYMENT_METHOD.map((m) => (<option key={m} value={m}>{m}</option>))}
      </Select>
      <Input name="note" placeholder="Note (optional)" className="w-40" />
      <Button type="submit" size="sm" disabled={pending}><Plus className="h-4 w-4" /> {pending ? "Adding…" : "Add payment"}</Button>
    </form>
  );
}
