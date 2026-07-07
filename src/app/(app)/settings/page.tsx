import { connectDB } from "@/lib/db";
import { Settings } from "@/models/Settings";
import { PageHeader } from "@/components/ui/misc";
import { SettingsForm } from "@/components/settings/settings-form";
import { saveSettings } from "./actions";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await connectDB();
  const settings = await Settings.findOne().lean<any>();
  return (
    <div className="animate-fade-in mx-auto max-w-3xl">
      <PageHeader title="Settings" subtitle="Company profile, currency, language and branding." />
      <SettingsForm action={saveSettings} defaults={settings ? JSON.parse(JSON.stringify(settings)) : {}} />
    </div>
  );
}
