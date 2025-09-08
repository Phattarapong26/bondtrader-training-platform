import { Router } from "express";
import adminRouter from "./admin.route";
import userRouter from "./user.route";
import superAdminRouter from "./superadmin.route";
import authRouter from "./auth.route"; // Added auth route
import courseRouter from "./course.route"; // Added course route
import dateRouter from "./date.route"; // Added date route

const router = Router();

// Combine routes for all roles
router.use("/Admin", adminRouter);
router.use("/User", userRouter);
router.use("/SuperAdmin", superAdminRouter);

// Add new routes
router.use("", authRouter); // Auth routes
router.use("", courseRouter); // Course routes
router.use("", dateRouter); // Date routes


export default router;
