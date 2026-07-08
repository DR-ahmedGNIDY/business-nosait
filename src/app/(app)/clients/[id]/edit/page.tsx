import Link from "next/link";
import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { ArrowLeft } from "lucide-react";
import { connectDB } from "@/lib/db";
import { Client } from "@/models/Client";
import { PageHeader } from "@/components/ui/misc";
import { ClientForm } from "@/components/clients/client-form";
import { updateClient } from "../../actions";

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) notFound();
  await connectDB();
  const client = await Client.findById(id).lean<any>();
  if (!client) notFound();

  const update = updateClient.bind(null, id);

  return (
    <div className="animate-fade-in mx-auto max-w-3xl">
      <Link href={`/clients/${id}`} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to client
      </Link>
      <PageHeader title="Edit client" subtitle={client.name} />
      <ClientForm action={update} defaults={JSON.parse(JSON.stringify(client))} submitLabel="Update client" />
    </div>
  );
}
