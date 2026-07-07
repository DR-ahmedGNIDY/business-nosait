import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil, Clock } from "lucide-react";
import { connectDB } from "@/lib/db";
import { Contract } from "@/models/Contract";
import { Client } from "@/models/Client";
import { Settings } from "@/models/Settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { ContractDocument } from "@/components/contracts/contract-document";
import { PrintButton, CopyLink, StatusControls, CompanySignatureCard } from "@/components/contracts/contract-controls";
import { DeleteButton } from "@/components/delete-button";
import { setContractStatus, saveCompanySignature, deleteContract } from "../actions";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const EVENT_LABEL: Record<string, string> = { created: "Created", sent: "Sent for signature", viewed: "Viewed by client", signed: "Signed", completed: "Completed" };

export default async function ContractDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connectDB();
  const contract = await Contract.findById(id).lean<any>();
  if (!contract) notFound();
  const [client, settings] = await Promise.all([
    Client.findById(contract.clientId).lean<any>(),
    Settings.findOne().lean<any>(),
  ]);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const signUrl = `${appUrl}/sign/${contract.publicId}`;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <Link href="/contracts" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to contracts
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={contract.status} />
          <PrintButton />
          <CopyLink url={signUrl} />
          <Link href={`/contracts/${id}/edit`}><Button variant="outline" size="sm"><Pencil className="h-4 w-4" /> Edit</Button></Link>
          <DeleteButton action={deleteContract.bind(null, id)} />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <StatusControls
          status={contract.status}
          onSend={setContractStatus.bind(null, id, "waiting_signature")}
          onCancel={setContractStatus.bind(null, id, "cancelled")}
        />
        <a href={signUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">Open public signing page →</a>
      </div>

      <ContractDocument contract={JSON.parse(JSON.stringify(contract))} clientName={client?.name} business={settings?.businessName} />

      <div className="grid gap-6 lg:grid-cols-2 print:hidden">
        <CompanySignatureCard initial={contract.companySignature?.dataUrl} onSave={saveCompanySignature.bind(null, id)} />

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-4 w-4" /> Timeline</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(contract.timeline || []).map((t: any, i: number) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                    {i < contract.timeline.length - 1 && <span className="mt-1 h-8 w-px bg-border" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{EVENT_LABEL[t.event] || t.event}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(t.at)}{t.meta ? ` · ${t.meta}` : ""}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
