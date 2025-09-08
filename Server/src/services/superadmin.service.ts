// This is Superadmin.server.ts
import { Request, Response } from "express";
import { MongoClient, ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import jwt from "jsonwebtoken";
import { createNewTokens } from "./token.service";

// Centralized MongoDB client
const client = new MongoClient("mongodb://localhost/Uknowmedatabase");
const db = client.db("Uknowmedatabase");
const adminsCollection = db.collection("admins");
const privateKeysCollection = db.collection("PrivateKeyAdmin");
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "your_refresh_secret";

// Add Admin
export const addAdmin = async (req: Request, res: Response) => {
  try {
    const { name, idCard, employeeId, phone, email, roles } = req.body;
    const hashedPassword = await bcrypt.hash(employeeId, 10);

    const newAdmin = {
      name,
      idCard,
      employeeId,
      phone,
      email,
      roles,
      password: hashedPassword,
    };
    const result = await adminsCollection.insertOne(newAdmin);

    res
      .status(201)
      .json({ message: "Admin created successfully", id: result.insertedId });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error creating admin", error: error.message });
  }
};

// Get Admins
export const getAdmins = async (_req: Request, res: Response) => {
  try {
    const admins = await adminsCollection.find().toArray();
    const adminsWithoutPassword = admins.map(({ password, ...admin }) => admin);

    res.json(adminsWithoutPassword);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error fetching admins", error: error.message });
  }
};

// Update Admin
export const updateAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, idCard, employeeId, phone, email, roles } = req.body;

    const currentAdmin = await adminsCollection.findOne({
      _id: new ObjectId(id),
    });
    if (!currentAdmin)
      return res.status(404).json({ message: "Admin not found" });

    const hashedPassword =
      employeeId !== currentAdmin.employeeId
        ? await bcrypt.hash(employeeId, 10)
        : currentAdmin.password;

    const updatedAdmin = {
      name,
      idCard,
      employeeId,
      phone,
      email,
      roles,
      password: hashedPassword,
    };
    const result = await adminsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedAdmin }
    );

    res.json({ message: "Admin updated successfully" });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error updating admin", error: error.message });
  }
};

// Delete Admin
export const deleteAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await adminsCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0)
      return res.status(404).json({ message: "Admin not found" });

    res.json({ message: "Admin deleted successfully" });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error deleting admin", error: error.message });
  }
};

// Setup 2FA
export const setupTwoFactorAuth = async (req: Request, res: Response) => {
  try {
    const { privateKey } = req.body;

    const existingKey = await privateKeysCollection.findOne({
      privateKey,
      isActive: true,
    });
    if (!existingKey)
      return res.status(401).json({ message: "Invalid keys", privateKey });

    if (existingKey.secret) {
      return res.status(200).json({ message: "2FA already set up" });
    }

    const newSecret = speakeasy.generateSecret({ name: "SuperAdmin" });
    await privateKeysCollection.updateOne(
      { _id: existingKey._id },
      { $set: { secret: newSecret.base32 } }
    );

    const qrCodeDataURL = await qrcode.toDataURL(newSecret.otpauth_url!);
    res.status(200).json({ qrCode: qrCodeDataURL });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error in 2FA setup", error: error.message });
  }
};

// Login
export const loginPrivateAdmin = async (req: Request, res: Response) => {
  try {
    const { privateKey } = req.body;

    // Validate private key length
    if (!privateKey || privateKey.length !== 25) {
      return res.status(400).json({ message: "Invalid private key length" });
    }

    // Check if private key exists and is active
    const existingKey = await privateKeysCollection.findOne({
      privateKey,
      isActive: true,
    });

    if (!existingKey) {
      return res.status(401).json({ message: "Invalid private key" });
    }

    // Generate temporary admin ID for 2FA process
    const adminId = generateUniqueAdminId();

    await privateKeysCollection.updateOne(
      { privateKey },
      { $set: { currentAdminId: adminId, lastLoginAttempt: new Date() } }
    );

    // Generate and return QR code for TOTP setup
    const secret = speakeasy.generateSecret({ name: "Uknowme Asset" });

    // สร้าง tokens และเก็บในฐานข้อมูล
    const tokenData = await createNewTokens(
      existingKey._id.toString(),
      "superadmin"
    );

    // Prepare redirect and user info
    const redirectInfo = {
      path: "/SuperAdminDashboard",
      permissions: existingKey.permissions || [],
    };

    // Clear temporary secret after successful login
    await privateKeysCollection.updateOne(
      { privateKey },
      {
        $unset: { tempSecret: 1 },
        $set: { lastSuccessfulLogin: new Date() },
      }
    );

    // Return adminId and QR code URI for frontend to display
    res.status(200).json({
      adminId,
      qrCode: secret.otpauth_url,
      superadmin: redirectInfo,
      token: tokenData.token,
      refreshToken: tokenData.refreshToken,
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res
      .status(500)
      .json({ message: "Error during login", error: error.message });
  }
};

// Verify OTP
export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { adminId, otp } = req.body;

    // ตรวจสอบพารามิเตอร์
    if (!adminId || !otp) {
      return res.status(400).json({
        message: "missing_parameters",
        detail: "กรุณาส่งรหัส OTP และ adminId",
      });
    }

    // ค้นหาผู้ใช้
    const existingKey = await privateKeysCollection.findOne({
      currentAdminId: adminId,
    });

    if (!existingKey) {
      return res.status(401).json({
        message: "invalid_adminId",
        detail: "ไม่พบ adminId นี้",
      });
    }

    // ตรวจสอบ secret
    if (!existingKey.secret) {
      return res.status(401).json({
        message: "2FA not set up",
        detail: "ผู้ใช้งานนี้ยังไม่ได้ตั้งค่า 2FA",
      });
    }
    // ตรวจสอบ OTP
    const verified = speakeasy.totp.verify({
      secret: existingKey.secret,
      encoding: "base32",
      token: otp,
      window: 2,
    });

    if (verified) {
      // อัปเดตการเข้าสู่ระบบ
      await privateKeysCollection.updateOne(
        { _id: existingKey._id },
        {
          $set: {
            lastLogin: new Date(),
            currentAdminId: null,
          },
        }
      );

      return res.status(200).json({
        message: "MFA verified",
        detail: "ยืนยันตัวตนสำเร็จ",
      });
    } else {
      return res.status(401).json({
        message: "invalid_otp",
        detail: "รหัส OTP ไม่ถูกต้องหรือหมดอายุแล้ว",
      });
    }
  } catch (error: any) {
    console.error("Error in OTP verification:", error.message);
    return res.status(500).json({
      message: "internal_error",
      detail: "เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้ง",
    });
  }
};

// เพิ่ม logout function
export const logout = async (req: Request, res: Response) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  const refreshToken = req.body.refreshToken;

  if (!token) {
    return res.status(400).json({ message: "Token not provided" });
  }

  try {
    const tokensCollection = db.collection("tokens");
    
    // ยกเลิก token
    if (token) {
      await tokensCollection.updateOne(
        { token },
        { $set: { status: "revoked" } }
      );
    }
    
    // ยกเลิก refresh token ถ้ามี
    if (refreshToken) {
      await tokensCollection.updateOne(
        { refreshToken },
        { $set: { status: "revoked" } }
      );
    }
    
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error logging out:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

function generateUniqueAdminId(): string {
  return Math.random().toString(36).substring(2, 27);
}


