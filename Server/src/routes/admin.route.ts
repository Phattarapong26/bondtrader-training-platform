import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware";
import upload from "../middleware/upload.middleware"; // Assuming multer config is centralized
import * as AdminService from "../services/admin.service";

const adminRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: API สำหรับผู้ดูแลระบบ
 */

adminRouter.get("/Get/users", 
  verifyToken, 
  AdminService.getUsers);
adminRouter.get(
  '/Get/user/by/:id',
  verifyToken,
  AdminService.getUserById 
);


adminRouter.post(
  "/Add/NewCourses",
  verifyToken,
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "video", maxCount: 1 },
    { name: "qr_code", maxCount: 1 },
  ]),
  AdminService.addNewCourse
);

adminRouter.put(
  "/UpdateDetail/courses/:id",
  verifyToken,
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "video", maxCount: 1 },
    { name: "qr_code", maxCount: 1 },
  ]),
  AdminService.updateCourseDetails
);

adminRouter.delete(
  "/Deleted/courses/:id",
  verifyToken,
  AdminService.deleteCourse
);

/**
 * @swagger
 * /api/Admin/UpdateDetail/Profile/yourself:
 *   put:
 *     summary: อัปเดตโปรไฟล์ผู้ดูแลระบบ
 *     description: อัปเดตข้อมูลส่วนตัวของผู้ดูแลระบบที่กำลังใช้งาน
 *     tags: [Admin]
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
 *               phone:
 *                 type: string
 *                 description: เบอร์โทรศัพท์
 *               email:
 *                 type: string
 *                 description: อีเมล
 *     responses:
 *       200:
 *         description: อัปเดตโปรไฟล์สำเร็จ
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง
 *       404:
 *         description: ไม่พบผู้ดูแลระบบ
 *       500:
 *         description: ข้อผิดพลาดของเซิร์ฟเวอร์
 */
adminRouter.put(
  "/UpdateDetail/Profile/yourself",
  verifyToken,
  AdminService.updateAdminProfile
);

/**
 * @swagger
 * /api/Admin/Check/participants/{courseId}:
 *   get:
 *     summary: ตรวจสอบผู้เข้าร่วมคอร์ส
 *     description: ดึงรายชื่อผู้เข้าร่วมคอร์สโดยระบุ ID ของคอร์ส
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: courseId
 *         in: path
 *         required: true
 *         description: ID ของคอร์สที่ต้องการตรวจสอบผู้เข้าร่วม
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: ดึงข้อมูลผู้เข้าร่วมสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       404:
 *         description: ไม่พบคอร์ส
 *       500:
 *         description: ข้อผิดพลาดของเซิร์ฟเวอร์
 */
adminRouter.get(
  "/Check/participants/:courseId",
  verifyToken,
  AdminService.checkParticipants
);

adminRouter.put(
  "/Update/users/Status&EndDate/:id",
  verifyToken,
  AdminService.updateUserStatus
);

adminRouter.put(
  "/update/UserStatusCourse",
  verifyToken,
  AdminService.updateUserCourseStatus
);

adminRouter.get(
  "/Check/user/HistoryCourses/:userId",
  verifyToken,
  AdminService.checkUserHistory
);

/**
 * @swagger
 * /api/Admin/Verify/Token/Header:
 *   get:
 *     summary: ตรวจสอบความถูกต้องของโทเคน
 *     description: ตรวจสอบว่าโทเคนในส่วนหัวของคำขอถูกต้องและยังใช้งานได้
 *     tags: [Admin]
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
 *                 admin:
 *                   $ref: '#/components/schemas/Admin'
 *       401:
 *         description: โทเคนไม่ถูกต้องหรือหมดอายุ
 *       500:
 *         description: ข้อผิดพลาดของเซิร์ฟเวอร์
 */
adminRouter.get(
  "/Verify/Token/Header",
  verifyToken,
  AdminService.verifyTokenHeader
);


export default adminRouter;

/**
 * @swagger
 * /api/Admin/Add/NewCourses:
 *   post:
 *     summary: เพิ่มคอร์สใหม่
 *     description: สร้างคอร์สใหม่ในระบบ
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: ชื่อคอร์ส
 *               description:
 *                 type: string
 *                 description: รายละเอียดคอร์ส
 *               details:
 *                 type: string
 *                 description: รายละเอียดเพิ่มเติมของคอร์ส
 *               duration_hours:
 *                 type: integer
 *                 description: ระยะเวลาเรียน (ชั่วโมง)
 *               max_seats:
 *                 type: integer
 *                 description: จำนวนที่นั่งสูงสุด
 *               start_date:
 *                 type: string
 *                 format: date
 *                 description: วันที่เริ่มคอร์ส
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *                 description: รูปภาพตัวอย่าง
 *               video:
 *                 type: string
 *                 format: binary
 *                 description: วิดีโอของคอร์ส
 *               qr_code:
 *                 type: string
 *                 format: binary
 *                 description: QR Code ของคอร์ส
 *     responses:
 *       201:
 *         description: คอร์สถูกสร้างสำเร็จ
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง
 *       500:
 *         description: ข้อผิดพลาดของเซิร์ฟเวอร์
 *     security:
 *       - bearerAuth: []
 */

