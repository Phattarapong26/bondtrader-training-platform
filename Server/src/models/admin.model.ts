import mongoose, { Document, Schema } from 'mongoose';

export interface IAdmin extends Document {
  name: string;
  idCard: string;
  employeeId: string;
  phone: string;
  email: string;
  roles: string[];
  password: string;
}

const adminSchema = new Schema<IAdmin>({
  name: { type: String, required: true },
  idCard: { type: String, required: true },
  employeeId: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  roles: [{ type: String, required: true }],
  password: { type: String, required: true },
});

export const Admin = mongoose.model<IAdmin>('Admin', adminSchema);