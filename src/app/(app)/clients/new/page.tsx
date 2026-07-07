import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/misc";
import { ClientForm } from "@/components/clients/client-form";
import { createClient } from "../actions";

export default function NewClientPage() {
  return (
    <div className="animate-fade-in mx-auto max-w-3xl">
      <Link href="/clients" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to clients
      </Link>
      <PageHeader title="New client" subtitle="Add a client to your workspace." />
      <ClientForm action={createClient} />
    </div>
  );
}
