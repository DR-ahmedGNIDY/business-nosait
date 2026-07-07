import { ArrowDownToLine, Wallet } from "lucide-react";
import { connectDB } from "@/lib/db";
import { Transaction } from "@/models/Transaction";
import { Client } from "@/models/Client";
import { PageHeader, EmptyState } from "@/components/ui/misc";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Table, THead, TR, TH, TD } from "@/components/ui/table";
import { ListToolbar } from "@/components/list-toolbar";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { RowDelete } from "@/components/row-delete";
import { createTransaction, deleteTransaction } from "./actions";
import { PAYMENT_METHOD, label } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TransactionsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  await connectDB();
  const filter: any = {};
  if (sp.q) filter.title = new RegExp(sp.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  if (sp.method) filter.method = sp.method;
  if (sp.source) filter.source = sp.source;

  const [txns, all, clients] = await Promise.all([
    Transaction.find(filter).sort({ date: -1 }).populate("clientId", "name").lean(),
    Transaction.find().lean(),
    Client.find().select("name").sort({ name: 1 }).lean(),
  ]);

  const total = all.reduce((s, t: any) => s + t.amount, 0);
  const byMethod = PAYMENT_METHOD.map((m) => ({ m, total: all.filter((t: any) => t.method === m).reduce((s, t: any) => s + t.amount, 0) }));

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="Transactions" subtitle="All incoming money across payment methods." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard title="Total Incoming" value={total} icon={Wallet} tone="success" currency />
        {byMethod.map((b) => (
          <StatCard key={b.m} title={label(b.m)} value={b.total} icon={ArrowDownToLine} tone="primary" currency />
        ))}
      </div>

      <TransactionForm action={createTransaction} clients={JSON.parse(JSON.stringify(clients))} />

      <ListToolbar
        placeholder="Search transactions…"
        filters={[
          { name: "method", label: "All methods", options: PAYMENT_METHOD.map((m) => ({ value: m, label: label(m) })) },
          { name: "source", label: "All sources", options: [{ value: "project", label: "Project" }, { value: "subscription", label: "Subscription" }, { value: "other", label: "Other" }] },
        ]}
      />

      {txns.length === 0 ? (
        <EmptyState icon={<ArrowDownToLine className="h-5 w-5" />} title="No transactions" description="Record incoming money above." />
      ) : (
        <Table>
          <THead><TR><TH>Title</TH><TH>Client</TH><TH>Source</TH><TH>Method</TH><TH>Amount</TH><TH>Date</TH><TH></TH></TR></THead>
          <tbody>
            {txns.map((t: any) => (
              <TR key={t._id}>
                <TD className="font-medium">{t.title}</TD>
                <TD className="text-muted-foreground">{t.clientId?.name || "—"}</TD>
                <TD><Badge tone={t.source === "subscription" ? "success" : t.source === "project" ? "primary" : "muted"}>{t.source}</Badge></TD>
                <TD>{label(t.method)}</TD>
                <TD className="font-semibold text-success">{formatCurrency(t.amount)}</TD>
                <TD>{formatDate(t.date)}</TD>
                <TD className="text-end"><RowDelete action={deleteTransaction.bind(null, String(t._id))} /></TD>
              </TR>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
