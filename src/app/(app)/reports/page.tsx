import { getReportData } from "@/lib/reports";
import { getDashboardData } from "@/lib/analytics";
import { PageHeader } from "@/components/ui/misc";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { Table, THead, TR, TH, TD } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RevenueChart, ProfitBarChart } from "@/components/dashboard/charts";
import { ReportExport } from "@/components/reports/report-export";
import { getT } from "@/lib/i18n-server";
import { Wallet, RefreshCw, Receipt, TrendingUp } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const [data, dash] = await Promise.all([getReportData(), getDashboardData()]);
  const { t } = await getT();
  const net = data.projectsCollected + data.subsCollected - data.totalExpenses;

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title={t("reports.title")} subtitle={t("reports.subtitle")}>
        <ReportExport />
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title={t("dashboard.projects")} value={data.projectsCollected} icon={Wallet} tone="primary" currency hint={t("dashboard.outstanding", { amount: formatCurrency(data.projectsBilled) })} />
        <StatCard title={t("dashboard.subscriptionsRevenue")} value={data.subsCollected} icon={RefreshCw} tone="success" currency />
        <StatCard title={t("charts.expenses")} value={data.totalExpenses} icon={Receipt} tone="danger" currency />
        <StatCard title={t("dashboard.netProfit")} value={net} icon={TrendingUp} tone={net >= 0 ? "success" : "danger"} currency />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card><CardHeader><CardTitle>{t("reports.monthlyRevenue")}</CardTitle></CardHeader><CardContent><RevenueChart data={dash.monthly} /></CardContent></Card>
        <Card><CardHeader><CardTitle>{t("dashboard.profitExpenses")}</CardTitle></CardHeader><CardContent><ProfitBarChart data={dash.monthly} /></CardContent></Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between"><CardTitle>{t("reports.topClients")}</CardTitle><a href="/api/reports/export?type=top-clients" className="text-xs text-primary hover:underline">{t("reports.exportCsv")}</a></CardHeader>
          <CardContent>
            <Table>
              <THead><TR><TH>{t("common.client")}</TH><TH>{t("nav.projects")}</TH><TH>{t("common.collected")}</TH></TR></THead>
              <tbody>
                {data.topClients.map((c, i) => (
                  <TR key={i}><TD className="font-medium">{c.name}</TD><TD>{c.projects}</TD><TD className="text-success">{formatCurrency(c.collected)}</TD></TR>
                ))}
              </tbody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between"><CardTitle>{t("reports.outstanding")}</CardTitle><a href="/api/reports/export?type=outstanding" className="text-xs text-primary hover:underline">{t("reports.exportCsv")}</a></CardHeader>
          <CardContent>
            <Table>
              <THead><TR><TH>{t("nav.projects")}</TH><TH>{t("common.client")}</TH><TH>{t("common.remaining")}</TH></TR></THead>
              <tbody>
                {data.outstanding.length === 0 ? (
                  <TR><TD className="text-muted-foreground">{t("reports.noOutstanding")}</TD><TD /><TD /></TR>
                ) : data.outstanding.map((o, i) => (
                  <TR key={i}><TD className="font-medium">{o.title}</TD><TD className="text-muted-foreground">{o.client}</TD><TD className="text-warning">{formatCurrency(o.remaining)}</TD></TR>
                ))}
              </tbody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between"><CardTitle>{t("reports.upcomingRenewals")}</CardTitle><a href="/api/reports/export?type=renewals" className="text-xs text-primary hover:underline">{t("reports.exportCsv")}</a></CardHeader>
        <CardContent>
          <Table>
            <THead><TR><TH>{t("subscriptions.service")}</TH><TH>{t("common.client")}</TH><TH>{t("common.amount")}</TH><TH>{t("subscriptions.renewal")}</TH><TH>{t("common.date")}</TH></TR></THead>
            <tbody>
              {data.upcomingRenewals.length === 0 ? (
                <TR><TD className="text-muted-foreground">{t("reports.nothingDue60")}</TD><TD /><TD /><TD /><TD /></TR>
              ) : data.upcomingRenewals.map((r, i) => (
                <TR key={i}>
                  <TD className="font-medium">{r.title}</TD>
                  <TD className="text-muted-foreground">{r.client}</TD>
                  <TD>{formatCurrency(r.amount)}</TD>
                  <TD>{formatDate(r.renewalDate)}</TD>
                  <TD><Badge tone={(r.days || 0) <= 7 ? "danger" : (r.days || 0) <= 30 ? "warning" : "accent"}>{r.days}d</Badge></TD>
                </TR>
              ))}
            </tbody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
