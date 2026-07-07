import mongoose, { Schema, models, model } from "mongoose";
import { USER_ROLES } from "@/lib/constants";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: (typeof USER_ROLES)[number];
  avatar?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: USER_ROLES, default: "admin" },
    avatar: String,
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const User = models.User || model<IUser>("User", UserSchema);
export type UserModel = mongoose.Model<IUser>;
