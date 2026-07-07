import mongoose, { Schema, models, model } from "mongoose";
import { CONTRACT_STATUS, CONTRACT_TEMPLATE } from "@/lib/constants";

export interface ISignature {
  dataUrl?: string; // base64 PNG of drawn/uploaded signature
  signedAt?: Date;
  name?: string;
}

export interface ITimelineEvent {
  event: "created" | "sent" | "viewed" | "signed" | "completed";
  at: Date;
  meta?: string;
}

export interface IContract {
  _id: string;
  contractNumber: string;
  publicId: string;
  title: string;
  template: (typeof CONTRACT_TEMPLATE)[number];
  clientId: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  value: number;
  advance: number;
  remaining: number;
  terms: string;
  status: (typeof CONTRACT_STATUS)[number];
  clientSignature?: ISignature;
  companySignature?: ISignature;
  timeline: ITimelineEvent[];
  signMeta?: { ip?: string; browser?: string; date?: Date };
  createdAt: Date;
  updatedAt: Date;
}

const SignatureSchema = new Schema<ISignature>(
  { dataUrl: String, signedAt: Date, name: String },
  { _id: false }
);

const ContractSchema = new Schema<IContract>(
  {
    contractNumber: { type: String, required: true, unique: true },
    publicId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    template: { type: String, enum: CONTRACT_TEMPLATE, default: "website" },
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project" },
    value: { type: Number, default: 0 },
    advance: { type: Number, default: 0 },
    remaining: { type: Number, default: 0 },
    terms: { type: String, default: "" },
    status: { type: String, enum: CONTRACT_STATUS, default: "draft" },
    clientSignature: SignatureSchema,
    companySignature: SignatureSchema,
    timeline: [
      new Schema<ITimelineEvent>(
        { event: String, at: { type: Date, default: Date.now }, meta: String },
        { _id: false }
      ),
    ],
    signMeta: { ip: String, browser: String, date: Date },
  },
  { timestamps: true }
);

ContractSchema.pre("save", function (next) {
  const doc = this as unknown as IContract;
  doc.remaining = Math.max(0, (doc.value || 0) - (doc.advance || 0));
  next();
});

export const Contract = models.Contract || model<IContract>("Contract", ContractSchema);
