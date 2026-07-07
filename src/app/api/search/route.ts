import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Client } from "@/models/Client";
import { Project } from "@/models/Project";
import { Contract } from "@/models/Contract";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const q = new URL(req.url).searchParams.get("q")?.trim() || "";
  if (q.length < 2) return NextResponse.json({ results: [] });

  await connectDB();
  const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

  const [clients, projects, contracts] = await Promise.all([
    Client.find({ $or: [{ name: rx }, { company: rx }, { email: rx }, { phone: rx }] }).limit(5).lean(),
    Project.find({ title: rx }).limit(5).lean(),
    Contract.find({ $or: [{ title: rx }, { contractNumber: rx }] }).limit(5).lean(),
  ]);

  const results = [
    ...clients.map((c: any) => ({ type: "client", id: String(c._id), title: c.name, subtitle: c.company, href: `/clients/${c._id}` })),
    ...projects.map((p: any) => ({ type: "project", id: String(p._id), title: p.title, subtitle: p.status, href: `/projects/${p._id}` })),
    ...contracts.map((c: any) => ({ type: "contract", id: String(c._id), title: c.title, subtitle: c.contractNumber, href: `/contracts/${c._id}` })),
  ];

  return NextResponse.json({ results });
}
