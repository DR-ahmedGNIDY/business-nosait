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
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  labelAr: string;
  href: string;
  icon: LucideIcon;
  group: string;
}

export const NAV: NavItem[] = [
  { label: "Dashboard", labelAr: "لوحة التحكم", href: "/dashboard", icon: LayoutDashboard, group: "Overview" },
  { label: "Clients", labelAr: "العملاء", href: "/clients", icon: Users, group: "Manage" },
  { label: "Projects", labelAr: "المشاريع", href: "/projects", icon: FolderKanban, group: "Manage" },
  { label: "Subscriptions", labelAr: "الاشتراكات", href: "/subscriptions", icon: RefreshCw, group: "Manage" },
  { label: "Contracts", labelAr: "العقود", href: "/contracts", icon: FileSignature, group: "Manage" },
  { label: "Expenses", labelAr: "المصروفات", href: "/expenses", icon: Receipt, group: "Finance" },
  { label: "Transactions", labelAr: "المعاملات", href: "/transactions", icon: ArrowDownToLine, group: "Finance" },
  { label: "Reports", labelAr: "التقارير", href: "/reports", icon: BarChart3, group: "Finance" },
  { label: "Notifications", labelAr: "الإشعارات", href: "/notifications", icon: Bell, group: "System" },
  { label: "Settings", labelAr: "الإعدادات", href: "/settings", icon: Settings, group: "System" },
];

export const NAV_GROUPS = ["Overview", "Manage", "Finance", "System"];
