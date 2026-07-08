import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Client } from "@/models/Client";
import { Project } from "@/models/Project";
import { Subscription } from "@/models/Subscription";
import { Contract } from "@/models/Contract";
import { Transaction } from "@/models/Transaction";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const q = new URL(req.url).searchParams.get("q")?.trim() || "";
  if (q.length < 2) return NextResponse.json({ results: [] });

  await connectDB();
  const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

  const [clients, projects, subscriptions, contracts, transactions] = await Promise.all([
    Client.find({ $or: [{ name: rx }, { company: rx }, { email: rx }, { phone: rx }, { whatsapp: rx }] }).limit(5).lean(),
    Project.find({ title: rx }).limit(5).lean(),
    Subscription.find({ $or: [{ title: rx }, { service: rx }] }).limit(5).lean(),
    Contract.find({ $or: [{ title: rx }, { contractNumber: rx }] }).limit(5).lean(),
    Transaction.find({ deletedAt: null, $or: [{ referenceNumber: rx }, { title: rx }] }).limit(5).lean(),
  ]);

  const results = [
    ...clients.map((c: any) => ({ type: "client", id: String(c._id), title: c.name, subtitle: c.company || c.phone, href: `/clients/${c._id}` })),
    ...projects.map((p: any) => ({ type: "project", id: String(p._id), title: p.title, subtitle: p.status, href: `/projects/${p._id}` })),
    ...subscriptions.map((s: any) => ({ type: "subscription", id: String(s._id), title: s.title, subtitle: s.service || s.type, href: `/subscriptions` })),
    ...contracts.map((c: any) => ({ type: "contract", id: String(c._id), title: c.title, subtitle: c.contractNumber, href: `/contracts/${c._id}` })),
    ...transactions.map((t: any) => ({ type: "transaction", id: String(t._id), title: t.referenceNumber || t.title, subtitle: t.title, href: `/transactions/${t._id}` })),
  ];

  return NextResponse.json({ results });
}
