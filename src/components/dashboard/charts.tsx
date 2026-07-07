"use client";

import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

const PIE_COLORS = ["#1877F2", "#2563EB", "#3B82F6", "#22C55E", "#F59E0B", "#EF4444", "#8B5CF6", "#64748B", "#0EA5E9", "#14B8A6"];

const tooltipStyle = {
  contentStyle: {
    borderRadius: 12,
    border: "1px solid hsl(var(--border))",
    background: "hsl(var(--popover))",
    fontSize: 12,
    boxShadow: "0 8px 30px -6px rgb(15 23 42 / 0.14)",
  },
  labelStyle: { fontWeight: 600 },
  formatter: (v: number) => formatCurrency(v),
};

type MonthPoint = { month: string; projects: number; subscriptions: number; expenses: number; profit: number };

export function RevenueChart({ data }: { data: MonthPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ left: -10, right: 8, top: 8 }}>
        <defs>
          <linearGradient id="gProj" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1877F2" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#1877F2" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gSub" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22C55E" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={60} tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)} />
        <Tooltip {...tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Area type="monotone" dataKey="projects" name="Projects" stroke="#1877F2" strokeWidth={2} fill="url(#gProj)" />
        <Area type="monotone" dataKey="subscriptions" name="Subscriptions" stroke="#22C55E" strokeWidth={2} fill="url(#gSub)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function ProfitBarChart({ data }: { data: MonthPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ left: -10, right: 8, top: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={60} tickFormatter={(v) => (Math.abs(v) >= 1000 ? `${v / 1000}k` : v)} />
        <Tooltip {...tooltipStyle} />
        <Bar dataKey="expenses" name="Expenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
        <Bar dataKey="profit" name="Net Profit" fill="#1877F2" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CategoryPie({ data }: { data: { name: string; value: number }[] }) {
  if (!data.length) return <p className="py-16 text-center text-sm text-muted-foreground">No expense data</p>;
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2}>
          {data.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip {...tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
