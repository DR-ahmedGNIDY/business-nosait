import Link from "next/link";
import { Plus, RefreshCw, CalendarClock, CircleDollarSign, AlertTriangle } from "lucide-react";
import { connectDB } from "@/lib/db";
import { Subscription } from "@/models/Subscription";
import { PageHeader, EmptyState } from "@/components/ui/misc";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { StatusBadge, Badge } from "@/components/ui/badge";
import { Table, THead, TR, TH, TD } from "@/components/ui/table";
import { ListToolbar } from "@/components/list-toolbar";
import { SubRowActions } from "@/components/subscriptions/row-actions";
import { collectSubscription, renewSubscription, deleteSubscription } from "./actions";
import { SUBSCRIPTION_STATUS } from "@/lib/constants";
import { formatCurrency, formatDate, daysUntil } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SubscriptionsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  await connectDB();
  const filter: any = {};
  if (sp.q) filter.title = new RegExp(sp.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  if (sp.status) filter.status = sp.status;

  const subs = await Subscription.find(filter).sort({ renewalDate: 1 }).populate("clientId", "name").lean();
  const all = await Subscription.find().lean();

  const annual = all.filter((s: any) => s.type === "yearly").reduce((a, s: any) => a + s.amount, 0);
  const monthly = all.filter((s: any) => s.type === "monthly").reduce((a, s: any) => a + s.amount, 0);
  const collected = all.filter((s: any) => s.collected).reduce((a, s: any) => a + s.amount, 0);
  const pending = all.filter((s: any) => !s.collected).reduce((a, s: any) => a + s.amount, 0);
  const expiredCount = all.filter((s: any) => s.status === "expired").length;

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="Subscriptions" subtitle="Recurring services — calculated separately from project revenue.">
        <Link href="/subscriptions/new"><Button><Plus className="h-4 w-4" /> New subscription</Button></Link>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Annual Subscriptions" value={annual} icon={CalendarClock} tone="primary" currency />
        <StatCard title="Monthly Subscriptions" value={monthly} icon={RefreshCw} tone="accent" currency />
        <StatCard title="Collected" value={collected} icon={CircleDollarSign} tone="success" currency />
        <StatCard title="Pending" value={pending} icon={CircleDollarSign} tone="warning" currency />
        <StatCard title="Expired" value={expiredCount} icon={AlertTriangle} tone="danger" />
      </div>

      <ListToolbar placeholder="Search subscriptions…" filters={[{ name: "status", label: "All statuses", options: SUBSCRIPTION_STATUS.map((s) => ({ value: s, label: s })) }]} />

      {subs.length === 0 ? (
        <EmptyState icon={<RefreshCw className="h-5 w-5" />} title="No subscriptions" description="Track hosting, domains and maintenance renewals here."
          action={<Link href="/subscriptions/new"><Button><Plus className="h-4 w-4" /> New subscription</Button></Link>} />
      ) : (
        <Table>
          <THead><TR><TH>Service</TH><TH>Client</TH><TH>Cycle</TH><TH>Amount</TH><TH>Renewal</TH><TH>Collected</TH><TH>Status</TH><TH className="text-end">Actions</TH></TR></THead>
          <tbody>
            {subs.map((s: any) => {
              const d = daysUntil(s.renewalDate);
              return (
                <TR key={s._id}>
                  <TD className="font-medium">{s.title}</TD>
                  <TD className="text-muted-foreground">{s.clientId?.name || "—"}</TD>
                  <TD><Badge tone="accent">{s.type}</Badge></TD>
                  <TD>{formatCurrency(s.amount)}</TD>
                  <TD>
                    {formatDate(s.renewalDate)}
                    {d !== null && d >= 0 && d <= 30 && <Badge tone={d <= 3 ? "danger" : d <= 7 ? "warning" : "accent"} className="ms-2">{d}d</Badge>}
                  </TD>
                  <TD>{s.collected ? <Badge tone="success">Yes</Badge> : <Badge tone="warning">No</Badge>}</TD>
                  <TD><StatusBadge status={s.status} /></TD>
                  <TD>
                    <SubRowActions
                      collected={s.collected}
                      onCollect={collectSubscription.bind(null, String(s._id))}
                      onRenew={renewSubscription.bind(null, String(s._id))}
                      onDelete={deleteSubscription.bind(null, String(s._id))}
                    />
                  </TD>
                </TR>
              );
            })}
          </tbody>
        </Table>
      )}
    </div>
  );
}
