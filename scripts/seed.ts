import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB } from "../src/lib/db";
import { User } from "../src/models/User";
import { Client } from "../src/models/Client";
import { Project } from "../src/models/Project";
import { Subscription } from "../src/models/Subscription";
import { Expense } from "../src/models/Expense";
import { Transaction } from "../src/models/Transaction";
import { Contract } from "../src/models/Contract";
import { Settings } from "../src/models/Settings";
import { Counter } from "../src/models/Counter";
import { slugId } from "../src/lib/utils";

function addDays(n: number) {
  return new Date(Date.now() + n * 86400000);
}

async function main() {
  await connectDB();
  console.log("Connected. Clearing collections…");
  await Promise.all([
    User.deleteMany({}),
    Client.deleteMany({}),
    Project.deleteMany({}),
    Subscription.deleteMany({}),
    Expense.deleteMany({}),
    Transaction.deleteMany({}),
    Contract.deleteMany({}),
    Settings.deleteMany({}),
    Counter.deleteMany({}),
  ]);

  await User.create({
    name: "Nosait Admin",
    email: "admin@nosait.com",
    password: await bcrypt.hash("admin123", 10),
    role: "admin",
  });

  await Settings.create({ businessName: "Nosait Business", whatsapp: "201000000000", email: "hello@nosait.com", currency: "EGP" });

  const clients = await Client.create([
    { name: "Ahmed Hassan", company: "Cairo Retail Co.", phone: "201001234567", whatsapp: "201001234567", email: "ahmed@cairoretail.com", status: "active", address: "Nasr City, Cairo" },
    { name: "Sara Mahmoud", company: "Bloom Cosmetics", phone: "201112223344", whatsapp: "201112223344", email: "sara@bloom.com", status: "active" },
    { name: "Omar Khaled", company: "TechNova", phone: "201223334455", whatsapp: "201223334455", email: "omar@technova.io", status: "lead" },
  ]);

  const p1 = await Project.create({
    title: "Corporate Website", clientId: clients[0]._id, price: 40000, cost: 12000, category: "website",
    status: "in_progress", startDate: addDays(-30), deliveryDate: addDays(20), paidAmount: 20000,
  });
  const p2 = await Project.create({
    title: "E-commerce Store", clientId: clients[1]._id, price: 65000, cost: 20000, category: "store",
    status: "completed", startDate: addDays(-90), deliveryDate: addDays(-10), paidAmount: 65000,
  });

  const subs = await Subscription.create([
    { title: "Hosting - Cairo Retail", clientId: clients[0]._id, projectId: p1._id, type: "yearly", amount: 3000, renewalDate: addDays(12), status: "active", collected: false, service: "hosting" },
    { title: "Domain - Bloom", clientId: clients[1]._id, projectId: p2._id, type: "yearly", amount: 500, renewalDate: addDays(-3), status: "expired", collected: false, service: "domain" },
    { title: "Maintenance - Bloom", clientId: clients[1]._id, projectId: p2._id, type: "monthly", amount: 1500, renewalDate: addDays(5), status: "active", collected: true, service: "maintenance" },
  ]);

  await Expense.create([
    { title: "Server hosting", category: "hosting", amount: 1200, method: "card", date: addDays(-10), recurring: true },
    { title: "Facebook Ads", category: "advertising", amount: 5000, method: "card", date: addDays(-5) },
    { title: "Designer salary", category: "employees", amount: 15000, method: "cash", date: addDays(-2) },
  ]);

  await Transaction.create([
    { referenceNumber: "NB-TXN-000001", title: "Website advance", amount: 20000, type: "income", method: "instapay", source: "project", status: "completed", clientId: clients[0]._id, projectId: p1._id, createdBy: "Nosait Admin", date: addDays(-25) },
    { referenceNumber: "NB-TXN-000002", title: "Store full payment", amount: 65000, type: "income", method: "bank", source: "project", status: "completed", clientId: clients[1]._id, projectId: p2._id, createdBy: "Nosait Admin", date: addDays(-15) },
    { referenceNumber: "NB-TXN-000003", title: "Maintenance fee", amount: 1500, type: "income", method: "vodafone_cash", source: "subscription", status: "completed", clientId: clients[1]._id, subscriptionId: subs[2]._id, createdBy: "Nosait Admin", date: addDays(-1) },
  ]);

  // Advance sequence counters so app-generated numbers never collide with seeded ones.
  const year = new Date().getFullYear();
  await Counter.create([
    { _id: "txn", seq: 3 },
    { _id: `contract-${year}`, seq: 1 },
  ]);

  await Contract.create({
    contractNumber: "NB-2026-0001", publicId: slugId(), title: "Corporate Website Agreement",
    template: "website", clientId: clients[0]._id, projectId: p1._id, value: 40000, advance: 20000,
    terms: "Scope: 6-page corporate website with CMS. Delivery in 6 weeks. Two revision rounds included.",
    status: "waiting_signature", timeline: [{ event: "created", at: new Date() }, { event: "sent", at: new Date() }],
  });

  console.log("Seed complete ✔");
  console.log("Login: admin@nosait.com / admin123");
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
