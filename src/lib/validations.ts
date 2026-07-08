import { z } from "zod";
import {
  CLIENT_STATUS, PROJECT_STATUS, PROJECT_CATEGORY, SUBSCRIPTION_TYPE, SUBSCRIPTION_STATUS,
  EXPENSE_CATEGORY, PAYMENT_METHOD, CONTRACT_STATUS, CONTRACT_TEMPLATE,
  TRANSACTION_STATUS, TRANSACTION_SOURCE,
} from "./constants";

export const clientSchema = z.object({
  name: z.string().min(2, "Name is required"),
  company: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email().or(z.literal("")).optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(CLIENT_STATUS).default("active"),
});

export const projectSchema = z.object({
  title: z.string().min(2, "Title is required"),
  clientId: z.string().min(1, "Client is required"),
  price: z.coerce.number().min(0),
  cost: z.coerce.number().min(0).default(0),
  status: z.enum(PROJECT_STATUS).default("pending"),
  category: z.enum(PROJECT_CATEGORY).default("website"),
  startDate: z.string().optional(),
  deliveryDate: z.string().optional(),
  description: z.string().optional(),
});

export const paymentSchema = z.object({
  amount: z.coerce.number().positive(),
  method: z.enum(PAYMENT_METHOD).default("cash"),
  note: z.string().optional(),
});

export const subscriptionSchema = z.object({
  title: z.string().min(2),
  clientId: z.string().min(1),
  projectId: z.string().optional(),
  type: z.enum(SUBSCRIPTION_TYPE).default("yearly"),
  amount: z.coerce.number().min(0),
  renewalDate: z.string().min(1),
  status: z.enum(SUBSCRIPTION_STATUS).default("active"),
  collected: z.coerce.boolean().default(false),
  service: z.string().optional(),
});

export const expenseSchema = z.object({
  title: z.string().min(2),
  category: z.enum(EXPENSE_CATEGORY).default("other"),
  amount: z.coerce.number().min(0),
  method: z.enum(PAYMENT_METHOD).default("cash"),
  date: z.string().optional(),
  recurring: z.coerce.boolean().default(false),
  note: z.string().optional(),
});

export const transactionSchema = z.object({
  title: z.string().min(2),
  amount: z.coerce.number().min(0),
  method: z.enum(PAYMENT_METHOD).default("cash"),
  source: z.enum(TRANSACTION_SOURCE).default("other"),
  status: z.enum(TRANSACTION_STATUS).default("completed"),
  clientId: z.string().optional(),
  date: z.string().optional(),
  note: z.string().optional(),
});

export const contractSchema = z.object({
  title: z.string().min(2),
  template: z.enum(CONTRACT_TEMPLATE).default("website"),
  clientId: z.string().min(1),
  projectId: z.string().optional(),
  value: z.coerce.number().min(0),
  advance: z.coerce.number().min(0).default(0),
  terms: z.string().default(""),
  status: z.enum(CONTRACT_STATUS).default("draft"),
});
