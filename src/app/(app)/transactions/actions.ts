"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Transaction } from "@/models/Transaction";
import { transactionSchema } from "@/lib/validations";
import { syncProjectPayments, syncSubscriptionCollected } from "@/lib/sync";
import { logActivity } from "@/lib/activity";

async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
}

export async function createTransaction(formData: FormData) {
  await requireSession();
  const parsed = transactionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message || "Invalid input" };
  await connectDB();
  const { date, clientId, projectId, subscriptionId, ...rest } = parsed.data;
  const doc = await Transaction.create({
    ...rest,
    clientId: clientId || undefined,
    projectId: projectId || undefined,
    subscriptionId: subscriptionId || undefined,
    date: date ? new Date(date) : new Date(),
  });
  // Keep the linked object's collected/remaining projection in sync.
  if (doc.source === "project" && doc.projectId) await syncProjectPayments(doc.projectId);
  if (doc.source === "subscription" && doc.subscriptionId) await syncSubscriptionCollected(doc.subscriptionId);
  await logActivity({ action: "create", entity: "Transaction", description: `Recorded ${rest.title}` });
  revalidatePath("/transactions");
  revalidatePath("/projects");
  revalidatePath("/subscriptions");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteTransaction(id: string) {
  await requireSession();
  await connectDB();
  const doc = await Transaction.findByIdAndDelete(id);
  if (doc?.source === "project" && doc.projectId) await syncProjectPayments(doc.projectId);
  if (doc?.source === "subscription" && doc.subscriptionId) await syncSubscriptionCollected(doc.subscriptionId);
  revalidatePath("/transactions");
  revalidatePath("/projects");
  revalidatePath("/subscriptions");
  revalidatePath("/dashboard");
}
