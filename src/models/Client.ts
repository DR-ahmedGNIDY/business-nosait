import mongoose, { Schema, models, model } from "mongoose";
import { CLIENT_STATUS } from "@/lib/constants";

export interface IClient {
  _id: string;
  name: string;
  company?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  notes?: string;
  status: (typeof CLIENT_STATUS)[number];
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema = new Schema<IClient>(
  {
    name: { type: String, required: true, trim: true },
    company: { type: String, trim: true },
    phone: { type: String, trim: true },
    whatsapp: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    address: String,
    notes: String,
    status: { type: String, enum: CLIENT_STATUS, default: "active" },
  },
  { timestamps: true }
);

ClientSchema.index({ name: "text", company: "text", email: "text", phone: "text" });

export const Client = models.Client || model<IClient>("Client", ClientSchema);
