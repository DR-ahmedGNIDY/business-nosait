"use client";

import { useState } from "react";
import { MessageCircle, ChevronDown } from "lucide-react";
import { waLink, WA_TEMPLATES, type WaTemplateKey } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";

const TEMPLATE_LABELS: { key: WaTemplateKey; label: string }[] = [
  { key: "renewalReminder", label: "Renewal Reminder" },
  { key: "paymentReminder", label: "Payment Reminder" },
  { key: "contractReminder", label: "Contract Reminder" },
  { key: "hostingRenewal", label: "Hosting Renewal" },
  { key: "maintenanceRenewal", label: "Maintenance Renewal" },
];

interface Ctx {
  clientName?: string;
  business?: string;
  amount?: number;
  service?: string;
  date?: string;
  contractUrl?: string;
}

export function WhatsAppButton({ phone, ctx = {} }: { phone?: string; ctx?: Ctx }) {
  const [open, setOpen] = useState(false);
  if (!phone) return null;

  return (
    <div className="relative">
      <div className="flex">
        <a href={waLink(phone)} target="_blank" rel="noopener noreferrer">
          <Button variant="success" className="rounded-e-none">
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </Button>
        </a>
        <Button variant="success" className="rounded-s-none border-s border-white/20 px-2" onClick={() => setOpen((v) => !v)}>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-1 w-56 rounded-lg border border-border bg-popover p-1 shadow-pop">
            <p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground">Send template</p>
            {TEMPLATE_LABELS.map(({ key, label }) => (
              <a
                key={key}
                href={waLink(phone, WA_TEMPLATES[key]({ ...ctx, date: ctx.date }))}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="block rounded-md px-3 py-2 text-sm hover:bg-muted"
              >
                {label}
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
