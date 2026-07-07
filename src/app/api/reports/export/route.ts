import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getReportData, toCSV } from "@/lib/reports";

// CSV export (Excel-compatible). ?type=top-clients | outstanding | renewals
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const type = new URL(req.url).searchParams.get("type") || "top-clients";
  const data = await getReportData();

  let rows: Record<string, any>[] = [];
  if (type === "top-clients") rows = data.topClients.map((c) => ({ Client: c.name, Projects: c.projects, Collected: c.collected }));
  else if (type === "outstanding") rows = data.outstanding.map((o) => ({ Project: o.title, Client: o.client, Remaining: o.remaining }));
  else if (type === "renewals") rows = data.upcomingRenewals.map((r) => ({ Service: r.title, Client: r.client, Amount: r.amount, Renewal: new Date(r.renewalDate).toISOString().slice(0, 10), DaysLeft: r.days }));

  const csv = "﻿" + toCSV(rows); // BOM for Excel UTF-8
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="nosait-${type}.csv"`,
    },
  });
}
