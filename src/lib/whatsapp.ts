import { formatCurrency, formatDate } from "./utils";

/** Build a wa.me link, stripping non-digits from the phone number. */
export function waLink(phone?: string, message?: string) {
  const num = (phone || "").replace(/\D/g, "");
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${num}${text}`;
}

interface Ctx {
  clientName?: string;
  business?: string;
  amount?: number;
  service?: string;
  date?: Date | string;
  contractUrl?: string;
}

export const WA_TEMPLATES = {
  renewalReminder: (c: Ctx) =>
    `مرحباً ${c.clientName || ""}،\nنود تذكيركم بأن اشتراك ${c.service || "الخدمة"} سيتم تجديده بتاريخ ${formatDate(c.date)} بقيمة ${formatCurrency(c.amount || 0)}.\nيرجى التواصل لإتمام التجديد.\nمع تحيات ${c.business || "Nosait Business"}`,
  paymentReminder: (c: Ctx) =>
    `مرحباً ${c.clientName || ""}،\nنذكّركم بوجود مبلغ مستحق قدره ${formatCurrency(c.amount || 0)}.\nنرجو سداد المبلغ في أقرب وقت. شكراً لتعاونكم.\n${c.business || "Nosait Business"}`,
  contractReminder: (c: Ctx) =>
    `مرحباً ${c.clientName || ""}،\nفي انتظار توقيعكم على العقد. يمكنكم الاطلاع والتوقيع من الرابط:\n${c.contractUrl || ""}\nشكراً، ${c.business || "Nosait Business"}`,
  hostingRenewal: (c: Ctx) =>
    `مرحباً ${c.clientName || ""}،\nموعد تجديد الاستضافة بتاريخ ${formatDate(c.date)} بقيمة ${formatCurrency(c.amount || 0)}.\n${c.business || "Nosait Business"}`,
  maintenanceRenewal: (c: Ctx) =>
    `مرحباً ${c.clientName || ""}،\nموعد تجديد باقة الصيانة بتاريخ ${formatDate(c.date)} بقيمة ${formatCurrency(c.amount || 0)}.\n${c.business || "Nosait Business"}`,
};

export type WaTemplateKey = keyof typeof WA_TEMPLATES;
