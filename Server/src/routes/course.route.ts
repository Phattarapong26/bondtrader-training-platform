import { Router } from "express";
import { getCourseById, getAllCourses,getUser } from "../controllers/course.controller";
import { verifyToken } from "../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Course:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: รหัสคอร์ส
 *         title:
 *           type: string
 *           description: ชื่อคอร์ส
 *         description:
 *           type: string
 *           description: รายละเอียดคอร์ส
 *         instructor:
 *           type: string
 *           description: ชื่อผู้สอน
 *         max_seats:
 *           type: integer
 *           description: จำนวนที่นั่งสูงสุด
 *         available_seats:
 *           type: integer
 *           description: จำนวนที่นั่งที่เหลือ
 *         start_date:
 *           type: string
 *           format: date
 *           description: วันที่เริ่มคอร์ส
 *         status:
 *           type: string
 *           enum: [active, inactive, completed]
 *           description: สถานะของคอร์ส
 *         thumbnail_url:
 *           type: string
 *           description: URL รูปภาพตัวอย่างคอร์ส
 *         video_url:
 *           type: string
 *           description: URL วิดีโอคอร์ส
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: วันที่สร้างคอร์ส
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: วันที่อัปเดตคอร์สล่าสุด
 */

/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: API สำหรับจัดการคอร์สเรียน
 */

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     summary: ดึงข้อมูลคอร์สตาม ID
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID ของคอร์สที่ต้องการดึงข้อมูล
 *     responses:
 *       200:
 *         description: ดึงข้อมูลคอร์สสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *             example:
 *               id: "123456789"
 *               title: "การพัฒนา Web Application ด้วย React"
 *               description: "เรียนรู้การพัฒนาเว็บแอปพลิเคชันด้วย React แบบครบวงจร"
 *               instructor: "อาจารย์ สมชาย ใจดี"
 *               max_seats: 30
 *               available_seats: 15
 *               start_date: "2025-05-01"
 *               status: "active"
 *               thumbnail_url: "https://example.com/images/course123.jpg"
 *               video_url: "https://example.com/videos/course123.mp4"
 *               created_at: "2025-04-01T08:00:00Z"
 *               updated_at: "2025-04-01T08:00:00Z"
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "กรุณาเข้าสู่ระบบ"
 *       403:
 *         description: ไม่มีสิทธิ์ดูข้อมูลคอร์สนี้
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "ไม่มีสิทธิ์เข้าถึงข้อมูลคอร์สนี้"
 *       404:
 *         description: ไม่พบคอร์สที่ระบุ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "ไม่พบคอร์สที่ระบุ"
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "เกิดข้อผิดพลาดในการดึงข้อมูลคอร์ส"
 */

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: ดึงข้อมูลคอร์สทั้งหมด
 *     tags: [Courses]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, completed]
 *         description: กรองคอร์สตามสถานะ
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: หน้าที่ต้องการ
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: จำนวนรายการต่อหน้า
 *     responses:
 *       200:
 *         description: ดึงข้อมูลคอร์สทั้งหมดสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 courses:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Course'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: จำนวนคอร์สทั้งหมด
 *                     page:
 *                       type: integer
 *                       description: หน้าปัจจุบัน
 *                     limit:
 *                       type: integer
 *                       description: จำนวนรายการต่อหน้า
 *                     total_pages:
 *                       type: integer
 *                       description: จำนวนหน้าทั้งหมด
 *             example:
 *               courses:
 *                 - id: "123456789"
 *                   title: "การพัฒนา Web Application ด้วย React"
 *                   description: "เรียนรู้การพัฒนาเว็บแอปพลิเคชันด้วย React แบบครบวงจร"
 *                   instructor: "อาจารย์ สมชาย ใจดี"
 *                   max_seats: 30
 *                   available_seats: 15
 *                   start_date: "2025-05-01"
 *                   status: "active"
 *               pagination:
 *                 total: 50
 *                 page: 1
 *                 limit: 10
 *                 total_pages: 5
 *       400:
 *         description: พารามิเตอร์ไม่ถูกต้อง
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "พารามิเตอร์ไม่ถูกต้อง"
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "เกิดข้อผิดพลาดในการดึงข้อมูลคอร์ส"
 */

/**
 * @swagger
 * /api/v1/user/courses/{id}:
 *   get:
 *     summary: ดึงข้อมูลคอร์สของผู้ใช้ตาม ID
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID ของผู้ใช้ที่ต้องการดึงข้อมูลคอร์ส
 *     responses:
 *       200:
 *         description: ดึงข้อมูลคอร์สของผู้ใช้สำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 courses:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Course'
 *                       - type: object
 *                         properties:
 *                           enrollment_status:
 *                             type: string
 *                             enum: [enrolled, completed, cancelled]
 *                             description: สถานะการลงทะเบียนของผู้ใช้ในคอร์ส
 *                           enrollment_date:
 *                             type: string
 *                             format: date-time
 *                             description: วันที่ลงทะเบียน
 *             example:
 *               user:
 *                 id: "987654321"
 *                 name: "สมหญิง รักเรียน"
 *                 email: "somying@example.com"
 *               courses:
 *                 - id: "123456789"
 *                   title: "การพัฒนา Web Application ด้วย React"
 *                   enrollment_status: "enrolled"
 *                   enrollment_date: "2025-04-01T08:00:00Z"
 *                   status: "active"
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "กรุณาเข้าสู่ระบบ"
 *       403:
 *         description: ไม่มีสิทธิ์ดูข้อมูลของผู้ใช้นี้
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "ไม่มีสิทธิ์เข้าถึงข้อมูลของผู้ใช้นี้"
 *       404:
 *         description: ไม่พบผู้ใช้ที่ระบุ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "ไม่พบผู้ใช้ที่ระบุ"
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "เกิดข้อผิดพลาดในการดึงข้อมูลคอร์สของผู้ใช้"
 */

router.get("/courses/:id", 
    verifyToken, 
    getCourseById);

router.get("/courses", getAllCourses);

router.get("/v1/user/courses/:id", verifyToken, getUser);

export default router;
