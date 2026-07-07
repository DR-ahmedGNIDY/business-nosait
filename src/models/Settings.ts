import { Schema, models, model } from "mongoose";

export interface ISettings {
  _id: string;
  businessName: string;
  logo?: string;
  whatsapp?: string;
  email?: string;
  phone?: string;
  address?: string;
  currency: string;
  language: "en" | "ar";
  theme: "light" | "dark" | "system";
  primaryColor: string;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
  {
    businessName: { type: String, default: "Nosait Business" },
    logo: String,
    whatsapp: String,
    email: String,
    phone: String,
    address: String,
    currency: { type: String, default: "EGP" },
    language: { type: String, enum: ["en", "ar"], default: "en" },
    theme: { type: String, enum: ["light", "dark", "system"], default: "light" },
    primaryColor: { type: String, default: "#1877F2" },
  },
  { timestamps: true }
);

export const Settings = models.Settings || model<ISettings>("Settings", SettingsSchema);
