import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { connectDB } from "@/lib/db";
import { Transaction } from "@/models/Transaction";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/misc";
import { EditTransactionForm } from "@/components/transactions/edit-form";
import { updateTransaction } from "../../actions";
import { formatDateISO } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function EditTransactionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connectDB();
  const tx = await Transaction.findOne({ _id: id, deletedAt: null }).lean<any>();
  if (!tx) notFound();

  return (
    <div className="animate-fade-in mx-auto max-w-2xl space-y-4">
      <Link href={`/transactions/${id}`}><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /> Back</Button></Link>
      <PageHeader title={`Edit ${tx.referenceNumber || "transaction"}`} subtitle="Amounts and status re-sync collected balances automatically." />
      <EditTransactionForm
        tx={{ title: tx.title, amount: tx.amount, method: tx.method, status: tx.status, date: formatDateISO(tx.date), note: tx.note }}
        action={updateTransaction.bind(null, id)}
      />
    </div>
  );
}