/**
 * เพิ่มคอร์สใหม่
 * @name POST /api/Admin/Add/NewCourses
 * @function
 * @memberof adminRouter
 * @param {import("express").Request} req - Request object
 * @param {import("express").Response} res - Response object
 */
adminRouter.post(
  "/Add/NewCourses",
  verifyToken,
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "video", maxCount: 1 },
    { name: "qr_code", maxCount: 1 },
  ]),
  AdminService.addNewCourse
);

/**
 * @swagger
 * /api/Admin/UpdateDetail/courses/{id}:
 *   put:
 *     summary: อัปเดตรายละเอียดคอร์ส
 *     description: อัปเดตรายละเอียดของคอร์สที่ระบุ
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID ของคอร์สที่ต้องการอัปเดต
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: ชื่อคอร์ส
 *               description:
 *                 type: string
 *                 description: รายละเอียดคอร์ส
 *               details:
 *                 type: string
 *                 description: รายละเอียดเพิ่มเติมของคอร์ส
 *               duration_hours:
 *                 type: integer
 *                 description: ระยะเวลาเรียน (ชั่วโมง)
 *               max_seats:
 *                 type: integer
 *                 description: จำนวนที่นั่งสูงสุด
 *               start_date:
 *                 type: string
 *                 format: date
 *                 description: วันที่เริ่มคอร์ส
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *                 description: รูปภาพตัวอย่าง
 *               video:
 *                 type: string
 *                 format: binary
 *                 description: วิดีโอของคอร์ส
 *               qr_code:
 *                 type: string
 *                 format: binary
 *                 description: QR Code ของคอร์ส
 *     responses:
 *       200:
 *         description: คอร์สถูกอัปเดตสำเร็จ
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง
 *       404:
 *         description: ไม่พบคอร์ส
 *       500:
 *         description: ข้อผิดพลาดของเซิร์ฟเวอร์
 *     security:
 *       - bearerAuth: []
 */

/**
 * อัปเดตรายละเอียดคอร์ส
 * @name PUT /api/Admin/UpdateDetail/courses/:id
 * @function
 * @memberof adminRouter
 * @param {import("express").Request} req - Request object
 * @param {import("express").Response} res - Response object
 */
adminRouter.put(
  "/UpdateDetail/courses/:id",
  verifyToken,
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "video", maxCount: 1 },
    { name: "qr_code", maxCount: 1 },
  ]),
  AdminService.updateCourseDetails
);

/**
 * @swagger
 * /api/Admin/Deleted/courses/{id}:
 *   delete:
 *     summary: ลบคอร์ส
 *     description: ลบคอร์สที่ระบุ
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID ของคอร์สที่ต้องการลบ
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: คอร์สถูกลบสำเร็จ
 *       404:
 *         description: ไม่พบคอร์ส
 *       500:
 *         description: ข้อผิดพลาดของเซิร์ฟเวอร์
 *     security:
 *       - bearerAuth: []
 */

/**
 * ลบคอร์ส
 * @name DELETE /api/Admin/Deleted/courses/:id
 * @function
 * @memberof adminRouter
 * @param {import("express").Request} req - Request object
 * @param {import("express").Response} res - Response object
 */
adminRouter.delete(
  "/Deleted/courses/:id",
  verifyToken,
  AdminService.deleteCourse
);
/**
 * @swagger
 * /api/Admin/Get/users:
 *   get:
 *     summary: Get a list of users.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user list.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 */
adminRouter.get("/Get/users", verifyToken, AdminService.getUsers);

/**
 * @swagger
 * /api/Admin/Get/user/by/{id}:
 *   get:
 *     summary: Get user details by ID.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to fetch.
 *     responses:
 *       200:
 *         description: Successfully retrieved user details.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */
adminRouter.get("/Get/user/by/:id", verifyToken, AdminService.getUserById);

/**
 * @swagger
 * /api/Admin/Update/users/Status&EndDate/{id}:
 *   put:
 *     summary: Update user status and bond end date.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 description: The new status of the user.
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: The new end date of the bond.
 *     responses:
 *       200:
 *         description: User updated successfully.
 *       400:
 *         description: Bad request.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */
adminRouter.put("/Update/users/Status&EndDate/:id", verifyToken, AdminService.updateUserStatus);

/**
 * @swagger
 * /api/Admin/update/UserStatusCourse:
 *   put:
 *     summary: Update the status of participants in a course.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               courseId:
 *                 type: string
 *                 description: The ID of the course.
 *               participants:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     participantId:
 *                       type: string
 *                     status:
 *                       type: string
 *     responses:
 *       200:
 *         description: Successfully updated participant statuses.
 *       400:
 *         description: Invalid input data.
 *       500:
 *         description: Internal server error.
 */
adminRouter.put("/update/UserStatusCourse", verifyToken, AdminService.updateUserCourseStatus);

/**
 * @swagger
 * /api/Admin/Check/user/HistoryCourses/{userId}:
 *   get:
 *     summary: Check a user's course history.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user whose course history is to be checked.
 *     responses:
 *       200:
 *         description: Successfully retrieved course history.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Course'
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */
adminRouter.get("/Check/user/HistoryCourses/:userId", verifyToken, AdminService.checkUserHistory);
