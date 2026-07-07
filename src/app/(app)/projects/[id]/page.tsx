import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Calendar, User } from "lucide-react";
import { connectDB } from "@/lib/db";
import { Project } from "@/models/Project";
import { Client } from "@/models/Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge, Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/misc";
import { Table, THead, TR, TH, TD } from "@/components/ui/table";
import { PaymentForm } from "@/components/projects/payment-form";
import { DeleteButton } from "@/components/delete-button";
import { deleteProject, addPayment } from "../actions";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connectDB();
  const project = await Project.findById(id).lean<any>();
  if (!project) notFound();
  const client = await Client.findById(project.clientId).lean<any>();

  const profit = (project.paidAmount || 0) - (project.cost || 0);
  const margin = project.paidAmount ? Math.round((profit / project.paidAmount) * 100) : 0;
  const progress = project.price ? Math.round((project.paidAmount / project.price) * 100) : 0;

  return (
    <div className="animate-fade-in space-y-6">
      <Card>
        <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{project.title}</h1>
              <StatusBadge status={project.status} />
              <Badge tone="accent">{project.category}</Badge>
            </div>
            <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
              {client && <Link href={`/clients/${client._id}`} className="flex items-center gap-1 hover:text-primary"><User className="h-3 w-3" /> {client.name}</Link>}
              {project.startDate && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Start {formatDate(project.startDate)}</span>}
              {project.deliveryDate && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Due {formatDate(project.deliveryDate)}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/projects/${id}/edit`}><Button variant="outline" size="sm"><Pencil className="h-4 w-4" /> Edit</Button></Link>
            <DeleteButton action={deleteProject.bind(null, id)} />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="p-4"><p className="text-xs text-muted-foreground">Price</p><p className="mt-1 text-xl font-bold">{formatCurrency(project.price)}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Collected ({progress}%)</p><p className="mt-1 text-xl font-bold text-success">{formatCurrency(project.paidAmount)}</p>
          <div className="mt-2 h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-success" style={{ width: `${Math.min(100, progress)}%` }} /></div>
        </Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Remaining</p><p className="mt-1 text-xl font-bold text-warning">{formatCurrency(project.remainingAmount)}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Profit (margin {margin}%)</p><p className={`mt-1 text-xl font-bold ${profit >= 0 ? "text-success" : "text-danger"}`}>{formatCurrency(profit)}</p></Card>
      </div>

      {project.description && (
        <Card><CardContent className="pt-6"><p className="whitespace-pre-wrap text-sm text-muted-foreground">{project.description}</p></CardContent></Card>
      )}

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Payments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <PaymentForm action={addPayment.bind(null, id)} />
          {(!project.payments || project.payments.length === 0) ? (
            <EmptyState title="No payments yet" description="Record a payment above to update the collected amount." />
          ) : (
            <Table>
              <THead><TR><TH>Amount</TH><TH>Method</TH><TH>Date</TH><TH>Note</TH></TR></THead>
              <tbody>
                {project.payments.map((p: any, i: number) => (
                  <TR key={i}>
                    <TD className="font-medium text-success">{formatCurrency(p.amount)}</TD>
                    <TD><Badge>{p.method}</Badge></TD>
                    <TD>{formatDate(p.date)}</TD>
                    <TD className="text-muted-foreground">{p.note || "—"}</TD>
                  </TR>
                ))}
              </tbody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
