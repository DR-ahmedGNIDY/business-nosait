import { config } from "dotenv";
config({ path: ".env.local" });
import mongoose from "mongoose";
import { connectDB } from "../src/lib/db";
import { Client } from "../src/models/Client";
import { Project } from "../src/models/Project";
import { Transaction } from "../src/models/Transaction";
import { createTransaction, softDeleteTransaction } from "../src/lib/ledger";
import { getDashboardData } from "../src/lib/analytics";

const MARK = "__VLEDGER__" + Date.now();
let fails = 0;
function assert(name: string, got: any, want: any) {
  const ok = got === want;
  if (!ok) fails++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}: got ${got}, want ${want}`);
}

async function main() {
  await connectDB();
  let clientId: any, projectId: any;
  try {
    const base = await getDashboardData();
    const client = await Client.create({ name: MARK, status: "active" });
    clientId = client._id;
    const project = await Project.create({ title: MARK, clientId, price: 20000, category: "website", status: "in_progress" });
    projectId = project._id;

    const t1 = await createTransaction({ title: MARK + " 1", amount: 5000, source: "project", clientId, projectId, createdBy: "tester" });
    const t2 = await createTransaction({ title: MARK + " 2", amount: 3000, source: "project", clientId, projectId, createdBy: "tester" });

    assert("t1 has reference", /^NB-TXN-\d{6}$/.test(t1.referenceNumber || ""), true);
    assert("t2 has reference", /^NB-TXN-\d{6}$/.test(t2.referenceNumber || ""), true);
    assert("references differ", t1.referenceNumber !== t2.referenceNumber, true);

    let fresh = await Project.findById(projectId).lean<any>();
    assert("collected after 2 payments", fresh.paidAmount, 8000);
    assert("remaining after 2 payments", fresh.remainingAmount, 12000);

    let after = await getDashboardData();
    assert("dashboard collected delta", after.kpis.projectsCollected - base.kpis.projectsCollected, 8000);
    assert("dashboard outstanding delta", after.kpis.projectsOutstanding - base.kpis.projectsOutstanding, 12000);

    // Soft-delete the 3000 payment → collected re-syncs to 5000.
    await softDeleteTransaction(String(t2._id));
    fresh = await Project.findById(projectId).lean<any>();
    assert("collected after soft-delete", fresh.paidAmount, 5000);
    assert("remaining after soft-delete", fresh.remainingAmount, 15000);

    const stillThere = await Transaction.findById(t2._id).lean<any>();
    assert("soft-deleted row still exists", !!stillThere, true);
    assert("soft-deleted row has deletedAt", !!stillThere.deletedAt, true);

    after = await getDashboardData();
    assert("dashboard collected delta after delete", after.kpis.projectsCollected - base.kpis.projectsCollected, 5000);
  } finally {
    await Transaction.deleteMany({ title: new RegExp("^" + MARK) });
    if (projectId) await Project.deleteMany({ _id: projectId });
    if (clientId) await Client.deleteMany({ _id: clientId });
    await mongoose.disconnect();
    console.log(fails === 0 ? "ALL PASS ✅" : `${fails} FAILED ❌`);
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
