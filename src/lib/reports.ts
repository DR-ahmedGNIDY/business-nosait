import { connectDB } from "./db";
import { Project } from "@/models/Project";
import { Subscription } from "@/models/Subscription";
import { Expense } from "@/models/Expense";
import { Client } from "@/models/Client";
import { Contract } from "@/models/Contract";
import { daysUntil } from "./utils";

export async function getReportData() {
  await connectDB();
  const [projects, subs, expenses, clients, contracts] = await Promise.all([
    Project.find().populate("clientId", "name").lean(),
    Subscription.find().populate("clientId", "name").lean(),
    Expense.find().lean(),
    Client.find().lean(),
    Contract.find().lean(),
  ]);

  // Top clients by collected project revenue.
  const clientTotals: Record<string, { name: string; collected: number; projects: number }> = {};
  for (const p of projects as any[]) {
    const cid = String(p.clientId?._id || p.clientId);
    const name = p.clientId?.name || "Unknown";
    if (!clientTotals[cid]) clientTotals[cid] = { name, collected: 0, projects: 0 };
    clientTotals[cid].collected += p.paidAmount || 0;
    clientTotals[cid].projects += 1;
  }
  const topClients = Object.values(clientTotals).sort((a, b) => b.collected - a.collected).slice(0, 10);

  const outstanding = (projects as any[])
    .filter((p) => (p.remainingAmount || 0) > 0)
    .map((p) => ({ title: p.title, client: p.clientId?.name || "—", remaining: p.remainingAmount }))
    .sort((a, b) => b.remaining - a.remaining);

  const upcomingRenewals = (subs as any[])
    .map((s) => ({ title: s.title, client: s.clientId?.name || "—", amount: s.amount, renewalDate: s.renewalDate, days: daysUntil(s.renewalDate) }))
    .filter((s) => s.days !== null && s.days >= 0 && s.days <= 60)
    .sort((a, b) => (a.days || 0) - (b.days || 0));

  return {
    projectsCollected: (projects as any[]).reduce((s, p) => s + (p.paidAmount || 0), 0),
    projectsBilled: (projects as any[]).reduce((s, p) => s + (p.price || 0), 0),
    subsCollected: (subs as any[]).filter((s) => s.collected).reduce((a, s) => a + s.amount, 0),
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
