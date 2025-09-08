import { app } from "./app";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { createTokenCollection } from "./models/token.model";
import { MongoClient } from "mongodb";
import { cleanupExpiredTokens } from "./services/token.service";

dotenv.config();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/Uknowmedatabase";

// MongoDB connection
mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log("Connected to MongoDB");
    
    // สร้าง collection tokens ถ้ายังไม่มี
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db();
    await createTokenCollection(db);
    await client.close();
    
    // ตั้งเวลาลบ token ที่หมดอายุทุก 1 ชั่วโมง
    setInterval(async () => {
      try {
        const result = await cleanupExpiredTokens();
        console.log(`Cleaned up expired tokens: ${result.modifiedCount} records updated`);
      } catch (error) {
        console.error("Error cleaning up expired tokens:", error);
      }
    }, 60 * 60 * 1000); // 1 ชั่วโมง
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
