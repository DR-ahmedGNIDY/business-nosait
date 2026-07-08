"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Expense } from "@/models/Expense";
import { expenseSchema } from "@/lib/validations";
import { logActivity } from "@/lib/activity";

async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
}

export async function createExpense(formData: FormData) {
  await requireSession();
  const raw = Object.fromEntries(formData) as Record<string, any>;
  raw.recurring = formData.get("recurring") === "on";
  const parsed = expenseSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.errors[0]?.message || "Invalid input" };
  await connectDB();
  const { date, ...rest } = parsed.data;
  await Expense.create({ ...rest, date: date ? new Date(date) : new Date() });
  await logActivity({ action: "create", entity: "Expense", description: `Added expense ${rest.title}` });
  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteExpense(id: string) {
  await requireSession();
  await connectDB();
  await Expense.findByIdAndDelete(id);
  revalidatePath("/expenses");
  revalidatePath("/dashboard");
}
