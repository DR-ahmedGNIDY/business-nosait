"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Project } from "@/models/Project";
import { projectSchema, paymentSchema } from "@/lib/validations";
import { createTransaction } from "@/lib/ledger";
import { logActivity, notify, LARGE_PAYMENT_THRESHOLD } from "@/lib/activity";
import { currentUserLabel } from "@/lib/session";

async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function createProject(formData: FormData) {
  await requireSession();
  const parsed = projectSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message || "Invalid input" };
  await connectDB();
  const { startDate, deliveryDate, ...rest } = parsed.data;
  const project = await Project.create({
    ...rest,
    startDate: startDate ? new Date(startDate) : undefined,
    deliveryDate: deliveryDate ? new Date(deliveryDate) : undefined,
  });
  await logActivity({ action: "create", entity: "Project", entityId: String(project._id), description: `Created project ${project.title}` });
  revalidatePath("/projects");
  revalidatePath("/dashboard");
  redirect(`/projects/${project._id}`);
}

export async function updateProject(id: string, formData: FormData) {
  await requireSession();
  const parsed = projectSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message || "Invalid input" };
  await connectDB();
  const { startDate, deliveryDate, ...rest } = parsed.data;
  const project = await Project.findById(id);
  if (!project) return { error: "Project not found" };
  Object.assign(project, rest, {
    startDate: startDate ? new Date(startDate) : project.startDate,
    deliveryDate: deliveryDate ? new Date(deliveryDate) : project.deliveryDate,
  });
  await project.save(); // triggers paid/remaining recompute
  await logActivity({ action: "update", entity: "Project", entityId: id, description: `Updated project ${project.title}` });
  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
  revalidatePath("/dashboard");
  redirect(`/projects/${id}`);
}

export async function deleteProject(id: string) {
  await requireSession();
  await connectDB();
  await Project.findByIdAndDelete(id);
  await logActivity({ action: "delete", entity: "Project", entityId: id, description: "Deleted a project" });
  revalidatePath("/projects");
  revalidatePath("/dashboard");
  redirect("/projects");
}

export async function addPayment(id: string, formData: FormData) {
  await requireSession();
  const parsed = paymentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message || "Invalid amount" };
  await connectDB();
  const project = await Project.findById(id);
  if (!project) return { error: "Project not found" };
  // Transaction is the source of truth; the project projection is synced inside the ledger.
  const doc = await createTransaction({
    title: `Payment — ${project.title}`,
    amount: parsed.data.amount,
    method: parsed.data.method,
    source: "project",
    type: "income",
    clientId: project.clientId,
    projectId: project._id,
    note: parsed.data.note,
    createdBy: await currentUserLabel(),
  });
  await logActivity({ action: "payment", entity: "Project", entityId: id, description: `Recorded ${doc.referenceNumber} on ${project.title}` });
  await notify({ type: "payment", title: "Payment received", message: `${doc.referenceNumber} — ${project.title} (${doc.amount})`, link: `/projects/${id}`, entityId: id });
  if (doc.amount >= LARGE_PAYMENT_THRESHOLD) {
    await notify({ type: "payment", title: "Large payment received", message: `${doc.referenceNumber} — ${doc.amount}`, link: `/projects/${id}`, entityId: id });
  }
  revalidatePath(`/projects/${id}`);
  revalidatePath("/projects");
  revalidatePath("/clients");
  revalidatePath("/transactions");
  revalidatePath("/reports");
  revalidatePath("/dashboard");
  return { ok: true };
}
