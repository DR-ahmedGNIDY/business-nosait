import { NextResponse } from "next/server";
import { runReminderEngine } from "@/lib/reminders";

// Trigger via cron (e.g. Vercel Cron / external scheduler) or manually.
export async function GET() {
  const result = await runReminderEngine();
  return NextResponse.json({ ok: true, ...result });
}
