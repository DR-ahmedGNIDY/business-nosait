import { getDashboardData } from "@/lib/analytics";
import { connectDB } from "@/lib/db";
import { ActivityLog } from "@/models/ActivityLog";
import { StatCard } from "@/components/dashboard/stat-card";
import { RevenueChart, ProfitBarChart, CategoryPie } from "@/components/dashboard/charts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge, Badge } from "@/components/ui/badge";
import { PageHeader, EmptyState } from "@/components/ui/misc";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import {
  Wallet, RefreshCw, Receipt, TrendingUp, Users, FolderKanban, AlertTriangle, Clock, Activity,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getDashboardData();
  await connectDB();
  const activities = await ActivityLog.find().sort({ createdAt: -1 }).limit(8).lean();
  const k = data.kpis;

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="Dashboard" subtitle="A separated view of projects, subscriptions and expenses." />

      {/* Primary revenue separation */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Projects Revenue (Collected)" value={k.projectsCollected} icon={Wallet} tone="primary" currency hint={`${formatCurrency(k.projectsOutstanding)} outstanding`} />
        <StatCard title="Subscriptions Revenue (Collected)" value={k.subsCollected} icon={RefreshCw} tone="success" currency hint={`${formatCurrency(k.subsPending)} pending`} />
        <StatCard title="Total Expenses" value={k.totalExpenses} icon={Receipt} tone="danger" currency />
        <StatCard title="Net Profit" value={k.netProfit} icon={TrendingUp} tone={k.netProfit >= 0 ? "success" : "danger"} currency hint="Projects + Subscriptions − Expenses" />
      </div>

      {/* Secondary counts */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Clients" value={k.clientsCount} icon={Users} tone="accent" />
        <StatCard title="Projects" value={k.projectsCount} icon={FolderKanban} tone="primary" />
        <StatCard title="Active Subscriptions" value={k.subsCount} icon={RefreshCw} tone="success" />
        <StatCard title="Expired Subscriptions" value={k.subsExpired} icon={AlertTriangle} tone="warning" />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <p className="text-sm text-muted-foreground">Projects vs subscriptions, collected per month ({new Date().getFullYear()})</p>
          </CardHeader>
          <CardContent>
            <RevenueChart data={data.monthly} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryPie data={data.expenseByCategory} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Profit & Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfitBarChart data={data.monthly} />
          </CardContent>
        </Card>

        {/* Upcoming renewals */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Upcoming Renewals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            {data.upcomingRenewals.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Nothing due in 30 days</p>
            ) : (
              data.upcomingRenewals.map((s: any) => (
                <Link key={s._id} href="/subscriptions" className="flex items-center justify-between rounded-md border border-border p-2.5 hover:bg-muted">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{s.title}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(s.renewalDate)}</p>
                  </div>
                  <Badge tone={s.days <= 3 ? "danger" : s.days <= 7 ? "warning" : "accent"}>{s.days}d</Badge>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Contracts overview + Recent activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Contracts Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {["draft", "waiting_signature", "signed", "cancelled"].map((st) => (
              <div key={st} className="flex items-center justify-between rounded-md border border-border p-2.5">
                <StatusBadge status={st} />
                <span className="text-sm font-semibold">{data.contractsByStatus[st] || 0}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <EmptyState icon={<Activity className="h-5 w-5" />} title="No activity yet" description="Actions across the workspace will appear here." />
            ) : (
              <div className="space-y-3">
                {activities.map((a: any) => (
                  <div key={a._id} className="flex items-start gap-3">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    <div>
                      <p className="text-sm">{a.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {a.entity} · {formatDate(a.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
