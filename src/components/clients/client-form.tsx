"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, Select } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { CLIENT_STATUS } from "@/lib/constants";

interface Props {
  action: (formData: FormData) => Promise<{ error?: string } | void>;
  defaults?: Record<string, any>;
  submitLabel?: string;
}

export function ClientForm({ action, defaults = {}, submitLabel = "Save client" }: Props) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      action={(fd) =>
        start(async () => {
          setError(null);
          const res = await action(fd);
          if (res?.error) {
            setError(res.error);
            toast.error(res.error);
          }
        })
      }
    >
      <Card>
        <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
          <div>
            <Label>Full name *</Label>
            <Input name="name" defaultValue={defaults.name} required />
          </div>
          <div>
            <Label>Company</Label>
            <Input name="company" defaultValue={defaults.company} />
          </div>
          <div>
            <Label>Phone</Label>
            <Input name="phone" defaultValue={defaults.phone} placeholder="201001234567" />
          </div>
          <div>
            <Label>WhatsApp</Label>
            <Input name="whatsapp" defaultValue={defaults.whatsapp} placeholder="201001234567" />
          </div>
          <div>
            <Label>Email</Label>
            <Input name="email" type="email" defaultValue={defaults.email} />
          </div>
          <div>
            <Label>Status</Label>
            <Select name="status" defaultValue={defaults.status || "active"}>
              {CLIENT_STATUS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label>Address</Label>
            <Input name="address" defaultValue={defaults.address} />
          </div>
          <div className="sm:col-span-2">
            <Label>Notes</Label>
            <Textarea name="notes" defaultValue={defaults.notes} />
          </div>
          {error && <p className="text-sm text-danger sm:col-span-2">{error}</p>}
          <div className="sm:col-span-2">
            <Button type="submit" disabled={pending}>{pending ? "Saving…" : submitLabel}</Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
