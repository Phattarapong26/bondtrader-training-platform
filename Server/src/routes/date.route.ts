import { Router } from "express";
import {
  formatDate,
  calculateAge,
  daysUntilRenewal,
} from "../controllers/date.controller";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Date
 *   description: API สำหรับการจัดการเกี่ยวกับวันที่
 */

/**
 * @swagger
 * /api/format:
 *   post:
 *     summary: จัดรูปแบบวันที่
 *     description: แปลงรูปแบบวันที่ตามที่กำหนด
 *     tags: [Date]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 description: วันที่ที่ต้องการจัดรูปแบบ
 *               format:
 *                 type: string
 *                 description: รูปแบบที่ต้องการ (เช่น 'YYYY-MM-DD')
 *             required:
 *               - date
 *     responses:
 *       200:
 *         description: จัดรูปแบบวันที่สำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 formattedDate:
 *                   type: string
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.post("/format", formatDate);

/**
 * @swagger
 * /api/calculateAge:
 *   post:
 *     summary: คำนวณอายุ
 *     description: คำนวณอายุจากวันเกิดจนถึงปัจจุบัน
 *     tags: [Date]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               birthDate:
 *                 type: string
 *                 format: date
 *                 description: วันเกิด
 *             required:
 *               - birthDate
 *     responses:
 *       200:
 *         description: คำนวณอายุสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 age:
 *                   type: integer
 *                   description: อายุ (ปี)
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.post("/calculateAge", calculateAge);

/**
 * @swagger
 * /api/daysUntilRenewal:
 *   post:
 *     summary: คำนวณจำนวนวันที่เหลือจนถึงวันต่ออายุ
 *     description: คำนวณจำนวนวันที่เหลือจนถึงวันที่ต้องต่ออายุ
 *     tags: [Date]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               renewalDate:
 *                 type: string
 *                 format: date
 *                 description: วันที่ต้องต่ออายุ
 *             required:
 *               - renewalDate
 *     responses:
 *       200:
 *         description: คำนวณจำนวนวันสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 daysRemaining:
 *                   type: integer
 *                   description: จำนวนวันที่เหลือ
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.post("/daysUntilRenewal", daysUntilRenewal);

export default router;
