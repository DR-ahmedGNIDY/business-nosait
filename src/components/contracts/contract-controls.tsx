"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Printer, Send, Ban, Copy, Check, PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SignaturePad } from "@/components/signature-pad";
import { CONTRACT_STATUS } from "@/lib/constants";

export function PrintButton() {
  return (
    <Button variant="outline" size="sm" onClick={() => window.print()}>
      <Printer className="h-4 w-4" /> Print / PDF
    </Button>
  );
}

export function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(url); setCopied(true); toast.success("Public link copied"); setTimeout(() => setCopied(false), 1500); }}>
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} Copy sign link
    </Button>
  );
}

export function StatusControls({
  status,
  onSend,
  onCancel,
}: {
  status: string;
  onSend: () => Promise<{ error?: string; ok?: boolean } | void>;
  onCancel: () => Promise<{ error?: string; ok?: boolean } | void>;
}) {
  const [pending, start] = useTransition();
  const router = useRouter();
  const run = (fn: () => Promise<any>, msg: string) => start(async () => { const r = await fn(); if (r?.error) toast.error(r.error); else { toast.success(msg); router.refresh(); } });

  return (
    <div className="flex gap-2">
      {status !== "waiting_signature" && status !== "signed" && (
        <Button size="sm" disabled={pending} onClick={() => run(onSend, "Marked as waiting for signature")}><Send className="h-4 w-4" /> Send for signature</Button>
      )}
      {status !== "cancelled" && status !== "signed" && (
        <Button variant="outline" size="sm" className="text-danger" disabled={pending} onClick={() => run(onCancel, "Contract cancelled")}><Ban className="h-4 w-4" /> Cancel</Button>
      )}
    </div>
  );
}

export function CompanySignatureCard({
  initial,
  onSave,
}: {
  initial?: string;
  onSave: (dataUrl: string, name: string) => Promise<{ error?: string; ok?: boolean } | void>;
}) {
  const [dataUrl, setDataUrl] = useState<string | null>(initial || null);
  const [name, setName] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><PenTool className="h-4 w-4" /> Company signature</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <SignaturePad initial={initial} onChange={setDataUrl} />
        <div>
          <Label>Signatory name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Nosait Business Manager" />
        </div>
        <Button size="sm" disabled={pending || !dataUrl}
          onClick={() => start(async () => { const r = await onSave(dataUrl!, name); if (r?.error) toast.error(r.error); else { toast.success("Company signature saved"); router.refresh(); } })}>
          {pending ? "Saving…" : "Save signature"}
        </Button>
      </CardContent>
    </Card>
  );
}

export { CONTRACT_STATUS };
