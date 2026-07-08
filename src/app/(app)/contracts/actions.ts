"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Contract } from "@/models/Contract";
import { Client } from "@/models/Client";
import { contractSchema } from "@/lib/validations";
import { logActivity, notify } from "@/lib/activity";
import { slugId } from "@/lib/utils";
import { nextSequence } from "@/models/Counter";

async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
}

async function nextContractNumber() {
  const year = new Date().getFullYear();
  // Atomic, monotonic sequence — never repeats even after deletions.
  const n = await nextSequence(`contract-${year}`);
  return `NB-${year}-${String(n).padStart(4, "0")}`;
}

export async function createContract(formData: FormData) {
  await requireSession();
  const parsed = contractSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message || "Invalid input" };
  await connectDB();
  const { projectId, ...rest } = parsed.data;
  const contract = await Contract.create({
    ...rest,
    projectId: projectId || undefined,
    contractNumber: await nextContractNumber(),
    publicId: slugId(),
    timeline: [{ event: "created", at: new Date() }],
  });
  await logActivity({ action: "create", entity: "Contract", entityId: String(contract._id), description: `Created contract ${contract.contractNumber}` });
  revalidatePath("/contracts");
  redirect(`/contracts/${contract._id}`);
}

export async function updateContract(id: string, formData: FormData) {
  await requireSession();
  if (!mongoose.Types.ObjectId.isValid(id)) return { error: "Not found" };
  const parsed = contractSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message || "Invalid input" };
  await connectDB();
  const { projectId, ...rest } = parsed.data;
  const contract = await Contract.findById(id);
  if (!contract) return { error: "Not found" };
  Object.assign(contract, rest, { projectId: projectId || undefined });
  await contract.save();
  revalidatePath(`/contracts/${id}`);
  redirect(`/contracts/${id}`);
}

export async function setContractStatus(id: string, status: "draft" | "waiting_signature" | "signed" | "cancelled") {
  await requireSession();
  if (!mongoose.Types.ObjectId.isValid(id)) return { error: "Not found" };
  await connectDB();
  const contract = await Contract.findById(id);
  if (!contract) return { error: "Not found" };
  contract.status = status;
  if (status === "waiting_signature") contract.timeline.push({ event: "sent", at: new Date() });
  if (status === "signed") contract.timeline.push({ event: "signed", at: new Date() });
  await contract.save();
  await logActivity({ action: "status", entity: "Contract", entityId: id, description: `Contract ${contract.contractNumber} → ${status}` });
  if (status === "signed") await notify({ type: "contract", title: "Contract signed", message: `${contract.contractNumber} marked signed`, link: `/contracts/${id}`, entityId: id });
  revalidatePath(`/contracts/${id}`);
  return { ok: true };
}

/** Company-side signature saved from the dashboard. */
export async function saveCompanySignature(id: string, dataUrl: string, name: string) {
  await requireSession();
  if (!mongoose.Types.ObjectId.isValid(id)) return { error: "Not found" };
  await connectDB();
  const contract = await Contract.findById(id);
  if (!contract) return { error: "Not found" };
  contract.companySignature = { dataUrl, name, signedAt: new Date() };
  await contract.save();
  revalidatePath(`/contracts/${id}`);
  return { ok: true };
}

export async function deleteContract(id: string) {
  await requireSession();
  if (!mongoose.Types.ObjectId.isValid(id)) return { error: "Not found" };
  await connectDB();
  const contract = await Contract.findByIdAndDelete(id);
  await logActivity({ action: "delete", entity: "Contract", entityId: id, description: `Deleted contract ${contract?.contractNumber || id}` });
  revalidatePath("/contracts");
  redirect("/contracts");
}

/**
 * PUBLIC action — called from the unauthenticated signing page.
 * Records the client's signature plus audit metadata (IP, browser, time).
 */
export async function submitPublicSignature(publicId: string, input: {
  dataUrl: string;
  name: string;
  ip?: string;
  browser?: string;
}) {
  await connectDB();
  const contract = await Contract.findOne({ publicId });
  if (!contract) return { error: "Contract not found" };
  if (contract.status === "signed") return { error: "Already signed" };

  contract.clientSignature = { dataUrl: input.dataUrl, name: input.name, signedAt: new Date() };
  contract.status = "signed";
  contract.signMeta = { ip: input.ip, browser: input.browser, date: new Date() };
  contract.timeline.push({ event: "signed", at: new Date(), meta: input.name });
  contract.timeline.push({ event: "completed", at: new Date() });
  await contract.save();

  const client = await Client.findById(contract.clientId).lean<any>();
  await notify({
    type: "contract",
    title: "Contract signed",
    message: `${contract.contractNumber} was signed by ${client?.name || input.name}.`,
    link: `/contracts/${contract._id}`,
    entityId: String(contract._id),
  });
  await logActivity({ action: "sign", entity: "Contract", entityId: String(contract._id), description: `Contract ${contract.contractNumber} signed by client` });
  return { ok: true };
}

/** Mark the public page as viewed (first open). */
export async function markContractViewed(publicId: string) {
  await connectDB();
  const contract = await Contract.findOne({ publicId });
  if (!contract) return;
  const alreadyViewed = contract.timeline.some((t: any) => t.event === "viewed");
  if (!alreadyViewed) {
    contract.timeline.push({ event: "viewed", at: new Date() });
    await contract.save();
  }
}
