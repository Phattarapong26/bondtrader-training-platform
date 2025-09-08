import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || "uknowme";
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "your_refresh_secret";
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/Uknowmedatabase";

// Handler for Login
export const login = async (req: Request, res: Response) => {
  let client;
  try {
    const { email, password, role } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const database = client.db();
    let user;

    if (role === "admin") {
      const adminsCollection = database.collection("admins");
      user = await adminsCollection.findOne({ email });
    } else {
      const usersCollection = database.collection("users");
      user = await usersCollection.findOne({ email });
    }

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.bond_status && user.bond_status.status === "deactive") {
      return res.status(403).json({
        message: "Your account has been deactivated, please contact the admin.",
        showAlert: true,
      });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // กำหนดระยะเวลาหมดอายุ
    const accessTokenExpiry = "10h"; // คงเดิม 10 ชั่วโมง
    const refreshTokenExpiry = "7d"; // เปลี่ยนจาก 15 นาที เป็น 7 วัน
    
    // สร้าง tokens
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: accessTokenExpiry }
    );

    const refreshToken = jwt.sign(
      { userId: user._id.toString(), role: user.role },
      REFRESH_TOKEN_SECRET,
      { expiresIn: refreshTokenExpiry }
    );

    // คำนวณเวลาหมดอายุจริง
    const accessTokenExpiryDate = new Date();
    accessTokenExpiryDate.setHours(accessTokenExpiryDate.getHours() + 10);
    
    const refreshTokenExpiryDate = new Date();
    refreshTokenExpiryDate.setDate(refreshTokenExpiryDate.getDate() + 7);
    
    // เก็บ token ในฐานข้อมูล
    const tokensCollection = database.collection("tokens");
    
    // ยกเลิก tokens เก่าของผู้ใช้
    await tokensCollection.updateMany(
      { userId: user._id.toString() },
      { $set: { status: "revoked" } }
    );
    
    // เพิ่ม token ใหม่
    await tokensCollection.insertOne({
      userId: user._id.toString(),
      token,
      refreshToken,
      userRole: user.role,
      status: "active",
      createdAt: new Date(),
      expiresAt: accessTokenExpiryDate,
      refreshExpiresAt: refreshTokenExpiryDate,
      lastUsed: new Date()
    });

    let redirectInfo;
    if (role === "admin") {
      redirectInfo = {
        path: "/AdminDashboard",
        permissions: user.permissions || [],
      };
    } else {
      redirectInfo = {
        path: "/UserHomepage",
        enrolledCourses: user.courses_enrolled || [],
      };
    }

    const userData = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };

    res.json({
      message: "Login successful",
      user: userData,
      redirectInfo,
      token,
      refreshToken,
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    if (client) {
      await client.close();
    }
  }
};

// Handler for Signup
export const signup = async (req: Request, res: Response) => {
  let client: MongoClient | null = null;
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const database = client.db("Uknowmedatabase");
    const users = database.collection("users");
    const { name, company, citizenId, email, phone } = req.body;

    const existingUser = await users.findOne({
      $or: [{ email }, { citizen_id: citizenId }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({
          message: "duplicate_email",
          detail: "Email already registered",
        });
      } else if (existingUser.citizen_id === citizenId) {
        return res.status(400).json({
          message: "duplicate_citizen_id",
          detail: "Citizen ID already registered",
        });
      }
    }

    const hashedPassword = await bcrypt.hash(citizenId, 10);

    const newUser = {
      name,
      company,
      citizen_id: citizenId,
      email,
      phone,
      password: hashedPassword,
      password_changed: false,
      role: "user",
      bond_status: {
        status: "inactive",
        start_date: null,
        end_date: null,
      },
      courses_enrolled: [],
      created_at: new Date(),
      updated_at: new Date(),
    };

    const result = await users.insertOne(newUser);

    res.status(201).json({
      message:
        "User registered successfully. Please login using your Citizen ID as password.",
      userId: result.insertedId,
      role: "user",
    });
  } catch (error: unknown) {
    console.error("Error registering user:", error);

    // Type Guard for Error type
    if (error instanceof Error) {
      res
        .status(500)
        .json({ message: "Internal server error", detail: error.message });
    } else {
      res.status(500).json({ message: "Unknown error occurred" });
    }
  } finally {
    if (client) {
      await client.close();
    }
  }
};

