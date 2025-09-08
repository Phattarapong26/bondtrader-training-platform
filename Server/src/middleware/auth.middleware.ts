import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import { validateTokenInDb } from "../services/token.service";

dotenv.config();
// Augment the Request type to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: string; // Adjust the type according to how you store userId
      currentAdminId?: string; // Adjust the type according to how you store userId
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || "uknowme";
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/Uknowmedatabase";

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }

  try {
    // ตรวจสอบ token signature และตรวจสอบในฐานข้อมูล
    const result = await validateTokenInDb(token);
    
    if (!result.valid) {
      return res.status(401).json({ message: result.message });
    }
    
    const decoded = result.user as any;
    req.userId = decoded.userId; 
    req.currentAdminId = decoded.currentAdminId;
    next();
  } catch (err: any) {
    return res
      .status(401)
      .json({ message: "Unauthorized", error: err.message });
  }
};
