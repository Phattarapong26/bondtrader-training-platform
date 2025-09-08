import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config();
export const connectDatabase = async () => {
  const MONGODB_URI =
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/Uknowmedatabase";
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};
