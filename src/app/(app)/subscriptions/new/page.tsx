import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { connectDB } from "@/lib/db";
import { Client } from "@/models/Client";
import { PageHeader } from "@/components/ui/misc";
import { SubscriptionForm } from "@/components/subscriptions/subscription-form";
import { createSubscription } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewSubscriptionPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  await connectDB();
  const clients = JSON.parse(JSON.stringify(await Client.find().select("name").sort({ name: 1 }).lean()));
  return (
    <div className="animate-fade-in mx-auto max-w-3xl">
      <Link href="/subscriptions" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      <PageHeader title="New subscription" />
      <SubscriptionForm action={createSubscription} clients={clients} defaults={{ clientId: sp.clientId }} />
    </div>
  );
}
