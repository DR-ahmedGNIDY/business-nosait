import { connectDB } from "@/lib/db";
import { Settings } from "@/models/Settings";
import { PageHeader } from "@/components/ui/misc";
import { SettingsForm } from "@/components/settings/settings-form";
import { saveSettings } from "./actions";
import { getT } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { t } = await getT();
  await connectDB();
  const settings = await Settings.findOne().lean<any>();
  return (
    <div className="animate-fade-in mx-auto max-w-3xl">
      <PageHeader title={t("settings.title")} subtitle={t("settings.subtitle")} />
      <SettingsForm action={saveSettings} defaults={settings ? JSON.parse(JSON.stringify(settings)) : {}} />
    </div>
  );
}
