import { Router } from "express";
import {
  login,
  signup,
  validateToken,
  refreshToken,
  logout,
} from "../controllers/auth.controller";
const router = Router();

router.post("/login", login);
router.post("/signup", signup);
router.get("/validate-token", validateToken);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: JWT access token
 *         refreshToken:
 *           type: string
 *           description: Token for refreshing access token
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             name:
 *               type: string
 *             email:
 *               type: string
 *             role:
 *               type: string
 *             status:
 *               type: string
 *   responses:
 *     UnauthorizedError:
 *       description: ไม่มีสิทธิ์เข้าถึง
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: "Unauthorized access"
 *     ServerError:
 *       description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: "Internal server error"
 */

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: API สำหรับการจัดการการเข้าสู่ระบบและบัญชีผู้ใช้
 */

/**
 * @swagger
 * /login:
 *   post:
 *     summary: เข้าสู่ระบบสำหรับผู้ใช้หรือผู้ดูแลระบบ
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *                 description: อีเมลผู้ใช้
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "YourPassword123!"
 *                 description: รหัสผ่าน
 *               role:
 *                 type: string
 *                 enum: [admin, user]
 *                 example: user
 *                 description: บทบาทของผู้ใช้ (admin หรือ user)
 *     responses:
 *       200:
 *         description: เข้าสู่ระบบสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *             example:
 *               token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               user:
 *                 id: "123456789"
 *                 name: "John Doe"
 *                 email: "user@example.com"
 *                 role: "user"
 *                 status: "active"
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               missingFields:
 *                 value:
 *                   message: "กรุณากรอกอีเมลและรหัสผ่าน"
 *               invalidEmail:
 *                 value:
 *                   message: "รูปแบบอีเมลไม่ถูกต้อง"
 *       401:
 *         description: อีเมลหรือรหัสผ่านไม่ถูกต้อง
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "อีเมลหรือรหัสผ่านไม่ถูกต้อง"
 *       403:
 *         description: บัญชีถูกระงับการใช้งาน
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "บัญชีนี้ถูกระงับการใช้งาน"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /signup:
 *   post:
 *     summary: ลงทะเบียนผู้ใช้ใหม่
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - company
 *               - citizenId
 *               - email
 *               - phone
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: "สมชาย ใจดี"
 *                 description: ชื่อผู้ใช้
 *               company:
 *                 type: string
 *                 example: "บริษัท ตัวอย่าง จำกัด"
 *                 description: ชื่อบริษัท
 *               citizenId:
 *                 type: string
 *                 pattern: "^[0-9]{13}$"
 *                 example: "1234567890123"
 *                 description: เลขบัตรประชาชน 13 หลัก
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *                 description: อีเมล
 *               phone:
 *                 type: string
 *                 pattern: "^[0-9]{10}$"
 *                 example: "0812345678"
 *                 description: เบอร์โทรศัพท์ 10 หลัก
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "YourPassword123!"
 *                 description: รหัสผ่าน
 *     responses:
 *       201:
 *         description: ลงทะเบียนผู้ใช้สำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "ลงทะเบียนสำเร็จ"
 *                 userId:
 *                   type: string
 *                   example: "123456789"
 *                 role:
 *                   type: string
 *                   example: "user"
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               duplicateEmail:
 *                 value:
 *                   message: "อีเมลนี้ถูกใช้งานแล้ว"
 *               duplicateCitizenId:
 *                 value:
 *                   message: "เลขบัตรประชาชนนี้ถูกใช้งานแล้ว"
 *               invalidFormat:
 *                 value:
 *                   message: "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบรูปแบบข้อมูล"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /validate-token:
 *   get:
 *     summary: ตรวจสอบความถูกต้องของโทเคน
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: โทเคนถูกต้อง
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                     status:
 *                       type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /refresh-token:
 *   post:
 *     summary: ต่ออายุโทเคนที่หมดอายุ
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: refresh token ที่ได้รับตอนเข้าสู่ระบบ
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: ต่ออายุโทเคนสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: โทเคนใหม่
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       401:
 *         description: ต้องระบุ refresh token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "กรุณาระบุ refresh token"
 *       403:
 *         description: refresh token ไม่ถูกต้องหรือหมดอายุ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "refresh token ไม่ถูกต้องหรือหมดอายุ"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

export default router;
