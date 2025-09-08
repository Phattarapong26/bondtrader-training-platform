import { Request, Response } from "express";
import path from "path";
import { ObjectId } from "mongodb";
import { User } from "../models/user.model";
import { Course, ICourse } from "../models/course.model";
import { Admin } from "../models/admin.model";
import { getUserCourses } from "../utils/courseUtils";

// Fetch all users
export const getUsers = async (req: Request, res: Response) => {
  try {
    const customers = await User.find().select("-password");
    res.status(200).json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ message: "Error fetching customers" });
  }
};

// Add a new course
export const addNewCourse = async (req: Request, res: Response) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const {
      title,
      description,
      details,
      trainingLocation,
      duration_hours,
      max_seats,
      start_date,
    } = req.body;

    if (!files.thumbnail || !files.video || !files.qr_code) {
      return res
        .status(400)
        .json({ error: "Both thumbnail and video are required" });
    }

    const newCourse = new Course({
      title,
      description,
      details,
      trainingLocation,
      duration_hours: Number(duration_hours),
      max_seats: Number(max_seats),
      start_date,
      thumbnail: path.basename(files.thumbnail[0].path),
      video: path.basename(files.video[0].path),
      qr_code: path.basename(files.qr_code[0].path),
    });

    await newCourse.save();
    res.status(201).json(newCourse);
  } catch (err) {
    console.error("Error creating course:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update course details
export const updateCourseDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const {
      title,
      description,
      details,
      trainingLocation,
      duration_hours,
      max_seats,
      start_date,
    } = req.body;

    const updateData: Partial<ICourse> = {
      title,
      description,
      details,
      trainingLocation,
      duration_hours: Number(duration_hours),
      max_seats: Number(max_seats),
      start_date,
    };

    if (files.thumbnail) {
      updateData.thumbnail = path.basename(files.thumbnail[0].path);
    }
    if (files.video) {
      updateData.video = path.basename(files.video[0].path);
    }
    if (files.qr_code) {
      updateData.qr_code = path.basename(files.qr_code[0].path);
    }

    const updatedCourse = await Course.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedCourse) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.json(updatedCourse);
  } catch (err) {
    console.error("Error updating course:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete a course
export const deleteCourse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedCourse = await Course.findByIdAndDelete(id);

    if (!deletedCourse) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.json({ message: "Course deleted successfully" });
  } catch (err) {
    console.error("Error deleting course:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update Admin Profile
export const updateAdminProfile = async (req: Request, res: Response) => {
  try {
    const { name, idCard, employeeId, phone, email } = req.body;

    const admin = await Admin.findById(req.userId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    admin.name = name || admin.name;
    admin.idCard = idCard || admin.idCard;
    admin.employeeId = employeeId || admin.employeeId;
    admin.phone = phone || admin.phone;
    admin.email = email || admin.email;

    await admin.save();

    const updatedAdmin = await Admin.findById(req.userId).select("-password");
    res.json(updatedAdmin);
  } catch (error) {
    console.error("Error updating admin profile:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Check participants enrolled in a course
export const checkParticipants = async (req: Request, res: Response) => {
  const { courseId } = req.params;
  console.log("Received courseId:", courseId);

  try {
    let courseObjectId;
    if (ObjectId.isValid(courseId)) {
      courseObjectId = new ObjectId(courseId);
    } else {
      console.error("Invalid courseId format:", courseId);
      return res.status(400).json({ error: "Invalid course ID format" });
    }

    console.log("Querying for courseObjectId:", courseObjectId);

    const users = await User.find({
      "courses_enrolled.course_id": courseObjectId,
    }).select("_id name courses_enrolled.$");

    console.log("Found users:", users);

    const participants = users.map((user) => ({
      _id: user.id.toString(),
      name: user.name,
      status: user.courses_enrolled[0].status, // Assuming the first (and only) element is the relevant course
    }));

    res.json(participants);
  } catch (error: any) {
    console.error("Error fetching participants:", error);
    res
      .status(500)
      .json({ error: "Error fetching participants", details: error.message });
  }
};

// Update user status and end date
export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update all fields
    Object.assign(user, req.body);

    await user.save();
    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update user status for a course
export const updateUserCourseStatus = async (req: Request, res: Response) => {
  const { participants, courseId } = req.body;
  console.log("Received update request:", { participants, courseId });

  try {
    if (
      !Array.isArray(participants) ||
      participants.length === 0 ||
      !courseId
    ) {
      return res.status(400).json({
        error: "Invalid input. Participants array and courseId are required.",
      });
    }

    const courseObjectId = new ObjectId(courseId);
    const updatePromises = participants.map(async (participant) => {
      const { participantId, status } = participant;
      if (!participantId || !status) {
        console.error("Invalid participant data:", participant);
        throw new Error("Participant ID and status are required");
      }

      const participantObjectId = new ObjectId(participantId);
      const user = await User.findOne({ _id: participantObjectId });
      if (!user) {
        console.error("User not found:", participantId);
        throw new Error("User not found");
      }

      // Update course status
      const courseIndex = user.courses_enrolled.findIndex(
        (course) => course.course_id.toString() === courseObjectId.toString()
      );
      if (courseIndex === -1) {
        console.error("Course not enrolled:", courseId);
        throw new Error("Course not enrolled");
      }

      user.courses_enrolled[courseIndex].status = status;
      user.courses_enrolled[courseIndex].completion_date =
        status === "completed" ? new Date() : null;

      // Update bond status
      if (status === "completed") {
        if (user.bond_status.status === "inactive") {
          // First completed course - set active and add 2 years
          user.bond_status.status = "active";
          user.bond_status.start_date = new Date();
          user.bond_status.end_date = new Date();
          user.bond_status.end_date.setFullYear(
            user.bond_status.end_date.getFullYear() + 2
          );
        } else if (user.bond_status.status === "active") {
          // Already active - add 1 year to existing end date
          if (user.bond_status.end_date) {
            const newEndDate = new Date(user.bond_status.end_date);
            newEndDate.setFullYear(newEndDate.getFullYear() + 1);
            user.bond_status.end_date = newEndDate;
          }
        }
      }

      const updatedUser = await User.findOneAndUpdate(
        { _id: participantObjectId },
        { $set: user },
        { new: true }
      );
      return updatedUser;
    });

    const updatedUsers = await Promise.all(updatePromises);
    console.log("Updated users:", updatedUsers);
    res.json({
      message: "Participant statuses updated successfully",
      updatedUsers,
    });
  } catch (error: any) {
    console.error("Error updating status:", error);
    res.status(500).json({
      error: "Error updating participant status",
      details: error.message,
    });
  }
};

// Check user course history
export const checkUserHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    console.log("Fetching courses for userId:", userId);

    const user = await User.findById(userId);
    if (!user) {
      console.log("User not found for userId:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    const courses = await getUserCourses(user);
    res.json(courses);
  } catch (error: any) {
    console.error("Error fetching user courses:", error);
    res
      .status(500)
      .json({ message: "Internal server error", details: error.message });
  }
};

// Verify admin token in headers
export const verifyTokenHeader = async (req: Request, res: Response) => {
  try {
    const admin = await Admin.findById(req.userId).select("-password");
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// routes/admin.ts
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user details' });
  }
};

