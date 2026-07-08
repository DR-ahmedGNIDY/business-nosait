"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Subscription } from "@/models/Subscription";
import { Transaction } from "@/models/Transaction";
import { subscriptionSchema } from "@/lib/validations";
import { syncSubscriptionCollected } from "@/lib/sync";
import { logActivity } from "@/lib/activity";

async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
}

function normalize(fd: FormData) {
  const raw = Object.fromEntries(fd) as Record<string, any>;
  raw.collected = fd.get("collected") === "on" || fd.get("collected") === "true";
  return subscriptionSchema.safeParse(raw);
}

export async function createSubscription(formData: FormData) {
  await requireSession();
  const parsed = normalize(formData);
  if (!parsed.success) return { error: parsed.error.errors[0]?.message || "Invalid input" };
  await connectDB();
  const { renewalDate, projectId, ...rest } = parsed.data;
  const sub = await Subscription.create({ ...rest, projectId: projectId || undefined, renewalDate: new Date(renewalDate) });
  await logActivity({ action: "create", entity: "Subscription", entityId: String(sub._id), description: `Created subscription ${sub.title}` });
  revalidatePath("/subscriptions");
  redirect("/subscriptions");
}

export async function updateSubscription(id: string, formData: FormData) {
  await requireSession();
  const parsed = normalize(formData);
  if (!parsed.success) return { error: parsed.error.errors[0]?.message || "Invalid input" };
  await connectDB();
  const { renewalDate, projectId, ...rest } = parsed.data;
  await Subscription.findByIdAndUpdate(id, { ...rest, projectId: projectId || undefined, renewalDate: new Date(renewalDate) });
  await logActivity({ action: "update", entity: "Subscription", entityId: id, description: `Updated subscription` });
  revalidatePath("/subscriptions");
  redirect("/subscriptions");
}

export async function deleteSubscription(id: string) {
  await requireSession();
  await connectDB();
  await Subscription.findByIdAndDelete(id);
  revalidatePath("/subscriptions");
}

/** Mark a subscription collected and record a separate (non-project) transaction. */
export async function collectSubscription(id: string) {
  await requireSession();
  await connectDB();
  const sub = await Subscription.findById(id);
  if (!sub) return { error: "Not found" };
  await Transaction.create({
    title: `Subscription — ${sub.title}`,
    amount: sub.amount,
    method: "cash",
    source: "subscription",
    status: "completed",
    clientId: sub.clientId,
    subscriptionId: sub._id,
  });
  await syncSubscriptionCollected(sub._id); // sets collected from completed transactions
  await logActivity({ action: "collect", entity: "Subscription", entityId: id, description: `Collected subscription ${sub.title}` });
  revalidatePath("/subscriptions");
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  return { ok: true };
}

/** Roll the renewal date forward by its cycle and reset collected. */
export async function renewSubscription(id: string) {
  await requireSession();
  await connectDB();
  const sub = await Subscription.findById(id);
  if (!sub) return { error: "Not found" };
  const d = new Date(sub.renewalDate);
  if (sub.type === "monthly") d.setMonth(d.getMonth() + 1);
  else if (sub.type === "yearly") d.setFullYear(d.getFullYear() + 1);
  else d.setFullYear(d.getFullYear() + 1);
  sub.renewalDate = d;
  sub.status = "active";
  sub.collected = false;
  await sub.save();
  await logActivity({ action: "renew", entity: "Subscription", entityId: id, description: `Renewed subscription ${sub.title}` });
  revalidatePath("/subscriptions");
  return { ok: true };
}
