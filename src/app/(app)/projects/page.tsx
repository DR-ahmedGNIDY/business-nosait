import Link from "next/link";
import { Plus, FolderKanban } from "lucide-react";
import { connectDB } from "@/lib/db";
import { Project } from "@/models/Project";
import { Client } from "@/models/Client";
import { PageHeader, EmptyState } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { StatusBadge, Badge } from "@/components/ui/badge";
import { Table, THead, TR, TH, TD } from "@/components/ui/table";
import { ListToolbar } from "@/components/list-toolbar";
import { PROJECT_STATUS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  await connectDB();
  const filter: any = {};
  if (sp.q) filter.title = new RegExp(sp.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  if (sp.status) filter.status = sp.status;

  const projects = await Project.find(filter).sort({ createdAt: -1 }).populate("clientId", "name").lean();

  const totalValue = projects.reduce((s: number, p: any) => s + (p.price || 0), 0);
  const totalCollected = projects.reduce((s: number, p: any) => s + (p.paidAmount || 0), 0);

  return (
    <div className="animate-fade-in">
      <PageHeader title="Projects" subtitle={`${projects.length} projects · ${formatCurrency(totalCollected)} collected of ${formatCurrency(totalValue)}`}>
        <Link href="/projects/new"><Button><Plus className="h-4 w-4" /> New project</Button></Link>
      </PageHeader>

      <ListToolbar placeholder="Search projects…" filters={[{ name: "status", label: "All statuses", options: PROJECT_STATUS.map((s) => ({ value: s, label: s })) }]} />

      {projects.length === 0 ? (
        <EmptyState icon={<FolderKanban className="h-5 w-5" />} title="No projects" description="Create a project to track scope, payments and profitability."
          action={<Link href="/projects/new"><Button><Plus className="h-4 w-4" /> New project</Button></Link>} />
      ) : (
        <Table>
          <THead><TR><TH>Project</TH><TH>Client</TH><TH>Category</TH><TH>Price</TH><TH>Collected</TH><TH>Status</TH></TR></THead>
          <tbody>
            {projects.map((p: any) => (
              <TR key={p._id}>
                <TD><Link href={`/projects/${p._id}`} className="font-medium hover:text-primary">{p.title}</Link></TD>
                <TD className="text-muted-foreground">{p.clientId?.name || "—"}</TD>
                <TD><Badge tone="accent">{p.category}</Badge></TD>
                <TD>{formatCurrency(p.price)}</TD>
                <TD className="text-success">{formatCurrency(p.paidAmount)}</TD>
                <TD><StatusBadge status={p.status} /></TD>
              </TR>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
