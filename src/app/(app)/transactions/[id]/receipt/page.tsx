import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Transaction } from "@/models/Transaction";
import { Client } from "@/models/Client";
import { Project } from "@/models/Project";
import { Subscription } from "@/models/Subscription";
import { Settings } from "@/models/Settings";
import { PrintButton } from "@/components/transactions/print-button";
import { label } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) notFound();
  await connectDB();
  const tx = await Transaction.findOne({ _id: id, deletedAt: null }).lean<any>();
  if (!tx) notFound();
  const [client, project, subscription, settings] = await Promise.all([
    tx.clientId ? Client.findById(tx.clientId).lean<any>() : null,
    tx.projectId ? Project.findById(tx.projectId).lean<any>() : null,
    tx.subscriptionId ? Subscription.findById(tx.subscriptionId).lean<any>() : null,
    Settings.findOne().lean<any>(),
  ]);

  const biz = settings?.businessName || "Nosait Business";
  const currency = settings?.currency || "EGP";
  const row = (k: string, v: React.ReactNode) => (
    <div className="flex justify-between border-b border-dashed border-neutral-300 py-2 text-sm">
      <span className="text-neutral-500">{k}</span>
      <span className="font-medium text-neutral-900">{v}</span>
    </div>
  );

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-4 flex justify-end print:hidden"><PrintButton auto /></div>

      {/* Receipt sheet — always light for clean printing */}
      <div className="rounded-xl border border-neutral-200 bg-white p-8 text-neutral-900 shadow-soft print:border-0 print:shadow-none">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {settings?.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={settings.logo} alt={biz} className="h-12 w-12 rounded-lg object-contain" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#1877F2] text-lg font-bold text-white">N</div>
            )}
            <div>
              <p className="text-lg font-bold">{biz}</p>
              {settings?.email && <p className="text-xs text-neutral-500">{settings.email}</p>}
              {settings?.phone && <p className="text-xs text-neutral-500">{settings.phone}</p>}
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-neutral-400">Receipt</p>
            <p className="font-mono text-sm font-semibold">{tx.referenceNumber || "—"}</p>
          </div>
        </div>

        <div className="mb-6 rounded-lg bg-neutral-50 p-4 text-center">
          <p className="text-xs uppercase tracking-wide text-neutral-400">Amount Paid</p>
          <p className="text-3xl font-extrabold text-[#1877F2]">{formatCurrency(tx.amount, currency)}</p>
          <p className="mt-1 text-xs capitalize text-neutral-500">{label(tx.status, "en")} · {label(tx.method, "en")}</p>
        </div>

        <div className="space-y-0">
          {row("Client", client?.name || "—")}
          {project && row("Project", project.title)}
          {subscription && row("Subscription", subscription.title)}
          {row("Payment Method", label(tx.method, "en"))}
          {row("Date", formatDate(tx.date))}
          {row("Received By", tx.createdBy || "—")}
          {tx.note && row("Notes", tx.note)}
        </div>

        <p className="mt-8 text-center text-xs text-neutral-400">
          Thank you for your business — {biz}
        </p>
      </div>
    </div>
  );
}
