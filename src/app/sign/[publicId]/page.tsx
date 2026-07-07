import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { connectDB } from "@/lib/db";
import { Contract } from "@/models/Contract";
import { Client } from "@/models/Client";
import { Settings } from "@/models/Settings";
import { ContractDocument } from "@/components/contracts/contract-document";
import { PublicSignForm } from "@/components/contracts/public-sign-form";
import { markContractViewed } from "@/app/(app)/contracts/actions";
import { CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PublicSignPage({ params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params;
  await connectDB();
  const contract = await Contract.findOne({ publicId }).lean<any>();
  if (!contract) notFound();

  await markContractViewed(publicId);

  const [client, settings] = await Promise.all([
    Client.findById(contract.clientId).lean<any>(),
    Settings.findOne().lean<any>(),
  ]);

  const h = await headers();
  const ip = (h.get("x-forwarded-for") || "").split(",")[0].trim() || h.get("x-real-ip") || "unknown";
  const alreadySigned = contract.status === "signed";
  const cancelled = contract.status === "cancelled";

  return (
    <div className="min-h-screen bg-surface py-8">
      <div className="mx-auto max-w-3xl px-4">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-base font-bold text-white">N</div>
          <p className="font-bold">{settings?.businessName || "Nosait Business"}</p>
        </div>

        {alreadySigned && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-success/30 bg-success/10 p-4 text-success">
            <CheckCircle2 className="h-5 w-5" />
            <p className="text-sm font-medium">This contract has been signed. A copy has been recorded.</p>
          </div>
        )}
        {cancelled && (
          <div className="mb-6 rounded-lg border border-danger/30 bg-danger/10 p-4 text-sm font-medium text-danger">
            This contract has been cancelled and can no longer be signed.
          </div>
        )}

        <ContractDocument contract={JSON.parse(JSON.stringify(contract))} clientName={client?.name} business={settings?.businessName} />

        {!alreadySigned && !cancelled && (
          <PublicSignForm publicId={publicId} ip={ip} defaultName={client?.name || ""} />
        )}
      </div>
    </div>
  );
}
