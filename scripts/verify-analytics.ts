/**
 * Non-destructive integration test for the transaction architecture.
 * Adds temporary marked docs, exercises the real sync + dashboard aggregation,
 * asserts the required scenario, then removes everything it created.
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import mongoose from "mongoose";
import { connectDB } from "../src/lib/db";
import { Client } from "../src/models/Client";
import { Project } from "../src/models/Project";
import { Transaction } from "../src/models/Transaction";
import { syncProjectPayments } from "../src/lib/sync";
import { getDashboardData } from "../src/lib/analytics";
import { getReportData } from "../src/lib/reports";

const MARK = "__VERIFY__" + Date.now();

function assert(name: string, got: number, want: number) {
  const ok = got === want;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}: got ${got}, want ${want}`);
  if (!ok) process.exitCode = 1;
}

async function main() {
  await connectDB();
  let clientId: any, projectId: any;
  try {
    const base = await getDashboardData();

    const client = await Client.create({ name: MARK, status: "active" });
    clientId = client._id;
    const project = await Project.create({ title: MARK, clientId, price: 20000, cost: 0, category: "website", status: "in_progress" });
    projectId = project._id;

    // Two completed payments + one non-completed that must be ignored.
    await Transaction.create([
      { title: MARK + " 1", amount: 5000, method: "cash", source: "project", status: "completed", clientId, projectId, date: new Date() },
      { title: MARK + " 2", amount: 3000, method: "cash", source: "project", status: "completed", clientId, projectId, date: new Date() },
      { title: MARK + " pending", amount: 9999, method: "cash", source: "project", status: "pending", clientId, projectId, date: new Date() },
    ]);

    await syncProjectPayments(projectId);

    // --- Project projection (cards on project detail) ---
    const fresh = await Project.findById(projectId).lean<any>();
    assert("project.paidAmount", fresh.paidAmount, 8000);
    assert("project.remainingAmount", fresh.remainingAmount, 12000);

    // --- Dashboard deltas ---
    const after = await getDashboardData();
    assert("dashboard projectsCollected delta", after.kpis.projectsCollected - base.kpis.projectsCollected, 8000);
    assert("dashboard projectsBilled delta", after.kpis.projectsBilled - base.kpis.projectsBilled, 20000);
    assert("dashboard projectsOutstanding delta", after.kpis.projectsOutstanding - base.kpis.projectsOutstanding, 12000);

    // --- Reports attribution (uses projectId) ---
    const rep = await getReportData();
    const outRow = rep.outstanding.find((o: any) => o.title === MARK);
    assert("reports outstanding row", outRow ? outRow.remaining : -1, 12000);
    const clientRow = rep.topClients.find((c: any) => c.name === MARK);
    assert("reports client collected", clientRow ? clientRow.collected : -1, 8000);
  } finally {
    // Cleanup — leave the DB exactly as we found it.
    await Transaction.deleteMany({ title: new RegExp("^" + MARK) });
    if (projectId) await Project.deleteMany({ _id: projectId });
    if (clientId) await Client.deleteMany({ _id: clientId });
    await mongoose.disconnect();
    console.log("Cleanup complete.");
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
