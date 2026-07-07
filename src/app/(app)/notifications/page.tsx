import Link from "next/link";
import { Bell, RefreshCw, Wallet, FileSignature, CircleAlert } from "lucide-react";
import { connectDB } from "@/lib/db";
import { Notification } from "@/models/Notification";
import { PageHeader, EmptyState } from "@/components/ui/misc";
import { Card, CardContent } from "@/components/ui/card";
import { NotificationActions } from "@/components/notifications/notification-actions";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const ICONS: Record<string, any> = { renewal: RefreshCw, payment: Wallet, subscription: RefreshCw, contract: FileSignature, task: CircleAlert, system: Bell };

export default async function NotificationsPage() {
  await connectDB();
  const items = await Notification.find().sort({ createdAt: -1 }).limit(100).lean();
  const unread = items.filter((n: any) => !n.read).length;

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="Notifications" subtitle={`${unread} unread of ${items.length}`}>
        <NotificationActions hasItems={items.length > 0} />
      </PageHeader>

      {items.length === 0 ? (
        <EmptyState icon={<Bell className="h-5 w-5" />} title="No notifications" description="Renewal, payment and contract alerts will appear here." />
      ) : (
        <Card>
          <CardContent className="divide-y divide-border p-0">
            {items.map((n: any) => {
              const Icon = ICONS[n.type] || Bell;
              const clean = n.message.replace(/\s*\[[^\]]+\]\s*$/, "");
              return (
                <Link key={n._id} href={n.link || "#"} className={`flex items-start gap-3 px-5 py-4 transition-colors hover:bg-muted ${!n.read ? "bg-primary/5" : ""}`}>
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${!n.read ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{n.title}</p>
                      {!n.read && <span className="h-2 w-2 rounded-full bg-primary" />}
                    </div>
                    <p className="text-sm text-muted-foreground">{clean}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{formatDate(n.createdAt)}</p>
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
