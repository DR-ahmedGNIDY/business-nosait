import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { toCSV } from "@/lib/reports";
import { periodRange } from "@/lib/date-range";
import { Transaction } from "@/models/Transaction";
import { Expense } from "@/models/Expense";
import { Client } from "@/models/Client";
import { Project } from "@/models/Project";
import { Subscription } from "@/models/Subscription";
import { formatDateISO } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function rowsFor(entity: string, sp: URLSearchParams): Promise<Record<string, any>[]> {
  switch (entity) {
    case "transactions": {
      const filter: any = { deletedAt: null };
      if (sp.get("method")) filter.method = sp.get("method");
      if (sp.get("source")) filter.source = sp.get("source");
      if (sp.get("status")) filter.status = sp.get("status");
      if (sp.get("clientId")) filter.clientId = sp.get("clientId");
      if (sp.get("projectId")) filter.projectId = sp.get("projectId");
      if (sp.get("subscriptionId")) filter.subscriptionId = sp.get("subscriptionId");
      const range = periodRange(sp.get("period") || undefined);
      if (range) filter.date = { $gte: range.from, $lte: range.to };
      const txns = await Transaction.find(filter).sort({ date: -1 })
        .populate("clientId", "name").populate("projectId", "title").populate("subscriptionId", "title").lean();
      return txns.map((t: any) => ({
        reference: t.referenceNumber || "",
        date: formatDateISO(t.date),
        client: t.clientId?.name || "",
        linkedTo: t.projectId?.title || t.subscriptionId?.title || "",
        source: t.source,
        type: t.type || "income",
        amount: t.amount,
        status: t.status,
        method: t.method,
        createdBy: t.createdBy || "",
        note: t.note || "",
      }));
    }
    case "expenses": {
      const rows = await Expense.find().sort({ date: -1 }).lean();
      return rows.map((e: any) => ({ title: e.title, category: e.category, amount: e.amount, method: e.method, date: formatDateISO(e.date), recurring: e.recurring ? "yes" : "no", note: e.note || "" }));
    }
    case "clients": {
      const rows = await Client.find().sort({ name: 1 }).lean();
      return rows.map((c: any) => ({ name: c.name, company: c.company || "", phone: c.phone || "", email: c.email || "", status: c.status, address: c.address || "" }));
    }
    case "projects": {
      const rows = await Project.find().populate("clientId", "name").sort({ createdAt: -1 }).lean();
      return rows.map((p: any) => ({ title: p.title, client: p.clientId?.name || "", category: p.category, status: p.status, price: p.price, collected: p.paidAmount, remaining: p.remainingAmount }));
    }
    case "subscriptions": {
      const rows = await Subscription.find().populate("clientId", "name").sort({ renewalDate: 1 }).lean();
      return rows.map((s: any) => ({ title: s.title, client: s.clientId?.name || "", type: s.type, amount: s.amount, renewalDate: formatDateISO(s.renewalDate), status: s.status, collected: s.collected ? "yes" : "no" }));
    }
    default:
      return [];
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ entity: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { entity } = await params;
  const allowed = ["transactions", "expenses", "clients", "projects", "subscriptions"];
  if (!allowed.includes(entity)) return NextResponse.json({ error: "Unknown export" }, { status: 404 });

  await connectDB();
  const url = new URL(req.url);
  const format = url.searchParams.get("format") || "csv";
  const rows = await rowsFor(entity, url.searchParams);
  const csv = rows.length ? toCSV(rows) : "";
  // Excel opens UTF-8 CSV cleanly when a BOM is present.
  const body = format === "excel" ? "﻿" + csv : csv;
  const stamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(body, {
    headers: {
      "Content-Type": format === "excel" ? "application/vnd.ms-excel; charset=utf-8" : "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${entity}-${stamp}.csv"`,
    },
  });
}
