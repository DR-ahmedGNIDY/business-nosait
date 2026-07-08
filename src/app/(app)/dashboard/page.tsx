import { getDashboardData } from "@/lib/analytics";
import { getT } from "@/lib/i18n-server";
import { connectDB } from "@/lib/db";
import { ActivityLog } from "@/models/ActivityLog";
import { StatCard } from "@/components/dashboard/stat-card";
import { RevenueChart, ProfitBarChart, CategoryPie } from "@/components/dashboard/charts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge, Badge } from "@/components/ui/badge";
import { PageHeader, EmptyState } from "@/components/ui/misc";
import { formatCurrency, formatDate } from "@/lib/utils";
import { label } from "@/lib/constants";
import Link from "next/link";
import {
  Wallet, RefreshCw, Receipt, TrendingUp, Users, FolderKanban, AlertTriangle, Clock, Activity,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getDashboardData();
  const { t, locale } = await getT();
  const expenseByCategory = data.expenseByCategory.map((e) => ({ name: label(e.name, locale), value: e.value }));
  await connectDB();
  const activities = await ActivityLog.find().sort({ createdAt: -1 }).limit(8).lean();
  const k = data.kpis;
  const year = new Date().getFullYear();

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title={t("dashboard.title")} subtitle={t("dashboard.subtitle")} />

      {/* Primary revenue separation */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title={t("dashboard.projectsRevenue")} value={k.projectsCollected} icon={Wallet} tone="primary" currency hint={t("dashboard.outstanding", { amount: formatCurrency(k.projectsOutstanding) })} />
        <StatCard title={t("dashboard.subscriptionsRevenue")} value={k.subsCollected} icon={RefreshCw} tone="success" currency hint={t("dashboard.pendingHint", { amount: formatCurrency(k.subsPending) })} />
        <StatCard title={t("dashboard.totalExpenses")} value={k.totalExpenses} icon={Receipt} tone="danger" currency />
        <StatCard title={t("dashboard.netProfit")} value={k.netProfit} icon={TrendingUp} tone={k.netProfit >= 0 ? "success" : "danger"} currency hint={t("dashboard.netProfitHint")} />
      </div>

      {/* Secondary counts */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title={t("dashboard.clients")} value={k.clientsCount} icon={Users} tone="accent" />
        <StatCard title={t("dashboard.projects")} value={k.projectsCount} icon={FolderKanban} tone="primary" />
        <StatCard title={t("dashboard.activeSubscriptions")} value={k.subsCount} icon={RefreshCw} tone="success" />
        <StatCard title={t("dashboard.expiredSubscriptions")} value={k.subsExpired} icon={AlertTriangle} tone="warning" />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("dashboard.revenueOverview")}</CardTitle>
            <p className="text-sm text-muted-foreground">{t("dashboard.revenueOverviewSub", { year })}</p>
          </CardHeader>
          <CardContent>
            <RevenueChart data={data.monthly} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.expensesByCategory")}</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryPie data={expenseByCategory} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("dashboard.profitExpenses")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfitBarChart data={data.monthly} />
          </CardContent>
        </Card>

        {/* Upcoming renewals */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>{t("dashboard.upcomingRenewals")}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            {data.upcomingRenewals.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">{t("dashboard.nothingDue30")}</p>
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
            <CardTitle>{t("dashboard.contractsOverview")}</CardTitle>
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
            <CardTitle>{t("dashboard.recentActivity")}</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <EmptyState icon={<Activity className="h-5 w-5" />} title={t("dashboard.noActivity")} description={t("dashboard.noActivityDesc")} />
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
