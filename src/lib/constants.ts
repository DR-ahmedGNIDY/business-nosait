export const USER_ROLES = ["admin", "manager", "accountant", "viewer"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const CLIENT_STATUS = ["active", "inactive", "lead"] as const;
export const PROJECT_STATUS = ["pending", "in_progress", "review", "completed", "cancelled"] as const;
export const PROJECT_CATEGORY = ["website", "store", "application", "marketing", "hosting", "maintenance", "other"] as const;
export const SUBSCRIPTION_TYPE = ["monthly", "yearly", "custom"] as const;
export const SUBSCRIPTION_STATUS = ["active", "pending", "expired", "cancelled"] as const;
export const EXPENSE_CATEGORY = [
  "hosting", "domains", "advertising", "employees", "software", "internet", "office", "marketing", "tools", "other",
] as const;
export const PAYMENT_METHOD = ["cash", "instapay", "bank", "vodafone_cash", "card"] as const;
export const CONTRACT_STATUS = ["draft", "waiting_signature", "signed", "cancelled"] as const;
export const CONTRACT_TEMPLATE = ["website", "store", "application", "hosting", "maintenance", "marketing"] as const;
export const REMINDER_DAYS = [30, 15, 7, 3, 1] as const;

export const NOTIFICATION_TYPE = ["renewal", "payment", "subscription", "contract", "task", "system"] as const;

export const CURRENCIES = ["EGP", "USD", "EUR", "SAR", "AED"] as const;

export const LABELS: Record<string, { en: string; ar: string; tone?: string }> = {
  active: { en: "Active", ar: "نشط", tone: "success" },
  inactive: { en: "Inactive", ar: "غير نشط", tone: "muted" },
  lead: { en: "Lead", ar: "عميل محتمل", tone: "accent" },
  pending: { en: "Pending", ar: "قيد الانتظار", tone: "warning" },
  in_progress: { en: "In Progress", ar: "قيد التنفيذ", tone: "accent" },
  review: { en: "Review", ar: "مراجعة", tone: "warning" },
  completed: { en: "Completed", ar: "مكتمل", tone: "success" },
  cancelled: { en: "Cancelled", ar: "ملغي", tone: "danger" },
  expired: { en: "Expired", ar: "منتهي", tone: "danger" },
  draft: { en: "Draft", ar: "مسودة", tone: "muted" },
  waiting_signature: { en: "Waiting Signature", ar: "بانتظار التوقيع", tone: "warning" },
  signed: { en: "Signed", ar: "موقّع", tone: "success" },
  monthly: { en: "Monthly", ar: "شهري" },
  yearly: { en: "Yearly", ar: "سنوي" },
  custom: { en: "Custom", ar: "مخصص" },
  cash: { en: "Cash", ar: "نقدي" },
  instapay: { en: "InstaPay", ar: "انستاباي" },
  bank: { en: "Bank", ar: "تحويل بنكي" },
  vodafone_cash: { en: "Vodafone Cash", ar: "فودافون كاش" },
  card: { en: "Card", ar: "بطاقة" },
  // Project categories
  website: { en: "Website", ar: "موقع إلكتروني" },
  store: { en: "Store", ar: "متجر" },
  application: { en: "Application", ar: "تطبيق" },
  hosting: { en: "Hosting", ar: "استضافة" },
  maintenance: { en: "Maintenance", ar: "صيانة" },
  marketing: { en: "Marketing", ar: "تسويق" },
  other: { en: "Other", ar: "أخرى" },
  // Expense categories
  domains: { en: "Domains", ar: "نطاقات" },
  advertising: { en: "Advertising", ar: "إعلانات" },
  employees: { en: "Employees", ar: "موظفون" },
  software: { en: "Software", ar: "برمجيات" },
  internet: { en: "Internet", ar: "إنترنت" },
  office: { en: "Office", ar: "مكتب" },
  tools: { en: "Tools", ar: "أدوات" },
  // Transaction sources
  project: { en: "Project", ar: "مشروع" },
  subscription: { en: "Subscription", ar: "اشتراك" },
};

export function label(key: string, lang: "en" | "ar" = "en") {
  return LABELS[key]?.[lang] || key;
}
