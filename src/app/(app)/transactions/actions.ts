"use server";

import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Transaction } from "@/models/Transaction";
import { transactionSchema, transactionUpdateSchema } from "@/lib/validations";
import { createTransaction as ledgerCreate, softDeleteTransaction, updateTransaction as ledgerUpdate } from "@/lib/ledger";
import { logActivity, notify, LARGE_PAYMENT_THRESHOLD } from "@/lib/activity";
import { requireSession, currentUserLabel } from "@/lib/session";

function revalidateFinance() {
  revalidatePath("/transactions");
  revalidatePath("/projects");
  revalidatePath("/subscriptions");
  revalidatePath("/clients");
  revalidatePath("/reports");
  revalidatePath("/dashboard");
}

export async function createTransaction(formData: FormData) {
  await requireSession();
  const parsed = transactionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message || "Invalid input" };
  await connectDB();
  const { date, clientId, projectId, subscriptionId, ...rest } = parsed.data;
  const createdBy = await currentUserLabel();
  const doc = await ledgerCreate({
    ...rest,
    type: rest.source === "manual" ? "adjustment" : "income",
    clientId: clientId ? (clientId as any) : undefined,
    projectId: projectId ? (projectId as any) : undefined,
    subscriptionId: subscriptionId ? (subscriptionId as any) : undefined,
    date: date ? new Date(date) : new Date(),
    createdBy,
  });

  await logActivity({ action: "create", entity: "Transaction", entityId: String(doc._id), description: `Recorded ${doc.referenceNumber} — ${doc.title}` });
  await notify({ type: "payment", title: "New transaction", message: `${doc.referenceNumber} — ${doc.title} (${doc.amount})`, link: "/transactions", entityId: String(doc._id) });
  if (doc.status === "completed" && doc.amount >= LARGE_PAYMENT_THRESHOLD) {
    await notify({ type: "payment", title: "Large payment received", message: `${doc.referenceNumber} — ${doc.amount}`, link: "/transactions", entityId: String(doc._id) });
  }
  revalidateFinance();
  return { ok: true };
}

export async function updateTransaction(id: string, formData: FormData) {
  await requireSession();
  if (!mongoose.Types.ObjectId.isValid(id)) return { error: "Transaction not found" };
  const parsed = transactionUpdateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message || "Invalid input" };
  await connectDB();
  const { date, ...rest } = parsed.data;
  const doc = await ledgerUpdate(id, { ...rest, ...(date ? { date: new Date(date) } : {}) });
  if (!doc) return { error: "Transaction not found" };
  await logActivity({ action: "update", entity: "Transaction", entityId: id, description: `Edited ${doc.referenceNumber}` });
  revalidateFinance();
  return { ok: true };
}

export async function deleteTransaction(id: string) {
  await requireSession();
  if (!mongoose.Types.ObjectId.isValid(id)) return { error: "Transaction not found" };
  await connectDB();
  const doc = await softDeleteTransaction(id);
  if (doc) {
    await logActivity({ action: "delete", entity: "Transaction", entityId: id, description: `Deleted ${doc.referenceNumber} — ${doc.title}` });
  }
  revalidateFinance();
  return { ok: true };
}
