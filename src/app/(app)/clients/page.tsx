import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { connectDB } from "@/lib/db";
import { Client } from "@/models/Client";
import { PageHeader, EmptyState, Avatar } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { Table, THead, TR, TH, TD } from "@/components/ui/table";
import { ListToolbar } from "@/components/list-toolbar";
import { getT } from "@/lib/i18n-server";
import { CLIENT_STATUS, label } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function ClientsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  const { t, locale } = await getT();
  await connectDB();

  const filter: any = {};
  if (sp.q) {
    const rx = new RegExp(sp.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ name: rx }, { company: rx }, { email: rx }, { phone: rx }];
  }
  if (sp.status) filter.status = sp.status;

  const page = Math.max(1, parseInt(sp.page || "1"));
  const perPage = 10;
  const [clients, total] = await Promise.all([
    Client.find(filter).sort({ createdAt: -1 }).skip((page - 1) * perPage).limit(perPage).lean(),
    Client.countDocuments(filter),
  ]);
  const pages = Math.ceil(total / perPage);

  return (
    <div className="animate-fade-in">
      <PageHeader title={t("clients.title")} subtitle={t("clients.count", { count: total })}>
        <Link href="/clients/new">
          <Button><Plus className="h-4 w-4" /> {t("clients.new")}</Button>
        </Link>
      </PageHeader>

      <ListToolbar
        placeholder={t("clients.searchPlaceholder")}
        filters={[{ name: "status", label: t("common.allStatuses"), options: CLIENT_STATUS.map((s) => ({ value: s, label: label(s, locale) })) }]}
      />

      {clients.length === 0 ? (
        <EmptyState
          icon={<Users className="h-5 w-5" />}
          title={t("clients.empty")}
          description={t("clients.emptyDesc")}
          action={<Link href="/clients/new"><Button><Plus className="h-4 w-4" /> {t("clients.new")}</Button></Link>}
        />
      ) : (
        <>
          <Table>
            <THead>
              <TR>
                <TH>{t("common.client")}</TH>
                <TH>{t("clients.company")}</TH>
                <TH>{t("clients.phone")}</TH>
                <TH>{t("common.status")}</TH>
              </TR>
            </THead>
            <tbody>
              {clients.map((c: any) => (
                <TR key={c._id}>
                  <TD>
                    <Link href={`/clients/${c._id}`} className="flex items-center gap-3 font-medium hover:text-primary">
                      <Avatar name={c.name} />
                      <div>
                        <p>{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.email || "—"}</p>
                      </div>
                    </Link>
                  </TD>
                  <TD className="text-muted-foreground">{c.company || "—"}</TD>
                  <TD className="text-muted-foreground">{c.phone || "—"}</TD>
                  <TD><StatusBadge status={c.status} /></TD>
                </TR>
              ))}
            </tbody>
          </Table>

          {pages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-1">
              {Array.from({ length: pages }).map((_, i) => {
                const p = i + 1;
                const params = new URLSearchParams(sp as Record<string, string>);
                params.set("page", String(p));
                return (
                  <Link key={p} href={`/clients?${params}`}>
                    <Button variant={p === page ? "default" : "outline"} size="sm">{p}</Button>
                  </Link>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
