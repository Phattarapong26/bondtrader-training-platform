import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware";
import {
  addAdmin,
  getAdmins,
  updateAdmin,
  deleteAdmin,
  setupTwoFactorAuth,
  loginPrivateAdmin,
  verifyOTP,
  logout,
} from "../services/superadmin.service";

const superAdminRouter = Router();

/**
 * @swagger
 * tags:
 *   name: SuperAdmin
 *   description: API สำหรับผู้ดูแลระบบระดับสูง
 */

/**
 * @swagger
 * /api/SuperAdmin/Add/admins:
 *   post:
 *     summary: เพิ่มผู้ดูแลระบบใหม่
 *     description: สร้างบัญชีผู้ดูแลระบบใหม่
 *     tags: [SuperAdmin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: ชื่อผู้ดูแลระบบ
 *               idCard:
 *                 type: string
 *                 description: เลขบัตรประชาชน
 *               employeeId:
 *                 type: string
 *                 description: รหัสพนักงาน
 *               phone:
 *                 type: string
 *                 description: เบอร์โทรศัพท์
 *               email:
 *                 type: string
 *                 description: อีเมล
 *               roles:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: บทบาทของผู้ดูแลระบบ
 *               password:
 *                 type: string
 *                 description: รหัสผ่าน
 *             required:
 *               - name
 *               - email
 *               - password
 *     responses:
 *       201:
 *         description: สร้างผู้ดูแลระบบสำเร็จ
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
superAdminRouter.post("/Add/admins", 
verifyToken, 
addAdmin);

/**
 * @swagger
 * /api/SuperAdmin/Get/admins:
 *   get:
 *     summary: ดึงข้อมูลผู้ดูแลระบบทั้งหมด
 *     description: ดึงรายการผู้ดูแลระบบทั้งหมด
 *     tags: [SuperAdmin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ดึงข้อมูลผู้ดูแลระบบสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Admin'
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
superAdminRouter.get("/Get/admins", 
verifyToken, 
getAdmins);

/**
 * @swagger
 * /api/SuperAdmin/Update/admins/{id}:
 *   put:
 *     summary: อัปเดตข้อมูลผู้ดูแลระบบ
 *     description: อัปเดตข้อมูลผู้ดูแลระบบตาม ID
 *     tags: [SuperAdmin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID ของผู้ดูแลระบบที่ต้องการอัปเดต
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: ชื่อผู้ดูแลระบบ
 *               phone:
 *                 type: string
 *                 description: เบอร์โทรศัพท์
 *               email:
 *                 type: string
 *                 description: อีเมล
 *               roles:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: บทบาทของผู้ดูแลระบบ
 *     responses:
 *       200:
 *         description: อัปเดตข้อมูลผู้ดูแลระบบสำเร็จ
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง
 *       404:
 *         description: ไม่พบผู้ดูแลระบบ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
superAdminRouter.put(
  "/Update/admins/:id",
  verifyToken,
  updateAdmin
);

/**
 * @swagger
 * /api/SuperAdmin/Deleted/admins/{id}:
 *   delete:
 *     summary: ลบผู้ดูแลระบบ
 *     description: ลบผู้ดูแลระบบตาม ID
 *     tags: [SuperAdmin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID ของผู้ดูแลระบบที่ต้องการลบ
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: ลบผู้ดูแลระบบสำเร็จ
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง
 *       404:
 *         description: ไม่พบผู้ดูแลระบบ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
superAdminRouter.delete(
  "/Deleted/admins/:id",
  verifyToken,
  deleteAdmin
);

/**
 * @swagger
 * /api/SuperAdmin/Login/verify/setup-2fa:
 *   post:
 *     summary: ตั้งค่าการยืนยันตัวตนสองชั้น
 *     description: ตั้งค่าการยืนยันตัวตนสองชั้นสำหรับผู้ดูแลระบบ
 *     tags: [SuperAdmin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: อีเมลของผู้ดูแลระบบ
 *             required:
 *               - email
 *     responses:
 *       200:
 *         description: ตั้งค่าการยืนยันตัวตนสองชั้นสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 otp:
 *                   type: string
 *       404:
 *         description: ไม่พบผู้ดูแลระบบ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
superAdminRouter.post(
  "/Login/verify/setup-2fa",
  setupTwoFactorAuth
);

/**
 * @swagger
 * /api/SuperAdmin/Login:
 *   post:
 *     summary: เข้าสู่ระบบสำหรับผู้ดูแลระบบระดับสูง
 *     description: ตรวจสอบข้อมูลเข้าสู่ระบบสำหรับผู้ดูแลระบบระดับสูง
 *     tags: [SuperAdmin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: อีเมล
 *               password:
 *                 type: string
 *                 description: รหัสผ่าน
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: เข้าสู่ระบบสำเร็จ หรือต้องใช้ OTP
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 requireOTP:
 *                   type: boolean
 *                 token:
 *                   type: string
 *                   description: JWT token (เฉพาะกรณีไม่ต้องใช้ OTP)
 *       401:
 *         description: อีเมลหรือรหัสผ่านไม่ถูกต้อง
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
superAdminRouter.post("/Login", loginPrivateAdmin);

/**
 * @swagger
 * /api/SuperAdmin/Login/verifyOTP:
 *   post:
 *     summary: ยืนยัน OTP สำหรับการเข้าสู่ระบบ
 *     description: ตรวจสอบ OTP สำหรับการยืนยันตัวตนสองชั้น
 *     tags: [SuperAdmin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: อีเมล
 *               otp:
 *                 type: string
 *                 description: รหัส OTP
 *             required:
 *               - email
 *               - otp
 *     responses:
 *       200:
 *         description: ยืนยัน OTP สำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                   description: JWT token
 *       401:
 *         description: OTP ไม่ถูกต้องหรือหมดอายุ
 *       404:
 *         description: ไม่พบผู้ดูแลระบบ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
superAdminRouter.post("/Login/verifyOTP", verifyOTP);

/**
 * @swagger
 * /api/SuperAdmin/Logout:
 *   post:
 *     summary: ออกจากระบบ
 *     description: ยกเลิก token ที่ใช้อยู่และเปลี่ยนสถานะในฐานข้อมูลเป็น revoked
 *     tags: [SuperAdmin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token ที่ต้องการยกเลิก
 *     responses:
 *       200:
 *         description: ออกจากระบบสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Logged out successfully"
 *       400:
 *         description: ไม่มี Token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Token not provided"
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
superAdminRouter.post("/Logout", verifyToken, logout);

export default superAdminRouter;
