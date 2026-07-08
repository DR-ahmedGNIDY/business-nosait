import Link from "next/link";
import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { Pencil, Mail, Phone, MapPin, Plus } from "lucide-react";
import { connectDB } from "@/lib/db";
import { Client } from "@/models/Client";
import { Project } from "@/models/Project";
import { Subscription } from "@/models/Subscription";
import { Contract } from "@/models/Contract";
import { ActivityLog } from "@/models/ActivityLog";
import { Settings } from "@/models/Settings";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge, Badge } from "@/components/ui/badge";
import { Avatar, EmptyState } from "@/components/ui/misc";
import { Tabs } from "@/components/ui/tabs";
import { Table, THead, TR, TH, TD } from "@/components/ui/table";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { DeleteButton } from "@/components/delete-button";
import { deleteClient } from "../actions";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ClientProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) notFound();
  await connectDB();
  const client = await Client.findById(id).lean<any>();
  if (!client) notFound();

  const [projects, subs, contracts, activities, settings] = await Promise.all([
    Project.find({ clientId: id }).sort({ createdAt: -1 }).lean(),
    Subscription.find({ clientId: id }).sort({ renewalDate: 1 }).lean(),
    Contract.find({ clientId: id }).sort({ createdAt: -1 }).lean(),
    ActivityLog.find({ entityId: id }).sort({ createdAt: -1 }).limit(20).lean(),
    Settings.findOne().lean<any>(),
  ]);

  const totalCollected = projects.reduce((s: number, p: any) => s + (p.paidAmount || 0), 0);
  const totalOutstanding = projects.reduce((s: number, p: any) => s + (p.remainingAmount || 0), 0);
  const del = deleteClient.bind(null, id);

  const ProjectsTab = projects.length === 0 ? (
    <EmptyState title="No projects" description="This client has no projects yet." action={<Link href={`/projects/new?clientId=${id}`}><Button size="sm"><Plus className="h-4 w-4" /> Add project</Button></Link>} />
  ) : (
    <Table>
      <THead><TR><TH>Project</TH><TH>Price</TH><TH>Paid</TH><TH>Remaining</TH><TH>Status</TH></TR></THead>
      <tbody>
        {projects.map((p: any) => (
          <TR key={p._id}>
            <TD><Link href={`/projects/${p._id}`} className="font-medium hover:text-primary">{p.title}</Link></TD>
            <TD>{formatCurrency(p.price)}</TD>
            <TD className="text-success">{formatCurrency(p.paidAmount)}</TD>
            <TD className="text-warning">{formatCurrency(p.remainingAmount)}</TD>
            <TD><StatusBadge status={p.status} /></TD>
          </TR>
        ))}
      </tbody>
    </Table>
  );

  const SubsTab = subs.length === 0 ? (
    <EmptyState title="No subscriptions" description="No recurring services for this client." />
  ) : (
    <Table>
      <THead><TR><TH>Service</TH><TH>Type</TH><TH>Amount</TH><TH>Renewal</TH><TH>Status</TH></TR></THead>
      <tbody>
        {subs.map((s: any) => (
          <TR key={s._id}>
            <TD className="font-medium">{s.title}</TD>
            <TD><Badge tone="accent">{s.type}</Badge></TD>
            <TD>{formatCurrency(s.amount)}</TD>
            <TD>{formatDate(s.renewalDate)}</TD>
            <TD><StatusBadge status={s.status} /></TD>
          </TR>
        ))}
      </tbody>
    </Table>
  );

  const ContractsTab = contracts.length === 0 ? (
    <EmptyState title="No contracts" description="No contracts created for this client." action={<Link href={`/contracts/new?clientId=${id}`}><Button size="sm"><Plus className="h-4 w-4" /> New contract</Button></Link>} />
  ) : (
    <Table>
      <THead><TR><TH>Contract</TH><TH>Value</TH><TH>Status</TH><TH>Created</TH></TR></THead>
      <tbody>
        {contracts.map((c: any) => (
          <TR key={c._id}>
            <TD><Link href={`/contracts/${c._id}`} className="font-medium hover:text-primary">{c.contractNumber} — {c.title}</Link></TD>
            <TD>{formatCurrency(c.value)}</TD>
            <TD><StatusBadge status={c.status} /></TD>
            <TD>{formatDate(c.createdAt)}</TD>
          </TR>
        ))}
      </tbody>
    </Table>
  );

  const PaymentsTab = (
    <div className="space-y-3">
      {projects.flatMap((p: any) => (p.payments || []).map((pay: any, i: number) => ({ ...pay, project: p.title, key: `${p._id}-${i}` }))).length === 0 ? (
        <EmptyState title="No payments" description="Payments recorded on projects appear here." />
      ) : (
        <Table>
          <THead><TR><TH>Project</TH><TH>Amount</TH><TH>Method</TH><TH>Date</TH></TR></THead>
          <tbody>
            {projects.flatMap((p: any) => (p.payments || []).map((pay: any, i: number) => (
              <TR key={`${p._id}-${i}`}>
                <TD className="font-medium">{p.title}</TD>
                <TD className="text-success">{formatCurrency(pay.amount)}</TD>
                <TD><Badge>{pay.method}</Badge></TD>
                <TD>{formatDate(pay.date)}</TD>
              </TR>
            )))}
          </tbody>
        </Table>
      )}
    </div>
  );

  const NotesTab = (
    <Card><CardContent className="pt-6">
      <p className="whitespace-pre-wrap text-sm text-muted-foreground">{client.notes || "No notes recorded for this client."}</p>
    </CardContent></Card>
  );

  const ActivitiesTab = activities.length === 0 ? (
    <EmptyState title="No activity" description="Actions for this client appear here." />
  ) : (
    <div className="space-y-3">
      {activities.map((a: any) => (
        <div key={a._id} className="flex items-start gap-3">
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
          <div><p className="text-sm">{a.description}</p><p className="text-xs text-muted-foreground">{formatDate(a.createdAt)}</p></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="animate-fade-in space-y-6">
      <Card>
        <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar name={client.name} className="h-14 w-14 text-lg" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">{client.name}</h1>
                <StatusBadge status={client.status} />
              </div>
              {client.company && <p className="text-sm text-muted-foreground">{client.company}</p>}
              <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                {client.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {client.email}</span>}
                {client.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {client.phone}</span>}
                {client.address && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {client.address}</span>}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <WhatsAppButton phone={client.whatsapp || client.phone} ctx={{ clientName: client.name, business: settings?.businessName, amount: totalOutstanding }} />
            <Link href={`/clients/${id}/edit`}><Button variant="outline" size="sm"><Pencil className="h-4 w-4" /> Edit</Button></Link>
            <DeleteButton action={del} message="Delete client and all related records?" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4"><p className="text-xs text-muted-foreground">Projects</p><p className="mt-1 text-xl font-bold">{projects.length}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Collected</p><p className="mt-1 text-xl font-bold text-success">{formatCurrency(totalCollected)}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Outstanding</p><p className="mt-1 text-xl font-bold text-warning">{formatCurrency(totalOutstanding)}</p></Card>
      </div>

      <Tabs tabs={[
        { key: "projects", label: `Projects (${projects.length})`, content: ProjectsTab },
        { key: "subscriptions", label: `Subscriptions (${subs.length})`, content: SubsTab },
        { key: "contracts", label: `Contracts (${contracts.length})`, content: ContractsTab },
        { key: "payments", label: "Payments", content: PaymentsTab },
        { key: "notes", label: "Notes", content: NotesTab },
        { key: "activities", label: "Activities", content: ActivitiesTab },
      ]} />
    </div>
  );
}
