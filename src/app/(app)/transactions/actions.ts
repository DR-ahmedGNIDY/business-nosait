"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Transaction } from "@/models/Transaction";
import { transactionSchema } from "@/lib/validations";
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
  const { date, clientId, ...rest } = parsed.data;
  await Transaction.create({ ...rest, clientId: clientId || undefined, date: date ? new Date(date) : new Date() });
  await logActivity({ action: "create", entity: "Transaction", description: `Recorded ${rest.title}` });
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteTransaction(id: string) {
  await requireSession();
  await connectDB();
  await Transaction.findByIdAndDelete(id);
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
}
