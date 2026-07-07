import mongoose, { Schema, models, model } from "mongoose";
import { SUBSCRIPTION_TYPE, SUBSCRIPTION_STATUS, REMINDER_DAYS } from "@/lib/constants";

export interface ISubscription {
  _id: string;
  title: string;
  clientId: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  type: (typeof SUBSCRIPTION_TYPE)[number];
  amount: number;
  renewalDate: Date;
  status: (typeof SUBSCRIPTION_STATUS)[number];
  collected: boolean;
  reminderDays: number[];
  service?: string; // hosting, domain, maintenance...
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    title: { type: String, required: true, trim: true },
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project" },
    type: { type: String, enum: SUBSCRIPTION_TYPE, default: "yearly" },
    amount: { type: Number, required: true, default: 0 },
    renewalDate: { type: Date, required: true },
    status: { type: String, enum: SUBSCRIPTION_STATUS, default: "active" },
    collected: { type: Boolean, default: false },
    reminderDays: { type: [Number], default: [...REMINDER_DAYS] },
    service: String,
  },
  { timestamps: true }
);

SubscriptionSchema.index({ renewalDate: 1, status: 1 });

export const Subscription = models.Subscription || model<ISubscription>("Subscription", SubscriptionSchema);
