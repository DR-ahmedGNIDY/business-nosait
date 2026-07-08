import { ArrowDownToLine, Wallet } from "lucide-react";
import { connectDB } from "@/lib/db";
import { Transaction } from "@/models/Transaction";
import { Client } from "@/models/Client";
import { Project } from "@/models/Project";
import { Subscription } from "@/models/Subscription";
import { PageHeader, EmptyState } from "@/components/ui/misc";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Table, THead, TR, TH, TD } from "@/components/ui/table";
import { ListToolbar } from "@/components/list-toolbar";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { RowDelete } from "@/components/row-delete";
import { createTransaction, deleteTransaction } from "./actions";
import { getT } from "@/lib/i18n-server";
import { PAYMENT_METHOD, label } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TransactionsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  const { t, locale } = await getT();
  await connectDB();
  const filter: any = {};
  if (sp.q) filter.title = new RegExp(sp.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  if (sp.method) filter.method = sp.method;
  if (sp.source) filter.source = sp.source;

  const [txns, all, clients, projects, subscriptions] = await Promise.all([
    Transaction.find(filter).sort({ date: -1 }).populate("clientId", "name").lean(),
    Transaction.find().lean(),
    Client.find().select("name").sort({ name: 1 }).lean(),
    Project.find().select("title clientId price paidAmount remainingAmount").lean(),
    Subscription.find().select("title clientId amount renewalDate status collected").lean(),
  ]);

  // Only completed transactions count as collected money (matches dashboard analytics).
  const completed = all.filter((t: any) => (t.status || "completed") === "completed");
  const total = completed.reduce((s, t: any) => s + t.amount, 0);
  const byMethod = PAYMENT_METHOD.map((m) => ({ m, total: completed.filter((t: any) => t.method === m).reduce((s, t: any) => s + t.amount, 0) }));

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title={t("transactions.title")} subtitle={t("transactions.subtitle")} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard title={t("transactions.totalIncoming")} value={total} icon={Wallet} tone="success" currency />
        {byMethod.map((b) => (
          <StatCard key={b.m} title={label(b.m, locale)} value={b.total} icon={ArrowDownToLine} tone="primary" currency />
        ))}
      </div>

      <TransactionForm
        action={createTransaction}
        clients={JSON.parse(JSON.stringify(clients))}
        projects={JSON.parse(JSON.stringify(projects))}
        subscriptions={JSON.parse(JSON.stringify(subscriptions))}
      />

      <ListToolbar
        placeholder={t("transactions.searchPlaceholder")}
        filters={[
          { name: "method", label: t("common.allMethods"), options: PAYMENT_METHOD.map((m) => ({ value: m, label: label(m, locale) })) },
          { name: "source", label: t("common.allSources"), options: [{ value: "project", label: label("project", locale) }, { value: "subscription", label: label("subscription", locale) }, { value: "other", label: label("other", locale) }] },
        ]}
      />

      {txns.length === 0 ? (
        <EmptyState icon={<ArrowDownToLine className="h-5 w-5" />} title={t("transactions.empty")} description={t("transactions.emptyDesc")} />
      ) : (
        <Table>
          <THead><TR><TH>{t("common.title")}</TH><TH>{t("common.client")}</TH><TH>{t("transactions.source")}</TH><TH>{t("common.status")}</TH><TH>{t("common.method")}</TH><TH>{t("common.amount")}</TH><TH>{t("common.date")}</TH><TH></TH></TR></THead>
          <tbody>
            {txns.map((tx: any) => (
              <TR key={tx._id}>
                <TD className="font-medium">{tx.title}</TD>
                <TD className="text-muted-foreground">{tx.clientId?.name || "—"}</TD>
                <TD><Badge tone={tx.source === "subscription" ? "success" : tx.source === "project" ? "primary" : "muted"}>{label(tx.source, locale)}</Badge></TD>
                <TD><Badge tone={(tx.status || "completed") === "completed" ? "success" : tx.status === "pending" ? "warning" : "danger"}>{label(tx.status || "completed", locale)}</Badge></TD>
                <TD>{label(tx.method, locale)}</TD>
                <TD className="font-semibold text-success">{formatCurrency(tx.amount)}</TD>
                <TD>{formatDate(tx.date)}</TD>
                <TD className="text-end"><RowDelete action={deleteTransaction.bind(null, String(tx._id))} /></TD>
              </TR>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
