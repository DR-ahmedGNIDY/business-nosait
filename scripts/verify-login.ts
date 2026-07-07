import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB } from "../src/lib/db";
import { User } from "../src/models/User";
import { envOr } from "./lib/env";

const EMAIL: string = envOr("CHECK_EMAIL", "ahmed@nosait.com").toLowerCase();
const PASSWORD: string = envOr("CHECK_PASSWORD", "");

async function main(): Promise<void> {
  await connectDB();
  const user = await User.findOne({ email: EMAIL }).select("+password");
  console.log("DB:", mongoose.connection.name);

  if (!user) {
    console.log("✖ No user found with email:", EMAIL);
    const all = await User.find().select("email role");
    console.log("Existing users:", all.map((u) => `${u.email} (${u.role})`));
  } else {
    console.log("✔ User found:", user.email, "| role:", user.role, "| active:", user.active);
    if (PASSWORD !== "") {
      const ok: boolean = await bcrypt.compare(PASSWORD, user.password);
      console.log(ok ? "✔ Password MATCHES" : "✖ Password does NOT match");
    }
  }
  await mongoose.disconnect();
}

main().catch((e: unknown) => {
  console.error("✖", e instanceof Error ? e.message : e);
  process.exit(1);
});
