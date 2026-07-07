import mongoose, { Schema, models, model } from "mongoose";

export interface IActivityLog {
  _id: string;
  action: string;
  entity: string;
  entityId?: mongoose.Types.ObjectId;
  description: string;
  userName?: string;
  createdAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    action: { type: String, required: true },
    entity: { type: String, required: true },
    entityId: Schema.Types.ObjectId,
    description: { type: String, required: true },
    userName: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

ActivityLogSchema.index({ createdAt: -1 });

export const ActivityLog = models.ActivityLog || model<IActivityLog>("ActivityLog", ActivityLogSchema);
