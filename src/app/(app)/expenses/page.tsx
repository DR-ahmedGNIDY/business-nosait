import { Receipt, TrendingDown, CalendarDays } from "lucide-react";
import { connectDB } from "@/lib/db";
import { Expense } from "@/models/Expense";
import { PageHeader, EmptyState } from "@/components/ui/misc";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Table, THead, TR, TH, TD } from "@/components/ui/table";
import { ListToolbar } from "@/components/list-toolbar";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { CategoryPie } from "@/components/dashboard/charts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { RowDelete } from "@/components/row-delete";
import { createExpense, deleteExpense } from "./actions";
import { EXPENSE_CATEGORY } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ExpensesPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  await connectDB();
  const filter: any = {};
  if (sp.q) filter.title = new RegExp(sp.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  if (sp.category) filter.category = sp.category;

  const expenses = await Expense.find(filter).sort({ date: -1 }).lean();
  const all = await Expense.find().lean();

  const now = new Date();
  const monthTotal = all.filter((e: any) => new Date(e.date).getMonth() === now.getMonth() && new Date(e.date).getFullYear() === now.getFullYear()).reduce((s, e: any) => s + e.amount, 0);
  const yearTotal = all.filter((e: any) => new Date(e.date).getFullYear() === now.getFullYear()).reduce((s, e: any) => s + e.amount, 0);
  const total = all.reduce((s, e: any) => s + e.amount, 0);

  const byCategory = Object.entries(all.reduce((acc: Record<string, number>, e: any) => { acc[e.category] = (acc[e.category] || 0) + e.amount; return acc; }, {})).map(([name, value]) => ({ name, value }));

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="Expenses" subtitle="Operating costs, tracked separately from revenue." />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="This Month" value={monthTotal} icon={CalendarDays} tone="warning" currency />
        <StatCard title="This Year" value={yearTotal} icon={TrendingDown} tone="danger" currency />
        <StatCard title="All Time" value={total} icon={Receipt} tone="primary" currency />
      </div>

      <ExpenseForm action={createExpense} />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between"><CardTitle>All expenses</CardTitle></CardHeader>
          <CardContent>
            <ListToolbar placeholder="Search expenses…" filters={[{ name: "category", label: "All categories", options: EXPENSE_CATEGORY.map((c) => ({ value: c, label: c })) }]} />
            {expenses.length === 0 ? (
              <EmptyState icon={<Receipt className="h-5 w-5" />} title="No expenses" description="Add your first expense above." />
            ) : (
              <Table>
                <THead><TR><TH>Title</TH><TH>Category</TH><TH>Amount</TH><TH>Method</TH><TH>Date</TH><TH></TH></TR></THead>
                <tbody>
                  {expenses.map((e: any) => (
                    <TR key={e._id}>
                      <TD className="font-medium">{e.title}{e.recurring && <Badge tone="accent" className="ms-2">recurring</Badge>}</TD>
                      <TD><Badge>{e.category}</Badge></TD>
                      <TD className="text-danger">{formatCurrency(e.amount)}</TD>
                      <TD className="text-muted-foreground">{e.method}</TD>
                      <TD>{formatDate(e.date)}</TD>
                      <TD className="text-end"><RowDelete action={deleteExpense.bind(null, String(e._id))} /></TD>
                    </TR>
                  ))}
                </tbody>
              </Table>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>By category</CardTitle></CardHeader>
          <CardContent><CategoryPie data={byCategory} /></CardContent>
        </Card>
      </div>
    </div>
  );
}
