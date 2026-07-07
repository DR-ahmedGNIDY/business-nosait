import { connectDB } from "./db";
import { ActivityLog } from "@/models/ActivityLog";
import { Notification } from "@/models/Notification";

export async function logActivity(input: {
  action: string;
  entity: string;
  entityId?: string;
  description: string;
  userName?: string;
}) {
  try {
    await connectDB();
    await ActivityLog.create(input);
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
