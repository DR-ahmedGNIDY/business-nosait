import { Activity as ActivityIcon } from "lucide-react";
import { connectDB } from "@/lib/db";
import { ActivityLog } from "@/models/ActivityLog";
import { PageHeader, EmptyState } from "@/components/ui/misc";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, THead, TR, TH, TD } from "@/components/ui/table";
import { ListToolbar } from "@/components/list-toolbar";
import { getT } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

const ENTITIES = ["Client", "Project", "Subscription", "Transaction", "Expense", "Contract", "Settings"];
const TONE: Record<string, any> = { create: "success", update: "accent", delete: "danger", payment: "primary", collect: "primary", renew: "warning", sign: "success", status: "accent" };

export default async function ActivityPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  const { t } = await getT();
  await connectDB();

  const filter: any = {};
  if (sp.entity) filter.entity = sp.entity;
  if (sp.q) filter.description = new RegExp(sp.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

  const items = await ActivityLog.find(filter).sort({ createdAt: -1 }).limit(300).lean();

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title={t("activity.title")} subtitle={t("activity.subtitle")} />

      <ListToolbar
        placeholder="Search activity…"
        filters={[{ name: "entity", label: "All objects", options: ENTITIES.map((e) => ({ value: e, label: e })) }]}
      />

      {items.length === 0 ? (
        <EmptyState icon={<ActivityIcon className="h-5 w-5" />} title="No activity yet" description="Actions across the system will appear here." />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <THead><TR>
                <TH>Action</TH><TH>Object</TH><TH>Description</TH><TH>User</TH><TH>IP</TH><TH>Date &amp; Time</TH>
              </TR></THead>
              <tbody>
                {items.map((a: any) => (
                  <TR key={a._id}>
                    <TD><Badge tone={TONE[a.action] || "muted"}>{a.action}</Badge></TD>
                    <TD className="text-muted-foreground">{a.entity}</TD>
                    <TD>{a.description}</TD>
                    <TD className="text-muted-foreground">{a.userName || "—"}</TD>
                    <TD className="font-mono text-xs text-muted-foreground">{a.ip || "—"}</TD>
                    <TD className="whitespace-nowrap text-xs text-muted-foreground">{new Date(a.createdAt).toLocaleString()}</TD>
                  </TR>
                ))}
              </tbody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
}
