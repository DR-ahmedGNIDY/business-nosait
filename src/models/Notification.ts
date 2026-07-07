import mongoose, { Schema, models, model } from "mongoose";
import { NOTIFICATION_TYPE } from "@/lib/constants";

export interface INotification {
  _id: string;
  type: (typeof NOTIFICATION_TYPE)[number];
  title: string;
  message: string;
  link?: string;
  read: boolean;
  entityId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    type: { type: String, enum: NOTIFICATION_TYPE, default: "system" },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: String,
    read: { type: Boolean, default: false },
    entityId: Schema.Types.ObjectId,
  },
  { timestamps: true }
);

NotificationSchema.index({ read: 1, createdAt: -1 });

export const Notification = models.Notification || model<INotification>("Notification", NotificationSchema);
