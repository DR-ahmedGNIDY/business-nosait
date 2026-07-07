"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, Select } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { CONTRACT_TEMPLATE, CONTRACT_STATUS } from "@/lib/constants";
import { CONTRACT_TEMPLATES } from "@/lib/contract-templates";

interface Props {
  action: (fd: FormData) => Promise<{ error?: string } | void>;
  clients: { _id: string; name: string }[];
  business?: string;
  defaults?: Record<string, any>;
  submitLabel?: string;
}

export function ContractForm({ action, clients, business, defaults = {}, submitLabel = "Create contract" }: Props) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [template, setTemplate] = useState(defaults.template || "website");
  const [title, setTitle] = useState(defaults.title || "");
  const [terms, setTerms] = useState(defaults.terms || "");
  const [value, setValue] = useState<number>(defaults.value ?? 0);
  const [advance, setAdvance] = useState<number>(defaults.advance ?? 0);
  const clientName = clients.find((c) => c._id === defaults.clientId)?.name;

  function applyTemplate(t: string) {
    setTemplate(t);
    const tpl = CONTRACT_TEMPLATES[t];
    if (tpl) {
      setTitle(tpl.title);
      setTerms(tpl.terms({ business, clientName, value, advance }));
    }
  }

  return (
    <form action={(fd) => start(async () => { setError(null); const r = await action(fd); if (r?.error) { setError(r.error); toast.error(r.error); } })}>
      <Card>
        <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
          <div>
            <Label>Template</Label>
            <Select name="template" value={template} onChange={(e) => applyTemplate(e.target.value)}>
              {CONTRACT_TEMPLATE.map((t) => (<option key={t} value={t}>{t}</option>))}
            </Select>
          </div>
          <div>
            <Label>Client *</Label>
            <Select name="clientId" defaultValue={defaults.clientId} required>
              <option value="">Select client…</option>
              {clients.map((c) => (<option key={c._id} value={c._id}>{c.name}</option>))}
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label>Title *</Label>
            <Input name="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <Label>Value</Label>
            <Input name="value" type="number" min="0" step="0.01" value={value} onChange={(e) => setValue(+e.target.value)} />
          </div>
          <div>
            <Label>Advance</Label>
            <Input name="advance" type="number" min="0" step="0.01" value={advance} onChange={(e) => setAdvance(+e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Label>Status</Label>
            <Select name="status" defaultValue={defaults.status || "draft"}>
              {CONTRACT_STATUS.map((s) => (<option key={s} value={s}>{s}</option>))}
            </Select>
          </div>
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between">
              <Label>Terms</Label>
              <button type="button" onClick={() => applyTemplate(template)} className="text-xs text-primary hover:underline">Regenerate from template</button>
            </div>
            <Textarea name="terms" value={terms} onChange={(e) => setTerms(e.target.value)} className="min-h-[280px] font-mono text-xs" />
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
