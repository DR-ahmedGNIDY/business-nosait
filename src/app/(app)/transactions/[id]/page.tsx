import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Printer, ArrowLeft } from "lucide-react";
import { connectDB } from "@/lib/db";
import { Transaction } from "@/models/Transaction";
import { Client } from "@/models/Client";
import { Project } from "@/models/Project";
import { Subscription } from "@/models/Subscription";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getT } from "@/lib/i18n-server";
import { label } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TransactionDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { t, locale } = await getT();
  await connectDB();
  const tx = await Transaction.findOne({ _id: id, deletedAt: null }).lean<any>();
  if (!tx) notFound();
  const [client, project, subscription] = await Promise.all([
    tx.clientId ? Client.findById(tx.clientId).lean<any>() : null,
    tx.projectId ? Project.findById(tx.projectId).lean<any>() : null,
    tx.subscriptionId ? Subscription.findById(tx.subscriptionId).lean<any>() : null,
  ]);

  const rows: [string, any][] = [
    [t("transactions.reference"), <span key="ref" className="font-mono">{tx.referenceNumber || "—"}</span>],
    [t("common.title"), tx.title],
    [t("common.amount"), <span key="amt" className="font-semibold text-success">{formatCurrency(tx.amount)}</span>],
    [t("common.status"), <Badge key="st" tone={tx.status === "completed" ? "success" : tx.status === "pending" ? "warning" : "danger"}>{label(tx.status, locale)}</Badge>],
    [t("transactions.source"), <Badge key="src" tone="primary">{label(tx.source, locale)}</Badge>],
    ["Type", label(tx.type || "income", locale)],
    [t("common.method"), label(tx.method, locale)],
    [t("common.client"), client?.name || "—"],
    [t("nav.projects"), project?.title || "—"],
    ["Subscription", subscription?.title || "—"],
    [t("common.date"), formatDate(tx.date)],
    [t("transactions.createdBy"), tx.createdBy || "—"],
    [t("common.note"), tx.note || "—"],
  ];

  return (
    <div className="animate-fade-in mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/transactions"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /> {t("common.back")}</Button></Link>
        <div className="flex gap-2">
          <Link href={`/transactions/${id}/edit`}><Button variant="outline" size="sm"><Pencil className="h-4 w-4" /> {t("common.edit")}</Button></Link>
          <Link href={`/transactions/${id}/receipt`} target="_blank"><Button size="sm"><Printer className="h-4 w-4" /> {t("transactions.printReceipt")}</Button></Link>
        </div>
      </div>
      <Card>
        <CardContent className="divide-y divide-border p-0">
          {rows.map(([k, v], i) => (
            <div key={i} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
              <span className="text-muted-foreground">{k}</span>
              <span className="text-end font-medium">{v}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
