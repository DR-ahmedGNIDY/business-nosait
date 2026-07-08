import mongoose, { Schema, models, model } from "mongoose";
import { PAYMENT_METHOD, TRANSACTION_STATUS } from "@/lib/constants";

export interface ITransaction {
  _id: string;
  title: string;
  amount: number;
  method: (typeof PAYMENT_METHOD)[number];
  status: (typeof TRANSACTION_STATUS)[number];
  source: "project" | "subscription" | "other";
  clientId?: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  subscriptionId?: mongoose.Types.ObjectId;
  date: Date;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, default: 0 },
    method: { type: String, enum: PAYMENT_METHOD, default: "cash" },
    status: { type: String, enum: TRANSACTION_STATUS, default: "completed" },
    source: { type: String, enum: ["project", "subscription", "other"], default: "other" },
    clientId: { type: Schema.Types.ObjectId, ref: "Client" },
    projectId: { type: Schema.Types.ObjectId, ref: "Project" },
    subscriptionId: { type: Schema.Types.ObjectId, ref: "Subscription" },
    date: { type: Date, default: Date.now },
    note: String,
  },
  { timestamps: true }
);

TransactionSchema.index({ date: -1, method: 1, source: 1 });
TransactionSchema.index({ status: 1, source: 1 });
TransactionSchema.index({ clientId: 1 });
TransactionSchema.index({ projectId: 1, status: 1 });
TransactionSchema.index({ subscriptionId: 1, status: 1 });

export const Transaction = models.Transaction || model<ITransaction>("Transaction", TransactionSchema);
