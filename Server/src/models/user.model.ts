import mongoose, { Document, Schema } from "mongoose";
import { ObjectId } from "mongodb";

export interface IUser extends Document {
  name: string;
  company: string;
  citizen_id: string;
  email: string;
  phone: string;
  profilePicture: string;
  bond_status: {
    start_date: Date;
    end_date: Date;
    status: string;
  };
  courses_enrolled: Array<{
    course_id: ObjectId; // Ensure this is typed as ObjectId
    status: string;
    progress: number;
    start_date: Date;
    completion_date: Date | null;
  }>;
  password: string;
  created_at: Date;
  updated_at: Date;
  role: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  otp?: string | null;
  otpExpiration?: number | null;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  company: { type: String, required: true },
  citizen_id: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  profilePicture: { type: String, default: "" },
  bond_status: {
    start_date: { type: Date },
    end_date: { type: Date },
    status: { type: String },
  },
  courses_enrolled: [
    {
      course_id: { type: Schema.Types.ObjectId, ref: "Course" },
      status: { type: String, required: true },
      progress: { type: Number, default: 0 },
      start_date: { type: Date, required: true },
      completion_date: { type: Date, default: null },
    },
  ],
  password: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  role: { type: String, default: "user" },
  otp: { type: String, default: null },
  otpExpiration: { type: Number, default: null },
});

export const User = mongoose.model<IUser>("User", userSchema);
