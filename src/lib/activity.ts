import { headers } from "next/headers";
import { getServerSession } from "next-auth";
import { connectDB } from "./db";
import { authOptions } from "./auth";
import { ActivityLog } from "@/models/ActivityLog";
import { Notification } from "@/models/Notification";

/** Best-effort client IP from proxy headers (Vercel/standard). */
async function currentIp(): Promise<string | undefined> {
  try {
    const h = await headers();
    return (h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || undefined) ?? undefined;
  } catch {
    return undefined;
  }
}

async function currentUserName(): Promise<string | undefined> {
  try {
    const session = await getServerSession(authOptions);
    return session?.user?.name || session?.user?.email || undefined;
  } catch {
    return undefined;
  }
}

export async function logActivity(input: {
  action: string;
  entity: string;
  entityId?: string;
  description: string;
  userName?: string;
}) {
  try {
    await connectDB();
    const [userName, ip] = await Promise.all([
      input.userName ? Promise.resolve(input.userName) : currentUserName(),
      currentIp(),
    ]);
    await ActivityLog.create({ ...input, userName, ip });
  } catch {
    /* non-blocking */
  }
}

export async function notify(input: {
  type: "renewal" | "payment" | "subscription" | "contract" | "task" | "system";
  title: string;
  message: string;
  link?: string;
  entityId?: string;
}) {
  try {
    await connectDB();
    await Notification.create(input);
  } catch {
    /* non-blocking */
  }
}

/** Threshold (in the base currency) above which a payment is flagged as large. */
export const LARGE_PAYMENT_THRESHOLD = 10000;
