"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, Select } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CURRENCIES } from "@/lib/constants";
import { useT } from "@/components/i18n-provider";

export function SettingsForm({ action, defaults = {} }: { action: (fd: FormData) => Promise<{ error?: string; ok?: boolean } | void>; defaults?: Record<string, any> }) {
  const [pending, start] = useTransition();
  const t = useT();
  return (
    <form action={(fd) => start(async () => { const r = await action(fd); if (r?.error) toast.error(r.error); else toast.success(t("settings.saved")); })} className="space-y-6">
      <Card>
        <CardHeader><CardTitle>{t("settings.companyData")}</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><Label>{t("settings.businessName")}</Label><Input name="businessName" defaultValue={defaults.businessName || "Nosait Business"} /></div>
          <div><Label>{t("settings.logo")}</Label><Input name="logo" defaultValue={defaults.logo} placeholder="https://…" /></div>
          <div><Label>{t("settings.whatsapp")}</Label><Input name="whatsapp" defaultValue={defaults.whatsapp} placeholder="201000000000" /></div>
          <div><Label>{t("settings.email")}</Label><Input name="email" type="email" defaultValue={defaults.email} /></div>
          <div><Label>{t("settings.phone")}</Label><Input name="phone" defaultValue={defaults.phone} /></div>
          <div className="sm:col-span-2"><Label>{t("settings.address")}</Label><Textarea name="address" defaultValue={defaults.address} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{t("settings.preferences")}</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>{t("settings.currency")}</Label>
            <Select name="currency" defaultValue={defaults.currency || "EGP"}>{CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}</Select>
          </div>
          <div>
            <Label>{t("settings.language")}</Label>
            <Select name="language" defaultValue={defaults.language || "en"}><option value="en">English</option><option value="ar">العربية</option></Select>
          </div>
          <div>
            <Label>{t("settings.theme")}</Label>
            <Select name="theme" defaultValue={defaults.theme || "light"}><option value="light">{t("settings.light")}</option><option value="dark">{t("settings.dark")}</option><option value="system">{t("settings.system")}</option></Select>
          </div>
          <div>
            <Label>{t("settings.brandColor")}</Label>
            <div className="flex items-center gap-2">
              <Input name="primaryColor" type="color" defaultValue={defaults.primaryColor || "#1877F2"} className="h-10 w-16 p-1" />
              <span className="text-sm text-muted-foreground">{t("settings.brandColorHint")}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={pending}>{pending ? t("common.saving") : t("settings.save")}</Button>
    </form>
  );
}
