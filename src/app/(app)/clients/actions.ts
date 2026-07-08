"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Client } from "@/models/Client";
import { Project } from "@/models/Project";
import { Subscription } from "@/models/Subscription";
import { Contract } from "@/models/Contract";
import { clientSchema } from "@/lib/validations";
import { logActivity } from "@/lib/activity";

async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  return session;
}

function parse(formData: FormData) {
  return clientSchema.safeParse(Object.fromEntries(formData));
}

export async function createClient(formData: FormData) {
  const session = await requireSession();
  const parsed = parse(formData);
  if (!parsed.success) return { error: parsed.error.errors[0]?.message || "Invalid input" };
  await connectDB();
  const client = await Client.create(parsed.data);
  await logActivity({ action: "create", entity: "Client", entityId: String(client._id), description: `Added client ${client.name}`, userName: session.user?.name || undefined });
  revalidatePath("/clients");
  redirect(`/clients/${client._id}`);
}

export async function updateClient(id: string, formData: FormData) {
  const session = await requireSession();
  if (!mongoose.Types.ObjectId.isValid(id)) return { error: "Client not found" };
  const parsed = parse(formData);
  if (!parsed.success) return { error: parsed.error.errors[0]?.message || "Invalid input" };
  await connectDB();
  await Client.findByIdAndUpdate(id, parsed.data);
  await logActivity({ action: "update", entity: "Client", entityId: id, description: `Updated client ${parsed.data.name}`, userName: session.user?.name || undefined });
  revalidatePath("/clients");
  revalidatePath(`/clients/${id}`);
  redirect(`/clients/${id}`);
}

export async function deleteClient(id: string) {
  await requireSession();
  if (!mongoose.Types.ObjectId.isValid(id)) return { error: "Client not found" };
  await connectDB();
  await Promise.all([
    Client.findByIdAndDelete(id),
    Project.deleteMany({ clientId: id }),
    Subscription.deleteMany({ clientId: id }),
    Contract.deleteMany({ clientId: id }),
  ]);
  await logActivity({ action: "delete", entity: "Client", entityId: id, description: `Deleted a client and related records` });
  revalidatePath("/clients");
  redirect("/clients");
}
