import Image from "next/image";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Props {
  contract: any;
  clientName?: string;
  business?: string;
}

/** Printable contract body — reused by the dashboard preview and public page. */
export function ContractDocument({ contract, clientName, business = "Nosait Business" }: Props) {
  return (
    <div id="contract-print" className="mx-auto max-w-3xl rounded-lg border border-border bg-white p-8 text-[#0F172A] shadow-card print:border-0 print:shadow-none">
      <div className="mb-6 flex items-start justify-between border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1877F2] text-lg font-bold text-white">N</div>
            <div>
              <p className="text-lg font-bold">{business}</p>
              <p className="text-xs text-slate-500">Manage Clients • Projects • Contracts</p>
            </div>
          </div>
        </div>
        <div className="text-end">
          <p className="font-mono text-sm font-semibold">{contract.contractNumber}</p>
          <p className="text-xs text-slate-500">{formatDate(contract.createdAt)}</p>
        </div>
      </div>

      <h1 className="mb-1 text-2xl font-bold">{contract.title}</h1>
      <p className="mb-6 text-sm text-slate-500">Between {business} and {clientName || "the Client"}</p>

      <div className="mb-6 grid grid-cols-3 gap-3 text-sm">
        <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">Total Value</p><p className="font-bold">{formatCurrency(contract.value)}</p></div>
        <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">Advance</p><p className="font-bold">{formatCurrency(contract.advance)}</p></div>
        <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">Remaining</p><p className="font-bold">{formatCurrency(contract.remaining)}</p></div>
      </div>

      <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{contract.terms}</div>

      <div className="mt-10 grid grid-cols-2 gap-8 border-t border-border pt-6">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase text-slate-500">Company</p>
          <div className="flex h-20 items-center border-b border-slate-300">
            {contract.companySignature?.dataUrl && (
              <Image src={contract.companySignature.dataUrl} alt="Company signature" width={200} height={64} className="max-h-16 w-auto object-contain" unoptimized />
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500">{contract.companySignature?.name || business}</p>
          {contract.companySignature?.signedAt && <p className="text-[10px] text-slate-400">{formatDate(contract.companySignature.signedAt)}</p>}
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase text-slate-500">Client</p>
          <div className="flex h-20 items-center border-b border-slate-300">
            {contract.clientSignature?.dataUrl && (
              <Image src={contract.clientSignature.dataUrl} alt="Client signature" width={200} height={64} className="max-h-16 w-auto object-contain" unoptimized />
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500">{contract.clientSignature?.name || clientName || "Client"}</p>
          {contract.clientSignature?.signedAt && <p className="text-[10px] text-slate-400">{formatDate(contract.clientSignature.signedAt)}</p>}
        </div>
      </div>

      {contract.signMeta?.date && (
        <p className="mt-6 text-[10px] text-slate-400">
          Signed electronically on {formatDate(contract.signMeta.date)} · IP {contract.signMeta.ip || "—"} · {contract.signMeta.browser || ""}
        </p>
      )}
    </div>
  );
}
