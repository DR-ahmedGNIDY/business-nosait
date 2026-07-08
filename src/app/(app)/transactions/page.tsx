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
import { TransactionRowActions } from "@/components/transactions/row-actions";
import { ExportMenu } from "@/components/export-menu";
import { createTransaction, deleteTransaction } from "./actions";
import { getT } from "@/lib/i18n-server";
import { PAYMENT_METHOD, TRANSACTION_STATUS, label } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import { periodRange } from "@/lib/date-range";

export const dynamic = "force-dynamic";

export default async function TransactionsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  const { t, locale } = await getT();
  await connectDB();

  const filter: any = { deletedAt: null };
  if (sp.q) {
    const rx = new RegExp(sp.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ title: rx }, { referenceNumber: rx }, { note: rx }];
  }
  if (sp.method) filter.method = sp.method;
  if (sp.source) filter.source = sp.source;
  if (sp.status) filter.status = sp.status;
  if (sp.clientId) filter.clientId = sp.clientId;
  if (sp.projectId) filter.projectId = sp.projectId;
  if (sp.subscriptionId) filter.subscriptionId = sp.subscriptionId;
  const range = periodRange(sp.period);
  if (range) filter.date = { $gte: range.from, $lte: range.to };

  const [txns, completedAll, clients, projects, subscriptions] = await Promise.all([
    Transaction.find(filter).sort({ date: -1 })
      .populate("clientId", "name").populate("projectId", "title").populate("subscriptionId", "title").lean(),
    Transaction.find({ status: "completed", deletedAt: null }).lean(),
    Client.find().select("name").sort({ name: 1 }).lean(),
    Project.find().select("title clientId price paidAmount remainingAmount").lean(),
    Subscription.find().select("title clientId amount renewalDate status collected").lean(),
  ]);

  const total = completedAll.reduce((s, t: any) => s + t.amount, 0);
  const byMethod = PAYMENT_METHOD.map((m) => ({ m, total: completedAll.filter((t: any) => t.method === m).reduce((s, t: any) => s + t.amount, 0) }));

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title={t("transactions.title")} subtitle={t("transactions.subtitle")}>
        <ExportMenu entity="transactions" params={sp} />
      </PageHeader>

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
          { name: "period", label: t("common.allTime"), options: [
            { value: "today", label: t("period.today") },
            { value: "week", label: t("period.week") },
            { value: "month", label: t("period.month") },
            { value: "year", label: t("period.year") },
          ] },
          { name: "status", label: t("common.allStatuses"), options: TRANSACTION_STATUS.map((s) => ({ value: s, label: label(s, locale) })) },
          { name: "method", label: t("common.allMethods"), options: PAYMENT_METHOD.map((m) => ({ value: m, label: label(m, locale) })) },
          { name: "source", label: t("common.allSources"), options: [{ value: "project", label: label("project", locale) }, { value: "subscription", label: label("subscription", locale) }, { value: "manual", label: label("manual", locale) }] },
          { name: "clientId", label: t("common.allClients"), options: (clients as any[]).map((c) => ({ value: String(c._id), label: c.name })) },
        ]}
      />

      {txns.length === 0 ? (
        <EmptyState icon={<ArrowDownToLine className="h-5 w-5" />} title={t("transactions.empty")} description={t("transactions.emptyDesc")} />
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <THead><TR>
              <TH>{t("transactions.reference")}</TH>
              <TH>{t("common.date")}</TH>
              <TH>{t("common.client")}</TH>
              <TH>{t("transactions.linkedTo")}</TH>
              <TH>{t("common.amount")}</TH>
              <TH>{t("common.status")}</TH>
              <TH>{t("common.method")}</TH>
              <TH>{t("transactions.createdBy")}</TH>
              <TH>{t("common.note")}</TH>
              <TH></TH>
            </TR></THead>
            <tbody>
              {txns.map((tx: any) => (
                <TR key={tx._id}>
                  <TD className="font-mono text-xs">{tx.referenceNumber || "—"}</TD>
                  <TD>{formatDate(tx.date)}</TD>
                  <TD className="text-muted-foreground">{tx.clientId?.name || "—"}</TD>
                  <TD>
                    {tx.projectId?.title || tx.subscriptionId?.title || "—"}
                    <Badge tone={tx.source === "subscription" ? "success" : tx.source === "project" ? "primary" : "muted"} className="ms-2">{label(tx.source, locale)}</Badge>
                  </TD>
                  <TD className="font-semibold text-success">{formatCurrency(tx.amount)}</TD>
                  <TD><Badge tone={(tx.status || "completed") === "completed" ? "success" : tx.status === "pending" ? "warning" : "danger"}>{label(tx.status || "completed", locale)}</Badge></TD>
                  <TD>{label(tx.method, locale)}</TD>
                  <TD className="text-xs text-muted-foreground">{tx.createdBy || "—"}</TD>
                  <TD className="text-muted-foreground"><span className="block max-w-[10rem] truncate" title={tx.note || ""}>{tx.note || "—"}</span></TD>
                  <TD className="text-end">
                    <TransactionRowActions id={String(tx._id)} deleteAction={deleteTransaction.bind(null, String(tx._id))} />
                  </TD>
                </TR>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
}
