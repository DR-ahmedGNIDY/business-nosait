import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB } from "../src/lib/db";
import { User } from "../src/models/User";

const EMAIL = (process.env.CHECK_EMAIL || "ahmed@nosait.com").toLowerCase();
const PASSWORD = process.env.CHECK_PASSWORD || "";

async function main() {
  await connectDB();
  const user = await User.findOne({ email: EMAIL }).select("+password");
  console.log("DB:", mongoose.connection.name);
  if (!user) {
    console.log("✖ No user found with email:", EMAIL);
    const all = await User.find().select("email role");
    console.log("Existing users:", all.map((u) => `${u.email} (${u.role})`));
  } else {
    console.log("✔ User found:", user.email, "| role:", user.role, "| active:", user.active);
    if (PASSWORD) {
      const ok = await bcrypt.compare(PASSWORD, user.password);
      console.log(ok ? "✔ Password MATCHES" : "✖ Password does NOT match");
    }
  }
  await mongoose.disconnect();
}
main().catch((e) => { console.error("✖", e.message); process.exit(1); });
