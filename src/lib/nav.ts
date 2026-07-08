import {
  LayoutDashboard,
  Users,
  FolderKanban,
  RefreshCw,
  Receipt,
  ArrowDownToLine,
  FileSignature,
  BarChart3,
  Bell,
  Activity,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  key: string;
  href: string;
  icon: LucideIcon;
  group: string;
}

export const NAV: NavItem[] = [
  { key: "dashboard", href: "/dashboard", icon: LayoutDashboard, group: "Overview" },
  { key: "clients", href: "/clients", icon: Users, group: "Manage" },
  { key: "projects", href: "/projects", icon: FolderKanban, group: "Manage" },
  { key: "subscriptions", href: "/subscriptions", icon: RefreshCw, group: "Manage" },
  { key: "contracts", href: "/contracts", icon: FileSignature, group: "Manage" },
  { key: "expenses", href: "/expenses", icon: Receipt, group: "Finance" },
  { key: "transactions", href: "/transactions", icon: ArrowDownToLine, group: "Finance" },
  { key: "reports", href: "/reports", icon: BarChart3, group: "Finance" },
  { key: "notifications", href: "/notifications", icon: Bell, group: "System" },
  { key: "activity", href: "/activity", icon: Activity, group: "System" },
  { key: "settings", href: "/settings", icon: Settings, group: "System" },
];

export const NAV_GROUPS = ["Overview", "Manage", "Finance", "System"];
