import mongoose, { Document, Schema } from 'mongoose';

export interface ICourse extends Document {
  title: string;
  description: string;
  details: string;
  duration_hours: number;
  max_seats: number;
  start_date: string;
  thumbnail: string;
  video: string;
  qr_code: string;
  trainingLocation: string; 
}


const courseSchema = new Schema<ICourse>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  details: { type: String, required: true },
  duration_hours: { type: Number, required: true },
  max_seats: { type: Number, required: true },
  start_date: { type: String, required: true },
  thumbnail: { type: String, required: true },
  video: { type: String, required: true },
  qr_code: { type: String, required: true },
  trainingLocation: { type: String, required: true },
});

export const Course = mongoose.model<ICourse>('Course', courseSchema);