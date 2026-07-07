import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB } from "../src/lib/db";
import { User } from "../src/models/User";
import { Settings } from "../src/models/Settings";

const NAME = process.env.ADMIN_NAME || "Ahmed";
const EMAIL = process.env.ADMIN_EMAIL || "ahmed@nosait.com";
const PASSWORD = process.env.ADMIN_PASSWORD;

if (!PASSWORD) {
  console.error("✖ Set ADMIN_PASSWORD env var, e.g. ADMIN_PASSWORD=... npx tsx scripts/create-admin.ts");
  process.exit(1);
}

async function main() {
  await connectDB();
  const hashed = await bcrypt.hash(PASSWORD as string, 10);

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
  console.log("  Login password:", PASSWORD);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error("✖ Failed:", e.message);
  process.exit(1);
});
