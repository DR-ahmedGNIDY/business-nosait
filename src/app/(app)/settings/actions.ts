"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Settings } from "@/models/Settings";

export async function saveSettings(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Unauthorized" };
  await connectDB();
  const data = {
    businessName: String(formData.get("businessName") || "Nosait Business"),
    logo: String(formData.get("logo") || ""),
    whatsapp: String(formData.get("whatsapp") || ""),
    email: String(formData.get("email") || ""),
    phone: String(formData.get("phone") || ""),
    address: String(formData.get("address") || ""),
    currency: String(formData.get("currency") || "EGP"),
    language: (String(formData.get("language") || "en") as "en" | "ar"),
    theme: (String(formData.get("theme") || "light") as "light" | "dark" | "system"),
    primaryColor: String(formData.get("primaryColor") || "#1877F2"),
  };
  await Settings.findOneAndUpdate({}, data, { upsert: true, new: true });
  revalidatePath("/settings");
  return { ok: true };
}
