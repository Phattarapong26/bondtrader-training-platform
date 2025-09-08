import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware";
import * as userService from "../services/user.service"; // Import service functions
import upload from '../middleware/upload.middleware';

const userRouter = Router();

userRouter.get(
  "/CourseRoadmap",
  verifyToken,
  userService.getCourseRoadmap
);
userRouter.get(
  "/course-qr/:courseId",
  verifyToken,
  userService.getCourseQRCode
);

userRouter.post(
  "/update/profile",
  verifyToken,
  upload.single('profilePicture'),  // Use multer middleware to handle file upload
  userService.updateProfilePicture
);
userRouter.put(
  "/updateDetail",
  verifyToken,
  userService.updateUserDetails
);
userRouter.post("/change-password", userService.changePassword);
userRouter.delete(
  "/cancel-enrollment/:courseId",
  verifyToken,
  userService.cancelEnrollment
);
userRouter.get(
  "/check/enrollment-status/:courseId",
  verifyToken,
  userService.checkEnrollmentStatus
);
userRouter.get(
  "/check/checkUserCourses/:userId",
  verifyToken,
  userService.checkUserCourses
);

userRouter.get("", verifyToken, userService.getUserProfile);
userRouter.get(
  "/check/HistoryCourse/:userId",
  verifyToken,
  userService.getUserHistoryCourses
);
userRouter.post(
  "/RegisterCourses/:courseId/enroll",
  verifyToken,
  userService.registerForCourse
);

userRouter.get('/profile-picture/:userId', verifyToken, userService.getUserProfilePicture);

userRouter.get("/users", verifyToken, 
userService.getUsers);
userRouter.get("/CheckUserHeader/verify",verifyToken,userService.checkUserHeader);
userRouter.post("/forgetpassword/request-otp", userService.requestOtp);
userRouter.post("/forgetpassword/reset-password", userService.resetPassword);

export default userRouter;

/**
 * @swagger
 * /user/CourseRoadmap:
 *   get:
 *     summary: Get the user's course roadmap
 *     description: Fetches the roadmap for the courses the user is enrolled in.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched the user's course roadmap
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   courseId:
 *                     type: string
 *                     description: The ID of the course
 *                   title:
 *                     type: string
 *                     description: Title of the course
 *                   description:
 *                     type: string
 *                     description: Short description of the course
 *                   status:
 *                     type: string
 *                     description: Enrollment status (e.g., "Enrolled", "Completed")
 *                   progress:
 *                     type: number
 *                     description: User's progress in the course (0-100)
 *       400:
 *         description: User ID is required
 *       404:
 *         description: User not found
 */
/**
 * @swagger
 * /user/course-qr/{courseId}:
 *   get:
 *     summary: Get the QR code for a specific course
 *     description: Returns the QR code for the course that the user is enrolled in.
 *     tags:
 *       - User
 *     parameters:
 *       - name: courseId
 *         in: path
 *         required: true
 *         description: The ID of the course
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched course QR code
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 qr_code:
 *                   type: string
 *                   description: URL of the course QR code
 *       400:
 *         description: Invalid course ID or user is not enrolled
 *       404:
 *         description: Course not found
 */
/**
 * @swagger
 * /user/update/profile:
 *   post:
 *     summary: Update user profile picture
 *     description: Allows the user to update their profile picture.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *                 description: The new profile picture image file
 *     responses:
 *       200:
 *         description: Successfully updated the profile picture
 *       400:
 *         description: Invalid file format or update failed
 */
/**
 * @swagger
 * /user/updateDetail:
 *   put:
 *     summary: Update user details
 *     description: Allows the user to update their personal details (name, email, etc.).
 *     tags:
 *       - User
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
 *                 description: The user's full name
 *               email:
 *                 type: string
 *                 description: The user's email address
 *     responses:
 *       200:
 *         description: Successfully updated user details
 *       400:
 *         description: Invalid input or update failed
 */
/**
 * @swagger
 * /user/change-password:
 *   post:
 *     summary: Change the user's password
 *     description: Allows the user to change their password.
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 description: The current password of the user
 *               newPassword:
 *                 type: string
 *                 description: The new password for the user
 *     responses:
 *       200:
 *         description: Password successfully changed
 *       400:
 *         description: Invalid password format or incorrect old password
 */
/**
 * @swagger
 * /user/cancel-enrollment/{courseId}:
 *   delete:
 *     summary: Cancel course enrollment
 *     description: Allows the user to cancel enrollment in a specific course.
 *     tags:
 *       - User
 *     parameters:
 *       - name: courseId
 *         in: path
 *         required: true
 *         description: The ID of the course to cancel enrollment for
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully canceled course enrollment
 *       400:
 *         description: Invalid course ID or user not found
 *       404:
 *         description: Course not found
 */
/**
 * @swagger
 * /user/check/enrollment-status/{courseId}:
 *   get:
 *     summary: Check the user's enrollment status for a course
 *     description: Returns the current enrollment status of the user for a specific course.
 *     tags:
 *       - User
 *     parameters:
 *       - name: courseId
 *         in: path
 *         required: true
 *         description: The ID of the course
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched enrollment status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   description: User's enrollment status (e.g., "Enrolled", "Not Enrolled")
 *       400:
 *         description: Invalid course ID or user not found
 *       404:
 *         description: Course not found
 */
/**
 * @swagger
 * /user/check/checkUserCourses/{userId}:
 *   get:
 *     summary: Check the courses a user is enrolled in
 *     description: Returns a list of courses the user is enrolled in.
 *     tags:
 *       - User
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: The ID of the user to check courses for
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched user courses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   courseId:
 *                     type: string
 *                     description: The ID of the course
 *                   title:
 *                     type: string
 *                     description: Title of the course
 *                   enrollmentStatus:
 *                     type: string
 *                     description: Enrollment status of the user in the course
 *       400:
 *         description: User ID is required
 *       404:
 *         description: User not found
 */
/**
 * @swagger
 * /user/check/HistoryCourse/{userId}:
 *   get:
 *     summary: Get a user's course history
 *     description: Returns a history of courses a user has enrolled in.
 *     tags:
 *       - User
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: User ID to fetch the course history for
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of courses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Course'
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
/**
 * @swagger
 * /user/RegisterCourses/{courseId}/enroll:
 *   post:
 *     summary: Enroll in a course
 *     description: Registers a user for a specific course.
 *     tags:
 *       - User
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         description: Course ID to enroll the user in
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully registered for the course
 *       400:
 *         description: Course or user not found or registration conflict exists
 *       500:
 *         description: Internal server error
 */
/**
 * @swagger
 * /user/users:
 *   get:
 *     summary: Get all users
 *     description: Fetches all users in the system.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: An array of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Internal server error
 */
/**
 * @swagger
 * /user/CheckUserHeader/verify:
 *   get:
 *     summary: Verify user header
 *     description: Verifies the user's session and returns user data along with the profile header information.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User data with profile picture URL
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
/**
 * @swagger
 * /user/forgetpassword/request-otp:
 *   post:
 *     summary: Request OTP for password reset
 *     description: Sends an OTP to the user's email for password reset purposes.
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email to send OTP
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Invalid email
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
/**
 * @swagger
 * /user/forgetpassword/reset-password:
 *   post:
 *     summary: Reset password using OTP
 *     description: Resets the user's password using an OTP.
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       401:
 *         description: Invalid or expired OTP
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
