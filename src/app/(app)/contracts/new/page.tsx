import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { connectDB } from "@/lib/db";
import { Client } from "@/models/Client";
import { Settings } from "@/models/Settings";
import { PageHeader } from "@/components/ui/misc";
import { ContractForm } from "@/components/contracts/contract-form";
import { createContract } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewContractPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  await connectDB();
  const [clients, settings] = await Promise.all([
    Client.find().select("name").sort({ name: 1 }).lean(),
    Settings.findOne().lean<any>(),
  ]);

  return (
    <div className="animate-fade-in mx-auto max-w-4xl">
      <Link href="/contracts" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to contracts
      </Link>
      <PageHeader title="New contract" subtitle="Pick a template — the terms are generated automatically." />
      <ContractForm action={createContract} clients={JSON.parse(JSON.stringify(clients))} business={settings?.businessName} defaults={{ clientId: sp.clientId }} />
    </div>
  );
}
