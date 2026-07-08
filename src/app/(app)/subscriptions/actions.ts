"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Subscription } from "@/models/Subscription";
import { subscriptionSchema } from "@/lib/validations";
import { createTransaction } from "@/lib/ledger";
import { logActivity, notify } from "@/lib/activity";
import { currentUserLabel } from "@/lib/session";

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
  const doc = await createTransaction({
    title: `Subscription — ${sub.title}`,
    amount: sub.amount,
    method: "cash",
    source: "subscription",
    type: "income",
    clientId: sub.clientId,
    subscriptionId: sub._id,
    createdBy: await currentUserLabel(),
  });
  await logActivity({ action: "collect", entity: "Subscription", entityId: id, description: `Collected ${doc.referenceNumber} — ${sub.title}` });
  await notify({ type: "subscription", title: "Subscription collected", message: `${doc.referenceNumber} — ${sub.title}`, link: "/subscriptions", entityId: id });
  revalidatePath("/subscriptions");
  revalidatePath("/transactions");
  revalidatePath("/clients");
  revalidatePath("/reports");
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
  await notify({ type: "renewal", title: "Subscription renewed", message: `${sub.title} — next renewal ${sub.renewalDate.toISOString().slice(0, 10)}`, link: "/subscriptions", entityId: id });
  revalidatePath("/subscriptions");
  revalidatePath("/dashboard");
  return { ok: true };
}
