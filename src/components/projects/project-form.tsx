"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, Select } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { PROJECT_STATUS, PROJECT_CATEGORY } from "@/lib/constants";

interface Props {
  action: (formData: FormData) => Promise<{ error?: string } | void>;
  clients: { _id: string; name: string }[];
  defaults?: Record<string, any>;
  submitLabel?: string;
}

function toDateInput(v?: string) {
  return v ? new Date(v).toISOString().slice(0, 10) : "";
}

export function ProjectForm({ action, clients, defaults = {}, submitLabel = "Save project" }: Props) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form action={(fd) => start(async () => { setError(null); const r = await action(fd); if (r?.error) { setError(r.error); toast.error(r.error); } })}>
      <Card>
        <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Project title *</Label>
            <Input name="title" defaultValue={defaults.title} required />
          </div>
          <div>
            <Label>Client *</Label>
            <Select name="clientId" defaultValue={defaults.clientId} required>
              <option value="">Select client…</option>
              {clients.map((c) => (<option key={c._id} value={c._id}>{c.name}</option>))}
            </Select>
          </div>
          <div>
            <Label>Category</Label>
            <Select name="category" defaultValue={defaults.category || "website"}>
              {PROJECT_CATEGORY.map((c) => (<option key={c} value={c}>{c}</option>))}
            </Select>
          </div>
          <div>
            <Label>Price</Label>
            <Input name="price" type="number" min="0" step="0.01" defaultValue={defaults.price ?? 0} />
          </div>
          <div>
            <Label>Cost (for profitability)</Label>
            <Input name="cost" type="number" min="0" step="0.01" defaultValue={defaults.cost ?? 0} />
          </div>
          <div>
            <Label>Status</Label>
            <Select name="status" defaultValue={defaults.status || "pending"}>
              {PROJECT_STATUS.map((s) => (<option key={s} value={s}>{s}</option>))}
            </Select>
          </div>
          <div />
          <div>
            <Label>Start date</Label>
            <Input name="startDate" type="date" defaultValue={toDateInput(defaults.startDate)} />
          </div>
          <div>
            <Label>Delivery date</Label>
            <Input name="deliveryDate" type="date" defaultValue={toDateInput(defaults.deliveryDate)} />
          </div>
          <div className="sm:col-span-2">
            <Label>Description</Label>
            <Textarea name="description" defaultValue={defaults.description} />
          </div>
          {error && <p className="text-sm text-danger sm:col-span-2">{error}</p>}
          <div className="sm:col-span-2">
            <Button type="submit" disabled={pending}>{pending ? "Saving…" : submitLabel}</Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
