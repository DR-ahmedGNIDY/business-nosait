import { connectDB } from "./db";
import { Project } from "@/models/Project";
import { Subscription } from "@/models/Subscription";
import { Expense } from "@/models/Expense";
import { Client } from "@/models/Client";
import { Contract } from "@/models/Contract";
import { Transaction } from "@/models/Transaction";
import { daysUntil } from "./utils";

export async function getReportData() {
  await connectDB();
  const [projects, subs, expenses, clients, contracts, transactions] = await Promise.all([
    Project.find().populate("clientId", "name").lean(),
    Subscription.find().populate("clientId", "name").lean(),
    Expense.find().lean(),
    Client.find().lean(),
    Contract.find().lean(),
    Transaction.find({ status: "completed", deletedAt: null }).lean(),
  ]);

  // Collected amounts are derived from completed transactions (single source of truth).
  const projectTxns = (transactions as any[]).filter((t) => t.source === "project");
  const collectedByProject: Record<string, number> = {};
  const collectedByClient: Record<string, number> = {};
  for (const t of projectTxns) {
    if (t.projectId) collectedByProject[String(t.projectId)] = (collectedByProject[String(t.projectId)] || 0) + (t.amount || 0);
    if (t.clientId) collectedByClient[String(t.clientId)] = (collectedByClient[String(t.clientId)] || 0) + (t.amount || 0);
  }

  // Top clients by collected project revenue.
  const clientTotals: Record<string, { name: string; collected: number; projects: number }> = {};
  for (const p of projects as any[]) {
    const cid = String(p.clientId?._id || p.clientId);
    const name = p.clientId?.name || "Unknown";
    if (!clientTotals[cid]) clientTotals[cid] = { name, collected: collectedByClient[cid] || 0, projects: 0 };
    clientTotals[cid].projects += 1;
  }
  const topClients = Object.values(clientTotals).sort((a, b) => b.collected - a.collected).slice(0, 10);

  const outstanding = (projects as any[])
    .map((p) => {
      const remaining = Math.max(0, (p.price || 0) - (collectedByProject[String(p._id)] || 0));
      return { title: p.title, client: p.clientId?.name || "—", remaining };
    })
    .filter((p) => p.remaining > 0)
    .sort((a, b) => b.remaining - a.remaining);

  const upcomingRenewals = (subs as any[])
    .map((s) => ({ title: s.title, client: s.clientId?.name || "—", amount: s.amount, renewalDate: s.renewalDate, days: daysUntil(s.renewalDate) }))
    .filter((s) => s.days !== null && s.days >= 0 && s.days <= 60)
    .sort((a, b) => (a.days || 0) - (b.days || 0));

  const projectsCollected = projectTxns.reduce((s, t) => s + (t.amount || 0), 0);
  const subsCollected = (transactions as any[]).filter((t) => t.source === "subscription").reduce((s, t) => s + (t.amount || 0), 0);

  return {
    projectsCollected,
    projectsBilled: (projects as any[]).reduce((s, p) => s + (p.price || 0), 0),
    subsCollected,
    subsTotal: (subs as any[]).reduce((a, s) => a + s.amount, 0),
    totalExpenses: (expenses as any[]).reduce((s, e) => s + e.amount, 0),
    clientsCount: clients.length,
    contractsSigned: (contracts as any[]).filter((c) => c.status === "signed").length,
    topClients,
    outstanding,
    upcomingRenewals,
  };
}

export function toCSV(rows: Record<string, any>[]): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n");
}
