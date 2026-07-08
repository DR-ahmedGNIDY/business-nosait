import { Types } from "mongoose";
import { Project } from "@/models/Project";
import { Subscription } from "@/models/Subscription";
import { Transaction } from "@/models/Transaction";

/**
 * Recompute a project's collected/remaining amounts from its COMPLETED
 * transactions. Transactions are the single source of truth; paidAmount and
 * remainingAmount are cached projections kept in sync here.
 */
export async function syncProjectPayments(projectId: string | Types.ObjectId) {
  const project = await Project.findById(projectId);
  if (!project) return;
  const agg = await Transaction.aggregate([
    { $match: { projectId: new Types.ObjectId(String(projectId)), source: "project", status: "completed", deletedAt: null } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  project.paidAmount = agg[0]?.total || 0;
  await project.save(); // pre-save hook recomputes remainingAmount from price - paidAmount
}

/**
 * Mark a subscription collected when its COMPLETED transactions cover its amount.
 */
export async function syncSubscriptionCollected(subscriptionId: string | Types.ObjectId) {
  const sub = await Subscription.findById(subscriptionId);
  if (!sub) return;
  const agg = await Transaction.aggregate([
    { $match: { subscriptionId: new Types.ObjectId(String(subscriptionId)), source: "subscription", status: "completed", deletedAt: null } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const total = agg[0]?.total || 0;
  sub.collected = total > 0 && total >= (sub.amount || 0);
  await sub.save();
}
