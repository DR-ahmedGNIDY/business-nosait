import { connectDB } from "./db";
import { Project } from "@/models/Project";
import { Subscription } from "@/models/Subscription";
import { Expense } from "@/models/Expense";
import { Client } from "@/models/Client";
import { Contract } from "@/models/Contract";
import { daysUntil } from "./utils";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * Core analytics. IMPORTANT business rule:
 * Subscriptions revenue is calculated SEPARATELY and is never folded into
 * project revenue. Net profit = collected project revenue + collected
 * subscription revenue - expenses.
 */
export async function getDashboardData() {
  await connectDB();

  const [projects, subscriptions, expenses, clientsCount, contracts] = await Promise.all([
    Project.find().lean(),
    Subscription.find().lean(),
    Expense.find().lean(),
    Client.countDocuments(),
    Contract.find().lean(),
  ]);

  // ---- Projects revenue (collected = sum of payments) ----
  const projectsBilled = projects.reduce((s, p: any) => s + (p.price || 0), 0);
  const projectsCollected = projects.reduce((s, p: any) => s + (p.paidAmount || 0), 0);
  const projectsOutstanding = projects.reduce((s, p: any) => s + (p.remainingAmount || 0), 0);

  // ---- Subscriptions revenue (SEPARATE) ----
  const subsCollected = subscriptions.filter((s: any) => s.collected).reduce((a, s: any) => a + (s.amount || 0), 0);
  const subsPending = subscriptions.filter((s: any) => !s.collected).reduce((a, s: any) => a + (s.amount || 0), 0);
  const subsAnnual = subscriptions.filter((s: any) => s.type === "yearly").reduce((a, s: any) => a + (s.amount || 0), 0);
  const subsMonthly = subscriptions.filter((s: any) => s.type === "monthly").reduce((a, s: any) => a + (s.amount || 0), 0);
  const subsExpired = subscriptions.filter((s: any) => s.status === "expired").length;

  // ---- Expenses ----
  const totalExpenses = expenses.reduce((s, e: any) => s + (e.amount || 0), 0);

  // ---- Net profit ----
  const netProfit = projectsCollected + subsCollected - totalExpenses;

  // ---- Monthly series (current year) ----
  const year = new Date().getFullYear();
  const monthly = MONTHS.map((m, i) => {
    const inMonth = (d?: Date) => d && new Date(d).getFullYear() === year && new Date(d).getMonth() === i;
    const projRev = projects.reduce((s, p: any) => s + (p.payments || []).filter((pay: any) => inMonth(pay.date)).reduce((a: number, pay: any) => a + pay.amount, 0), 0);
    const subRev = subscriptions.filter((sub: any) => sub.collected && inMonth(sub.updatedAt)).reduce((a, s: any) => a + s.amount, 0);
    const exp = expenses.filter((e: any) => inMonth(e.date)).reduce((a, e: any) => a + e.amount, 0);
    return { month: m, projects: projRev, subscriptions: subRev, expenses: exp, profit: projRev + subRev - exp };
  });

  // ---- Upcoming renewals (next 30 days) ----
  const upcomingRenewals = subscriptions
    .map((s: any) => ({ ...s, days: daysUntil(s.renewalDate) }))
    .filter((s) => s.days !== null && s.days >= 0 && s.days <= 30)
    .sort((a, b) => (a.days || 0) - (b.days || 0))
    .slice(0, 8);

  // ---- Expense breakdown by category ----
  const expenseByCategory = Object.entries(
    expenses.reduce((acc: Record<string, number>, e: any) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  // ---- Contracts overview ----
  const contractsByStatus = contracts.reduce((acc: Record<string, number>, c: any) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});

  return {
    kpis: {
      projectsBilled,
      projectsCollected,
      projectsOutstanding,
      subsCollected,
      subsPending,
      subsAnnual,
      subsMonthly,
      subsExpired,
      totalExpenses,
      netProfit,
      clientsCount,
      projectsCount: projects.length,
      subsCount: subscriptions.length,
      contractsCount: contracts.length,
    },
    monthly,
    upcomingRenewals: JSON.parse(JSON.stringify(upcomingRenewals)),
    expenseByCategory,
    contractsByStatus,
  };
}
