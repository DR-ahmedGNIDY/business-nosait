import mongoose, { Schema, models, model } from "mongoose";
import { PROJECT_STATUS, PROJECT_CATEGORY, PAYMENT_METHOD } from "@/lib/constants";

export interface IProjectPayment {
  amount: number;
  method: (typeof PAYMENT_METHOD)[number];
  date: Date;
  note?: string;
}

export interface IProject {
  _id: string;
  title: string;
  clientId: mongoose.Types.ObjectId;
  price: number;
  paidAmount: number;
  remainingAmount: number;
  status: (typeof PROJECT_STATUS)[number];
  category: (typeof PROJECT_CATEGORY)[number];
  startDate?: Date;
  deliveryDate?: Date;
  cost: number;
  description?: string;
  payments: IProjectPayment[];
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IProjectPayment>(
  {
    amount: { type: Number, required: true },
    method: { type: String, enum: PAYMENT_METHOD, default: "cash" },
    date: { type: Date, default: Date.now },
    note: String,
  },
  { _id: true }
);

const ProjectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true, trim: true },
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true },
    price: { type: Number, required: true, default: 0 },
    paidAmount: { type: Number, default: 0 },
    remainingAmount: { type: Number, default: 0 },
    status: { type: String, enum: PROJECT_STATUS, default: "pending" },
    category: { type: String, enum: PROJECT_CATEGORY, default: "website" },
    startDate: Date,
    deliveryDate: Date,
    cost: { type: Number, default: 0 },
    description: String,
    payments: [PaymentSchema],
  },
  { timestamps: true }
);

// Keep paid/remaining in sync with payments before save.
ProjectSchema.pre("save", function (next) {
  const doc = this as unknown as IProject;
  doc.paidAmount = (doc.payments || []).reduce((s, p) => s + (p.amount || 0), 0);
  doc.remainingAmount = Math.max(0, (doc.price || 0) - doc.paidAmount);
  next();
});

ProjectSchema.index({ clientId: 1, status: 1 });

export const Project = models.Project || model<IProject>("Project", ProjectSchema);
