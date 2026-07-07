"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Notification } from "@/models/Notification";

async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
}

export async function markRead(id: string) {
  await requireSession();
  await connectDB();
  await Notification.findByIdAndUpdate(id, { read: true });
  revalidatePath("/notifications");
}

export async function markAllRead() {
  await requireSession();
  await connectDB();
  await Notification.updateMany({ read: false }, { read: true });
  revalidatePath("/notifications");
}

export async function clearRead() {
  await requireSession();
  await connectDB();
  await Notification.deleteMany({ read: true });
  revalidatePath("/notifications");
}
