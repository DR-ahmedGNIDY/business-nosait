import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Notification } from "@/models/Notification";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const [items, unread] = await Promise.all([
    Notification.find().sort({ createdAt: -1 }).limit(20).lean(),
    Notification.countDocuments({ read: false }),
  ]);
  return NextResponse.json({ items, unread });
}

export async function PATCH() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  await Notification.updateMany({ read: false }, { read: true });
  return NextResponse.json({ ok: true });
}
