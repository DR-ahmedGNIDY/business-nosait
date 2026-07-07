import { connectDB } from "./db";
import { Subscription } from "@/models/Subscription";
import { Contract } from "@/models/Contract";
import { Notification } from "@/models/Notification";
import { daysUntil, formatCurrency } from "./utils";

/**
 * Reminder engine. Scans subscriptions against their reminderDays thresholds
 * (30/15/7/3/1) and creates a notification once per (subscription, threshold).
 * Also flips past-due active subscriptions to "expired".
 */
export async function runReminderEngine() {
  await connectDB();
  const subs = await Subscription.find({ status: { $in: ["active", "pending"] } }).populate("clientId", "name").lean();
  let created = 0;

  for (const s of subs as any[]) {
    const days = daysUntil(s.renewalDate);
    if (days === null) continue;

    // Mark expired.
    if (days < 0) {
      await Subscription.updateOne({ _id: s._id }, { status: "expired" });
      continue;
    }

    const thresholds: number[] = s.reminderDays || [30, 15, 7, 3, 1];
    if (thresholds.includes(days)) {
      const key = `sub-${s._id}-${days}`;
      const exists = await Notification.findOne({ link: `/subscriptions`, message: new RegExp(key) });
      if (!exists) {
        await Notification.create({
          type: "renewal",
          title: `Renewal in ${days} day${days === 1 ? "" : "s"}`,
          message: `${s.title} (${s.clientId?.name || "client"}) — ${formatCurrency(s.amount)} due. [${key}]`,
          link: "/subscriptions",
          entityId: s._id,
        });
        created++;
      }
    }
  }

  // Contracts waiting for signature > 3 days → reminder
  const pending = await Contract.find({ status: "waiting_signature" }).lean();
  for (const c of pending as any[]) {
    const key = `contract-${c._id}`;
    const exists = await Notification.findOne({ message: new RegExp(key) });
    if (!exists) {
      await Notification.create({
        type: "contract",
        title: "Contract awaiting signature",
        message: `${c.contractNumber} — ${c.title} is waiting to be signed. [${key}]`,
        link: `/contracts/${c._id}`,
        entityId: c._id,
      });
      created++;
    }
  }

  return { created };
}
