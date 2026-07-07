import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { connectDB } from "@/lib/db";
import { Client } from "@/models/Client";
import { PageHeader } from "@/components/ui/misc";
import { ProjectForm } from "@/components/projects/project-form";
import { createProject } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewProjectPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  await connectDB();
  const clients = JSON.parse(JSON.stringify(await Client.find().select("name").sort({ name: 1 }).lean()));

  return (
    <div className="animate-fade-in mx-auto max-w-3xl">
      <Link href="/projects" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to projects
      </Link>
      <PageHeader title="New project" />
      <ProjectForm action={createProject} clients={clients} defaults={{ clientId: sp.clientId }} />
    </div>
  );
}
