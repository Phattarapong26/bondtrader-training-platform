import { MongoClient } from "mongodb";
import { Token } from "../models/token.model";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/Uknowmedatabase";
const JWT_SECRET = process.env.JWT_SECRET || "uknowme";
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "your_refresh_secret";

// สร้าง token ใหม่
export const createNewTokens = async (
  userId: string,
  userRole: string,
  email?: string
) => {
  // กำหนดระยะเวลาหมดอายุ
  const accessTokenExpiry = "10h";
  const refreshTokenExpiry = "7d";

  // สร้าง tokens
  const tokenPayload = email
    ? { userId, email, role: userRole }
    : { userId, role: userRole };

  const token = jwt.sign(tokenPayload, JWT_SECRET, {
    expiresIn: accessTokenExpiry,
  });

  const refreshToken = jwt.sign({ userId, role: userRole }, REFRESH_TOKEN_SECRET, {
    expiresIn: refreshTokenExpiry,
  });

  // คำนวณเวลาหมดอายุจริง
  const accessTokenExpiryDate = new Date();
  accessTokenExpiryDate.setHours(accessTokenExpiryDate.getHours() + 10);

  const refreshTokenExpiryDate = new Date();
  refreshTokenExpiryDate.setDate(refreshTokenExpiryDate.getDate() + 7);

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const database = client.db();
  const tokensCollection = database.collection("tokens");

  // ยกเลิก tokens เก่าของผู้ใช้
  await tokensCollection.updateMany(
    { userId },
    { $set: { status: "revoked" } }
  );

  // เพิ่ม token ใหม่
  const tokenDocument: Token = {
    userId,
    token,
    refreshToken,
    userRole,
    status: "active",
    createdAt: new Date(),
    expiresAt: accessTokenExpiryDate,
    refreshExpiresAt: refreshTokenExpiryDate,
    lastUsed: new Date(),
  };

  await tokensCollection.insertOne(tokenDocument);
  await client.close();

  return {
    token,
    refreshToken,
    expiresAt: accessTokenExpiryDate,
    refreshExpiresAt: refreshTokenExpiryDate,
  };
};

// ตรวจสอบ token
export const validateTokenInDb = async (token: string) => {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const database = client.db();
  const tokensCollection = database.collection("tokens");

  try {
    // ตรวจสอบลายเซ็น token
    const decoded = jwt.verify(token, JWT_SECRET);

    // ตรวจสอบในฐานข้อมูล
    const tokenRecord = await tokensCollection.findOne({
      token,
      status: "active",
      expiresAt: { $gt: new Date() },
    });

    if (!tokenRecord) {
      return { valid: false, message: "Token has been revoked or expired" };
    }

    // อัปเดตเวลาใช้งานล่าสุด
    await tokensCollection.updateOne(
      { token },
      { $set: { lastUsed: new Date() } }
    );

    return { valid: true, user: decoded };
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      return { valid: false, message: "Token has expired" };
    } else if (error.name === "JsonWebTokenError") {
      return { valid: false, message: "Invalid token signature" };
    }
    return { valid: false, message: "Invalid token" };
  } finally {
    await client.close();
  }
};

// ลบ token ที่หมดอายุ
export const cleanupExpiredTokens = async () => {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const database = client.db();
  const tokensCollection = database.collection("tokens");

  try {
    // หา tokens ที่หมดอายุแล้วแต่ยังมีสถานะ active
    const currentDate = new Date();
    const result = await tokensCollection.updateMany(
      {
        status: "active",
        $or: [
          { expiresAt: { $lt: currentDate } },
          { refreshExpiresAt: { $lt: currentDate } },
        ],
      },
      { $set: { status: "revoked" } }
    );

    return { success: true, modifiedCount: result.modifiedCount };
  } catch (error) {
    console.error("Error cleaning up expired tokens:", error);
    return { success: false, error };
  } finally {
    await client.close();
  }
};

// ลบ token ที่ไม่ได้ใช้งานเป็นเวลานาน (เช่น 30 วัน)
export const removeUnusedTokens = async (daysThreshold: number = 30) => {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const database = client.db();
  const tokensCollection = database.collection("tokens");

  try {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - daysThreshold);

    const result = await tokensCollection.deleteMany({
      status: "revoked",
      $or: [
        { lastUsed: { $lt: thresholdDate } },
        { lastUsed: { $exists: false } },
      ],
    });

    return { success: true, deletedCount: result.deletedCount };
  } catch (error) {
    console.error("Error removing unused tokens:", error);
    return { success: false, error };
  } finally {
    await client.close();
  }
}; 