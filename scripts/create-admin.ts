import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB } from "../src/lib/db";
import { User } from "../src/models/User";
import { Settings } from "../src/models/Settings";
import { requireEnv, envOr } from "./lib/env";

// `requireEnv`/`envOr` guarantee `string`, so no casts or assertions are needed.
const NAME: string = envOr("ADMIN_NAME", "Ahmed");
const EMAIL: string = envOr("ADMIN_EMAIL", "ahmed@nosait.com").toLowerCase();
const PASSWORD: string = requireEnv("ADMIN_PASSWORD");

async function main(): Promise<void> {
  await connectDB();

  const hashed: string = await bcrypt.hash(PASSWORD, 10);

  const user = await User.findOneAndUpdate(
    { email: EMAIL },
    { name: NAME, email: EMAIL, password: hashed, role: "admin", active: true },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // Ensure a settings document exists.
  await Settings.findOneAndUpdate({}, { businessName: "Nosait Business", currency: "EGP" }, { upsert: true });

  console.log("✔ Admin account ready");
  console.log("  Email:", user.email);
  console.log("  Role: ", user.role);
  await mongoose.disconnect();
}

main().catch((e: unknown) => {
  console.error("✖ Failed:", e instanceof Error ? e.message : e);
  process.exit(1);
});
