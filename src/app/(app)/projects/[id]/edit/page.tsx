import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { connectDB } from "@/lib/db";
import { Project } from "@/models/Project";
import { Client } from "@/models/Client";
import { PageHeader } from "@/components/ui/misc";
import { ProjectForm } from "@/components/projects/project-form";
import { updateProject } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connectDB();
  const project = await Project.findById(id).lean<any>();
  if (!project) notFound();
  const clients = JSON.parse(JSON.stringify(await Client.find().select("name").sort({ name: 1 }).lean()));
  const defaults = JSON.parse(JSON.stringify({ ...project, clientId: String(project.clientId) }));

  return (
    <div className="animate-fade-in mx-auto max-w-3xl">
      <Link href={`/projects/${id}`} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to project
      </Link>
      <PageHeader title="Edit project" subtitle={project.title} />
      <ProjectForm action={updateProject.bind(null, id)} clients={clients} defaults={defaults} submitLabel="Update project" />
    </div>
  );
}
