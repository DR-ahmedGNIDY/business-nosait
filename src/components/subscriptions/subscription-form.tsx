"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { SUBSCRIPTION_TYPE, SUBSCRIPTION_STATUS } from "@/lib/constants";

interface Props {
  action: (fd: FormData) => Promise<{ error?: string } | void>;
  clients: { _id: string; name: string }[];
  defaults?: Record<string, any>;
  submitLabel?: string;
}

export function SubscriptionForm({ action, clients, defaults = {}, submitLabel = "Save subscription" }: Props) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form action={(fd) => start(async () => { setError(null); const r = await action(fd); if (r?.error) { setError(r.error); toast.error(r.error); } })}>
      <Card>
        <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Title / Service *</Label>
            <Input name="title" defaultValue={defaults.title} placeholder="e.g. Hosting — Cairo Retail" required />
          </div>
          <div>
            <Label>Client *</Label>
            <Select name="clientId" defaultValue={defaults.clientId} required>
              <option value="">Select client…</option>
              {clients.map((c) => (<option key={c._id} value={c._id}>{c.name}</option>))}
            </Select>
          </div>
          <div>
            <Label>Service type</Label>
            <Input name="service" defaultValue={defaults.service} placeholder="hosting / domain / maintenance" />
          </div>
          <div>
            <Label>Billing cycle</Label>
            <Select name="type" defaultValue={defaults.type || "yearly"}>
              {SUBSCRIPTION_TYPE.map((t) => (<option key={t} value={t}>{t}</option>))}
            </Select>
          </div>
          <div>
            <Label>Amount</Label>
            <Input name="amount" type="number" min="0" step="0.01" defaultValue={defaults.amount ?? 0} />
          </div>
          <div>
            <Label>Renewal date *</Label>
            <Input name="renewalDate" type="date" defaultValue={defaults.renewalDate ? new Date(defaults.renewalDate).toISOString().slice(0, 10) : ""} required />
          </div>
          <div>
            <Label>Status</Label>
            <Select name="status" defaultValue={defaults.status || "active"}>
              {SUBSCRIPTION_STATUS.map((s) => (<option key={s} value={s}>{s}</option>))}
            </Select>
          </div>
          <label className="flex items-center gap-2 sm:col-span-2">
            <input type="checkbox" name="collected" defaultChecked={defaults.collected} className="h-4 w-4 rounded border-input" />
            <span className="text-sm">Already collected</span>
          </label>
          {error && <p className="text-sm text-danger sm:col-span-2">{error}</p>}
          <div className="sm:col-span-2">
            <Button type="submit" disabled={pending}>{pending ? "Saving…" : submitLabel}</Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
