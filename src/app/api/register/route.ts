import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }
    await connectDB();
    const exists = await User.findOne({ email: parsed.data.email.toLowerCase() });
    if (exists) return NextResponse.json({ error: "Email already registered" }, { status: 409 });

    // First user becomes admin, everyone else viewer by default.
    const count = await User.countDocuments();
    const hashed = await bcrypt.hash(parsed.data.password, 10);
    const user = await User.create({
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      password: hashed,
      role: count === 0 ? "admin" : "viewer",
    });
    return NextResponse.json({ id: user._id, role: user.role }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
