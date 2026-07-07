import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { connectDB } from "@/lib/db";
import { Contract } from "@/models/Contract";
import { Client } from "@/models/Client";
import { Settings } from "@/models/Settings";
import { PageHeader } from "@/components/ui/misc";
import { ContractForm } from "@/components/contracts/contract-form";
import { updateContract } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditContractPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connectDB();
  const contract = await Contract.findById(id).lean<any>();
  if (!contract) notFound();
  const [clients, settings] = await Promise.all([
    Client.find().select("name").sort({ name: 1 }).lean(),
    Settings.findOne().lean<any>(),
  ]);
  const defaults = JSON.parse(JSON.stringify({ ...contract, clientId: String(contract.clientId), projectId: contract.projectId ? String(contract.projectId) : "" }));

  return (
    <div className="animate-fade-in mx-auto max-w-4xl">
      <Link href={`/contracts/${id}`} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to contract
      </Link>
      <PageHeader title="Edit contract" subtitle={contract.contractNumber} />
      <ContractForm action={updateContract.bind(null, id)} clients={JSON.parse(JSON.stringify(clients))} business={settings?.businessName} defaults={defaults} submitLabel="Update contract" />
    </div>
  );
}
