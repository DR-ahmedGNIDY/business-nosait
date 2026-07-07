# Nosait Business

**Manage Clients • Projects • Contracts** — a production-ready business management platform for web agencies, software companies and freelancers.

Domain: `business.nosait.com`

## Tech stack
Next.js 15 (App Router) · TypeScript (strict) · TailwindCSS · MongoDB/Mongoose · NextAuth · React Query · React Hook Form · Zod · Zustand · Framer Motion · Recharts · Signature Pad (canvas) · Server Actions.

## Getting started

```bash
npm install
cp .env.example .env.local   # set MONGODB_URI + NEXTAUTH_SECRET
npm run seed                 # creates demo data + an admin account
npm run dev                  # http://localhost:3000
```

Requires a running MongoDB instance (local or Atlas) at `MONGODB_URI`.

## Modules
- **Auth & roles** — credentials login, admin/manager/accountant/viewer.
- **Dashboard** — KPIs + charts. Projects revenue, subscriptions revenue and expenses are tracked **separately**; Net Profit = collected projects + collected subscriptions − expenses.
- **Clients** — CRUD, profile with tabs (projects, subscriptions, contracts, payments, notes, activities), WhatsApp templates (`wa.me`).
- **Projects** — CRUD, payments, collected/remaining, profitability, timeline.
- **Subscriptions** — monthly/yearly/custom, renewal reminders (30/15/7/3/1), collect/renew, separated revenue.
- **Contracts** — 6 templates, generator, PDF (print), status workflow, e-signature (draw/upload), public signing page at `/sign/{publicId}` with IP/browser/timestamp audit, timeline.
- **Expenses** — 10 categories, month/year stats, charts.
- **Transactions** — incoming money across 5 methods, filters.
- **Reports** — revenue, top clients, outstanding, renewals, CSV/PDF export.
- **Notifications** — bell + unread count + full list.
- **Settings** — company data, currency, language, theme, brand color.

## Design
Facebook-Business-inspired premium SaaS UI. Primary `#1877F2`, dark `#0F172A`. Light/dark mode, full RTL + Arabic support.

## Reminder engine
`GET /api/cron/reminders` scans subscriptions/contracts and creates notifications. Wire to a scheduler (e.g. Vercel Cron) for daily runs.
