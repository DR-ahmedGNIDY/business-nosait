import { connectDB } from "./db";
import { Project } from "@/models/Project";
import { Subscription } from "@/models/Subscription";
import { Expense } from "@/models/Expense";
import { Client } from "@/models/Client";
import { Contract } from "@/models/Contract";
import { Transaction } from "@/models/Transaction";
import { daysUntil } from "./utils";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * SINGLE SOURCE OF TRUTH for dashboard analytics.
 *
 * Business rules:
 *  - All collected revenue is derived from COMPLETED transactions only.
 *    Pending / cancelled / refunded transactions are ignored.
 *  - Project revenue and subscription revenue are calculated SEPARATELY
 *    (subscription revenue is never folded into project revenue).
 *  - Total revenue   = projects collected + subscriptions collected
 *  - Net profit      = total revenue - total expenses
 *  - Outstanding     = sum(project price) - projects collected
 */
export async function getDashboardData() {
  await connectDB();

  const [projects, subscriptions, expenses, clientsCount, contracts, transactions] = await Promise.all([
    Project.find().lean(),
    Subscription.find().lean(),
    Expense.find().lean(),
    Client.countDocuments(),
    Contract.find().lean(),
    Transaction.find({ status: "completed", deletedAt: null }).lean(),
  ]);

  // ---- Revenue from completed transactions (single source of truth) ----
  const projectsCollected = transactions
    .filter((t: any) => t.source === "project")
    .reduce((s, t: any) => s + (t.amount || 0), 0);
  const subsCollected = transactions
    .filter((t: any) => t.source === "subscription")
    .reduce((s, t: any) => s + (t.amount || 0), 0);
  const totalRevenue = projectsCollected + subsCollected;

  // ---- Projects billing / outstanding ----
  const projectsBilled = projects.reduce((s, p: any) => s + (p.price || 0), 0);
  const projectsOutstanding = Math.max(0, projectsBilled - projectsCollected);

  // ---- Subscriptions (counts / pending are still driven by the sub records) ----
  const subsPending = subscriptions.filter((s: any) => !s.collected).reduce((a, s: any) => a + (s.amount || 0), 0);
  const subsAnnual = subscriptions.filter((s: any) => s.type === "yearly").reduce((a, s: any) => a + (s.amount || 0), 0);
  const subsMonthly = subscriptions.filter((s: any) => s.type === "monthly").reduce((a, s: any) => a + (s.amount || 0), 0);
  const subsExpired = subscriptions.filter((s: any) => s.status === "expired").length;

  // ---- Expenses ----
  const totalExpenses = expenses.reduce((s, e: any) => s + (e.amount || 0), 0);

  // ---- Net profit ----
  const netProfit = totalRevenue - totalExpenses;

  // ---- Monthly series (current year), also from completed transactions ----
  const year = new Date().getFullYear();
  const monthly = MONTHS.map((m, i) => {
    const inMonth = (d?: Date) => d && new Date(d).getFullYear() === year && new Date(d).getMonth() === i;
    const projRev = transactions.filter((t: any) => t.source === "project" && inMonth(t.date)).reduce((a, t: any) => a + (t.amount || 0), 0);
    const subRev = transactions.filter((t: any) => t.source === "subscription" && inMonth(t.date)).reduce((a, t: any) => a + (t.amount || 0), 0);
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
      totalRevenue,
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
