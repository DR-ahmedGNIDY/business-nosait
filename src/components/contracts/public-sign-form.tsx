"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { SignaturePad } from "@/components/signature-pad";
import { submitPublicSignature } from "@/app/(app)/contracts/actions";
import { CheckCircle2 } from "lucide-react";

export function PublicSignForm({ publicId, ip, defaultName }: { publicId: string; ip: string; defaultName: string }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [name, setName] = useState(defaultName);
  const [agree, setAgree] = useState(false);
  const [done, setDone] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();

  if (done) {
    return (
      <Card className="mt-6 border-success/30 bg-success/5">
        <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
          <CheckCircle2 className="h-10 w-10 text-success" />
          <p className="text-lg font-semibold">Thank you — your signature has been recorded.</p>
          <p className="text-sm text-muted-foreground">The contract is now complete.</p>
        </CardContent>
      </Card>
    );
  }

  function submit() {
    if (!agree) return toast.error("Please accept the terms first");
    if (!name.trim()) return toast.error("Please enter your name");
    if (!dataUrl) return toast.error("Please provide your signature");
    start(async () => {
      const browser = navigator.userAgent;
      const res = await submitPublicSignature(publicId, { dataUrl: dataUrl!, name, ip, browser });
      if (res?.error) toast.error(res.error);
      else { setDone(true); toast.success("Signed successfully"); router.refresh(); }
    });
  }

  return (
    <Card className="mt-6">
      <CardHeader><CardTitle>Sign this contract</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Your full name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full legal name" />
        </div>
        <div>
          <Label>Signature</Label>
          <SignaturePad onChange={setDataUrl} />
        </div>
        <label className="flex items-start gap-2">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-4 w-4" />
          <span className="text-sm text-muted-foreground">I have read and agree to the terms of this contract. I understand this constitutes a legally binding electronic signature.</span>
        </label>
        <Button onClick={submit} disabled={pending} className="w-full sm:w-auto">
          {pending ? "Submitting…" : "Accept & Sign Contract"}
        </Button>
        <p className="text-xs text-muted-foreground">Your IP address, browser and timestamp will be recorded for verification.</p>
      </CardContent>
    </Card>
  );
}
