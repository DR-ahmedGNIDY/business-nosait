import { Transaction, ITransaction } from "@/models/Transaction";
import { nextRef } from "@/models/Counter";
import { syncProjectPayments, syncSubscriptionCollected } from "./sync";

type NewTransaction = Partial<ITransaction> & { amount: number; title: string; source: ITransaction["source"] };

/** Sync the object a transaction is linked to (project/subscription). */
async function syncLinks(doc: Pick<ITransaction, "source" | "projectId" | "subscriptionId">) {
  if (doc.source === "project" && doc.projectId) await syncProjectPayments(doc.projectId);
  if (doc.source === "subscription" && doc.subscriptionId) await syncSubscriptionCollected(doc.subscriptionId);
}

/**
 * Create a ledger transaction: assigns a unique referenceNumber, defaults
 * type/status, then synchronises the linked object. Single entry point so
 * every code path stays consistent.
 */
export async function createTransaction(data: NewTransaction) {
  const referenceNumber = await nextRef("TXN");
  const doc = await Transaction.create({
    type: "income",
    status: "completed",
    date: new Date(),
    ...data,
    referenceNumber,
    deletedAt: null,
  });
  await syncLinks(doc);
  return doc;
}

/** Soft-delete a transaction (keeps the audit trail) and re-sync its links. */
export async function softDeleteTransaction(id: string) {
  const doc = await Transaction.findById(id);
  if (!doc || doc.deletedAt) return null;
  doc.deletedAt = new Date();
  await doc.save();
  await syncLinks(doc);
  return doc;
}

/** Update mutable fields of a transaction, then re-sync links (old + new). */
export async function updateTransaction(id: string, patch: Partial<ITransaction>) {
  const doc = await Transaction.findById(id);
  if (!doc || doc.deletedAt) return null;
  const prev = { source: doc.source, projectId: doc.projectId, subscriptionId: doc.subscriptionId };
  Object.assign(doc, patch);
  await doc.save();
  await syncLinks(prev); // in case the link changed
  await syncLinks(doc);
  return doc;
}
