import Link from "next/link";
import { Plus, FileSignature } from "lucide-react";
import { connectDB } from "@/lib/db";
import { Contract } from "@/models/Contract";
import { PageHeader, EmptyState } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { StatusBadge, Badge } from "@/components/ui/badge";
import { Table, THead, TR, TH, TD } from "@/components/ui/table";
import { ListToolbar } from "@/components/list-toolbar";
import { CONTRACT_STATUS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ContractsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  await connectDB();
  const filter: any = {};
  if (sp.q) filter.$or = [{ title: new RegExp(sp.q, "i") }, { contractNumber: new RegExp(sp.q, "i") }];
  if (sp.status) filter.status = sp.status;

  const contracts = await Contract.find(filter).sort({ createdAt: -1 }).populate("clientId", "name").lean();

  return (
    <div className="animate-fade-in">
      <PageHeader title="Contracts" subtitle={`${contracts.length} contracts`}>
        <Link href="/contracts/new"><Button><Plus className="h-4 w-4" /> New contract</Button></Link>
      </PageHeader>

      <ListToolbar placeholder="Search by title or number…" filters={[{ name: "status", label: "All statuses", options: CONTRACT_STATUS.map((s) => ({ value: s, label: s })) }]} />

      {contracts.length === 0 ? (
        <EmptyState icon={<FileSignature className="h-5 w-5" />} title="No contracts" description="Generate an electronic contract from a template."
          action={<Link href="/contracts/new"><Button><Plus className="h-4 w-4" /> New contract</Button></Link>} />
      ) : (
        <Table>
          <THead><TR><TH>Number</TH><TH>Title</TH><TH>Client</TH><TH>Value</TH><TH>Template</TH><TH>Status</TH><TH>Created</TH></TR></THead>
          <tbody>
            {contracts.map((c: any) => (
              <TR key={c._id}>
                <TD className="font-mono text-xs">{c.contractNumber}</TD>
                <TD><Link href={`/contracts/${c._id}`} className="font-medium hover:text-primary">{c.title}</Link></TD>
                <TD className="text-muted-foreground">{c.clientId?.name || "—"}</TD>
                <TD>{formatCurrency(c.value)}</TD>
                <TD><Badge tone="accent">{c.template}</Badge></TD>
                <TD><StatusBadge status={c.status} /></TD>
                <TD>{formatDate(c.createdAt)}</TD>
              </TR>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
