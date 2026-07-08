"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { PAYMENT_METHOD, TRANSACTION_STATUS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";

type Client = { _id: string; name: string };
type ProjectRef = { _id: string; title: string; clientId: string; price: number; paidAmount: number; remainingAmount: number };
type SubscriptionRef = { _id: string; title: string; clientId: string; amount: number; renewalDate: string; status: string; collected: boolean };

export function TransactionForm({
  action, clients, projects, subscriptions,
}: {
  action: (fd: FormData) => Promise<{ error?: string; ok?: boolean } | void>;
  clients: Client[];
  projects: ProjectRef[];
  subscriptions: SubscriptionRef[];
}) {
  const [pending, start] = useTransition();
  const router = useRouter();

  const [source, setSource] = useState<"project" | "subscription">("project");
  const [clientId, setClientId] = useState("");
  const [objectId, setObjectId] = useState("");

  // Step 3 — options scoped to the chosen client + source.
  const clientProjects = useMemo(() => projects.filter((p) => String(p.clientId) === clientId), [projects, clientId]);
  const clientSubs = useMemo(() => subscriptions.filter((s) => String(s.clientId) === clientId), [subscriptions, clientId]);

  // Step 4 — details of the selected object.
  const selProject = source === "project" ? clientProjects.find((p) => p._id === objectId) : undefined;
  const selSub = source === "subscription" ? clientSubs.find((s) => s._id === objectId) : undefined;

  const defaultTitle = selProject ? `Payment — ${selProject.title}` : selSub ? `Subscription — ${selSub.title}` : "";
  const canSubmit = !!clientId && !!objectId;

  function reset() {
    setObjectId("");
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form
          id="txn-form"
          className="space-y-4"
          action={(fd) => start(async () => {
            const r = await action(fd);
            if (r?.error) toast.error(r.error);
            else { toast.success("Transaction recorded"); reset(); router.refresh(); }
          })}
        >
          <input type="hidden" name="source" value={source} />
          <input type="hidden" name="clientId" value={clientId} />
          {source === "project"
            ? <input type="hidden" name="projectId" value={objectId} />
            : <input type="hidden" name="subscriptionId" value={objectId} />}

          {/* Step 1 + 2 + 3 */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <Label>1 · Source</Label>
              <Select value={source} onChange={(e) => { setSource(e.target.value as any); setObjectId(""); }}>
                <option value="project">Project</option>
                <option value="subscription">Subscription</option>
              </Select>
            </div>
            <div>
              <Label>2 · Client</Label>
              <Select value={clientId} onChange={(e) => { setClientId(e.target.value); setObjectId(""); }}>
                <option value="">— Select client —</option>
                {clients.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </Select>
            </div>
            <div>
              <Label>3 · {source === "project" ? "Project" : "Subscription"}</Label>
              <Select value={objectId} onChange={(e) => setObjectId(e.target.value)} disabled={!clientId}>
                <option value="">{!clientId ? "Select a client first" : `— Select ${source} —`}</option>
                {source === "project"
                  ? clientProjects.map((p) => <option key={p._id} value={p._id}>{p.title}</option>)
                  : clientSubs.map((s) => <option key={s._id} value={s._id}>{s.title}</option>)}
              </Select>
            </div>
          </div>

          {/* Step 4 — auto-displayed details */}
          {selProject && (
            <div className="grid grid-cols-3 gap-3 rounded-md border border-border bg-muted/40 p-3 text-sm">
              <div><p className="text-xs text-muted-foreground">Project Total</p><p className="font-semibold">{formatCurrency(selProject.price)}</p></div>
              <div><p className="text-xs text-muted-foreground">Collected</p><p className="font-semibold text-success">{formatCurrency(selProject.paidAmount)}</p></div>
              <div><p className="text-xs text-muted-foreground">Outstanding</p><p className="font-semibold text-warning">{formatCurrency(selProject.remainingAmount)}</p></div>
            </div>
          )}
          {selSub && (
            <div className="grid grid-cols-3 gap-3 rounded-md border border-border bg-muted/40 p-3 text-sm">
              <div><p className="text-xs text-muted-foreground">Amount</p><p className="font-semibold">{formatCurrency(selSub.amount)}</p></div>
              <div><p className="text-xs text-muted-foreground">Renewal Date</p><p className="font-semibold">{formatDate(selSub.renewalDate)}</p></div>
              <div><p className="text-xs text-muted-foreground">Status</p><p className="font-semibold capitalize">{selSub.collected ? "collected" : selSub.status}</p></div>
            </div>
          )}

          {/* Payment details */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6 lg:items-end">
            <div className="lg:col-span-2"><Label>Title</Label><Input key={defaultTitle} name="title" required defaultValue={defaultTitle} placeholder="Incoming payment" /></div>
            <div><Label>Amount</Label><Input name="amount" type="number" min="0" step="0.01" required defaultValue={selSub?.amount || ""} /></div>
            <div><Label>Method</Label><Select name="method">{PAYMENT_METHOD.map((m) => <option key={m} value={m}>{m}</option>)}</Select></div>
            <div><Label>Status</Label><Select name="status" defaultValue="completed">{TRANSACTION_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}</Select></div>
            <div><Label>Date</Label><Input name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} /></div>
          </div>

          <Button type="submit" disabled={pending || !canSubmit}><Plus className="h-4 w-4" /> {pending ? "Adding…" : "Add transaction"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
