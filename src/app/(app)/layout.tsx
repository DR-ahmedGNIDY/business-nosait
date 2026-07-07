import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/shell/sidebar";
import { Header } from "@/components/shell/header";
import { AppShell } from "@/components/shell/app-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <AppShell>
      <Sidebar />
      <div className="flex min-h-screen flex-col ltr:lg:pl-64 rtl:lg:pr-64">
        <Header />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </AppShell>
  );
}