// Handler for Token Validation
export const validateToken = (req: Request, res: Response) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ valid: false, message: "Token not provided" });
  }

  try {
    // 1. ตรวจสอบลายเซ็น token
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    
    // 2. ตรวจสอบว่า token ยังอยู่ในฐานข้อมูลและยังใช้งานได้
    const validateTokenInDb = async () => {
      try {
        const client = new MongoClient(MONGODB_URI);
        await client.connect();
        const database = client.db();
        const tokensCollection = database.collection("tokens");
        
        const tokenRecord = await tokensCollection.findOne({ 
          token, 
          status: "active",
          expiresAt: { $gt: new Date() }
        });
        
        if (!tokenRecord) {
          return res.status(401).json({ valid: false, message: "Token has been revoked or expired" });
        }
        
        // อัปเดตเวลาใช้งานล่าสุด
        await tokensCollection.updateOne(
          { token },
          { $set: { lastUsed: new Date() } }
        );
        
        await client.close();
        return res.json({ valid: true, user: decoded });
      } catch (dbError) {
        console.error("Database validation error:", dbError);
        return res.status(500).json({ valid: false, message: "Error validating token in database" });
      }
    };
    
    validateTokenInDb();
  } catch (error: unknown) {
    console.error("Token validation error:", error);

    // Type Guard for Error type
    if (error instanceof Error) {
      if (error.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ valid: false, message: "Token has expired" });
      } else if (error.name === "JsonWebTokenError") {
        return res.status(401).json({ valid: false, message: "Invalid token" });
      }
    }

    // Handle unexpected errors
    return res
      .status(500)
      .json({ valid: false, message: "Internal server error" });
  }
};

// Handler for Refresh Token
export const refreshToken = async (req: Request, res: Response) => {
  const refreshToken = req.body.token;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token required" });
  }

  try {
    // 1. ตรวจสอบลายเซ็น refresh token
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as {
      userId: string;
      role: string;
    };
    
    // 2. ตรวจสอบใน database
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const database = client.db();
    const tokensCollection = database.collection("tokens");
    
    const tokenRecord = await tokensCollection.findOne({ 
      refreshToken, 
      status: "active",
      refreshExpiresAt: { $gt: new Date() }
    });
    
    if (!tokenRecord) {
      await client.close();
      return res.status(401).json({ message: "Refresh token has been revoked or expired" });
    }
    
    // 3. สร้าง token ใหม่ (Token Rotation)
    const newAccessToken = jwt.sign(
      { userId: decoded.userId, role: decoded.role },
      JWT_SECRET,
      { expiresIn: "10h" }
    );
    
    const newRefreshToken = jwt.sign(
      { userId: decoded.userId, role: decoded.role },
      REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );
    
    // คำนวณเวลาหมดอายุจริง
    const accessTokenExpiryDate = new Date();
    accessTokenExpiryDate.setHours(accessTokenExpiryDate.getHours() + 10);
    
    const refreshTokenExpiryDate = new Date();
    refreshTokenExpiryDate.setDate(refreshTokenExpiryDate.getDate() + 7);
    
    // 4. ยกเลิก refresh token เดิม
    await tokensCollection.updateOne(
      { refreshToken },
      { $set: { status: "revoked" } }
    );
    
    // 5. เพิ่ม token ชุดใหม่ในฐานข้อมูล
    await tokensCollection.insertOne({
      userId: decoded.userId,
      token: newAccessToken,
      refreshToken: newRefreshToken,
      userRole: decoded.role,
      status: "active",
      createdAt: new Date(),
      expiresAt: accessTokenExpiryDate,
      refreshExpiresAt: refreshTokenExpiryDate,
      lastUsed: new Date()
    });
    
    await client.close();
    
    res.json({ 
      token: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    console.error("Error refreshing token:", error);
    return res.status(403).json({ message: "Invalid refresh token" });
  }
};

// Logout handler - เพิ่มใหม่
export const logout = async (req: Request, res: Response) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  const refreshToken = req.body.refreshToken;

  if (!token) {
    return res.status(400).json({ message: "Token not provided" });
  }

  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const database = client.db();
    const tokensCollection = database.collection("tokens");
    
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
    
    await client.close();
    
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error logging out:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
