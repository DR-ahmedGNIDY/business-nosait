import { Schema, models, model } from "mongoose";
import { EXPENSE_CATEGORY, PAYMENT_METHOD } from "@/lib/constants";

export interface IExpense {
  _id: string;
  title: string;
  category: (typeof EXPENSE_CATEGORY)[number];
  amount: number;
  method: (typeof PAYMENT_METHOD)[number];
  date: Date;
  recurring: boolean;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, enum: EXPENSE_CATEGORY, default: "other" },
    amount: { type: Number, required: true, default: 0 },
    method: { type: String, enum: PAYMENT_METHOD, default: "cash" },
    date: { type: Date, default: Date.now },
    recurring: { type: Boolean, default: false },
    note: String,
  },
  { timestamps: true }
);

ExpenseSchema.index({ date: -1, category: 1 });

export const Expense = models.Expense || model<IExpense>("Expense", ExpenseSchema);
