import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { ObjectId } from "mongodb";
import { User } from "../models/user.model";
import { Course } from "../models/course.model";
import { sendOtpEmail } from "../utils/emailUtils";
import { transporter } from "../utils/emailUtils";
import dotenv from "dotenv"
import { Types } from 'mongoose';

dotenv.config()
// Get user course roadmap
export const getCourseRoadmap = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId)
      .populate({
        path: "courses_enrolled.course_id",
        model: "Course",
      })
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (
      !Array.isArray(user.courses_enrolled) ||
      user.courses_enrolled.length === 0
    ) {
      return res.status(200).json([]);
    }

    const currentDate = new Date();

   const registeredCoursesPromises = user.courses_enrolled.map(
     async (enrollment) => {
       // Assert that course_id is an ObjectId
       const courseId = enrollment.course_id as ObjectId;

       if (!courseId) {
         console.warn(
           `Invalid course_id for enrollment: ${JSON.stringify(enrollment)}`
         );
         return null;
       }

       try {
         const course = await Course.findById(courseId);
         if (!course) {
           console.warn(`Course not found for courseId: ${courseId}`);
           return null;
         }

         const courseStartDate = new Date(course.start_date);

         if (courseStartDate >= currentDate) {
           return {
             courseId: course._id,
             title: course.title,
             description: course.description,
             status: enrollment.status,
             progress: enrollment.progress || 0,
             start_date: courseStartDate.toISOString().split("T")[0],
             thumbnail: course.thumbnail || null,
             qr_code: course.qr_code || null,
           };
         } else {
           return null;
         }
       } catch (error) {
         console.error(
           `Error fetching course for courseId ${courseId}:`,
           error
         );
         return null;
       }
     }
   );


    let registeredCourses = (await Promise.all(registeredCoursesPromises))
      .filter((course) => course !== null) // Removes null values
      .sort(
        (a, b) =>
          new Date((a as { start_date: string }).start_date).getTime() -
          new Date((b as { start_date: string }).start_date).getTime()
      );


    res.status(200).json(registeredCourses);
  } catch (err) {
    console.error("Error fetching courses:", err);
    return res
      .status(500)
      .json({ message: "An error occurred while fetching courses" });
  }
};

// Get course QR code
export const getCourseQRCode = async (req: Request, res: Response) => {
  try {
    const courseId = req.params.courseId;
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    const qrCodeUrl = `http://localhost:3000/uploads/${course.qr_code}`;
    res.json({ qrCodeUrl });
  } catch (err) {
    console.error("Error fetching QR code:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update profile picture
export const updateProfilePicture = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const filename = req.file.filename;
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { $set: { profilePicture: filename } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found after update" });
    }

    // Construct full URL for profile picture
    const profilePictureUrl = `${filename}`;

    res.json({
      profilePictureUrl,
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("Error uploading profile picture:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update user details
export const updateUserDetails = async (req: Request, res: Response) => {
  try {
    const { name, company, email, phone, profilePicture } = req.body;
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name || user.name;
    user.company = company || user.company;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.profilePicture = profilePicture || user.profilePicture;

    await user.save();

    res.json(user);
  } catch (error: any) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Change password
export const changePassword = async (req: Request, res: Response) => {
  const { userId, oldPassword, newPassword } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid old password" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating password" });
  }
};

// Cancel enrollment in a course
export const cancelEnrollment = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const userId = req.userId;

    if (!userId || !courseId) {
      return res
        .status(400)
        .json({ message: "User ID and course ID are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const enrollmentIndex = user.courses_enrolled.findIndex(
      (enrollment) => enrollment.course_id?.toString() === courseId
    );

    if (enrollmentIndex === -1) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    user.courses_enrolled.splice(enrollmentIndex, 1);
    await user.save();

    res.json({
      message: "Course enrollment cancelled successfully",
      currentEnrollments: await User.countDocuments({
        "courses_enrolled.course_id": courseId,
      }),
    });
  } catch (error) {
    console.error("Error cancelling enrollment:", error);
    res
      .status(500)
      .json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
  }
};

// Check course enrollment status
export const checkEnrollmentStatus = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const userId = req.userId;

    if (!userId || !courseId) {
      return res
        .status(400)
        .json({ message: "User ID and course ID are required" });
    }

    const user = await User.findById(userId);
    const course = await Course.findById(courseId);

    if (!user || !course) {
      return res.status(404).json({ message: "User or Course not found" });
    }

    const isEnrolled = user.courses_enrolled.some(
      (enrollment) => enrollment.course_id?.toString() === courseId
    );

    const currentEnrollments = await User.countDocuments({
      "courses_enrolled.course_id": courseId
    });

    res.json({ 
      isEnrolled, 
      currentEnrollments,
      courseStatus: isEnrolled ? user.courses_enrolled.find(
        enrollment => enrollment.course_id?.toString() === courseId
      )?.status : null
    });
  } catch (error) {
    console.error("Error checking enrollment status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
// Get user profile
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get user history of courses
export const getUserHistoryCourses = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId)
      .populate({
        path: "courses_enrolled.course_id",
        model: "Course",
      })
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const historyCourses = user.courses_enrolled.map((enrollment) => {
      const course = enrollment.course_id as any;
      
      // Ensure we have a course before processing
      if (!course) {
        console.warn(`No course found for enrollment: ${JSON.stringify(enrollment)}`);
        return null;
      }

      return {
        ...course,
        status: enrollment.status || 'ongoing',
        registrationDate: enrollment.start_date || course.start_date,
        statusDate: enrollment.completion_date || null
      };
    }).filter(course => course !== null); // Remove any null entries

    res.status(200).json(historyCourses);
  } catch (err) {
    console.error("Error fetching user course history:", err);
    res.status(500).json({ 
      message: "Internal server error", 
      error: err instanceof Error ? err.message : 'Unknown error'
    });
  }
};

// Register for course
export const registerForCourse = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // ตรวจสอบการลงทะเบียนคอร์สที่มี start date ตรงกัน
    const existingEnrollments = await User.findOne({
      _id: userId,
      "courses_enrolled.course_id": { $exists: true }
    });

    if (existingEnrollments) {
      // ดึงคอร์สที่ user ลงทะเบียนแล้ว
      const conflictingCourse = await Course.findOne({
        _id: { $in: existingEnrollments.courses_enrolled.map(e => e.course_id) },
        start_date: course.start_date
      });

      if (conflictingCourse) {
        return res.status(400).json({ 
          message:"ไม่สามารถลงทะเบียนได้ - มีคอร์สวันชนกัน",
          conflictingCourseTitle: conflictingCourse.title
        });
      }
    }

    // เพิ่มการลงทะเบียนหากไม่มีคอร์สที่ start date ตรงกัน
    user.courses_enrolled.push({
      course_id: course._id as Types.ObjectId, 
      status: "ongoing",
      progress: 0,
      start_date: new Date(),
      completion_date: null,
    });

    await user.save();

    res.status(200).json({ 
      message: "Successfully registered for course" 
    });
  } catch (error) {
    console.error("Error registering for course:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// export const registerForCourse = async (req: Request, res: Response) => {
//   try {
//     const { courseId } = req.params;
//     const userId = req.userId;

//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const course = (await Course.findById(courseId)) as { _id: ObjectId }; // Ensure it's typed as ObjectId
//     if (!course) {
//       return res.status(404).json({ message: "Course not found" });
//     }

//     user.courses_enrolled.push({
//       course_id: course._id, // This should now be properly typed as ObjectId
//       status: "ongoing",
//       progress: 0,
//       start_date: new Date(),
//       completion_date: null,
//     });

//     await user.save();

//     res.status(200).json({ message: "Successfully registered for course" });
//   } catch (error) {
//     console.error("Error registering for course:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

export const requestOtp = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;

    // Validate input
    if (!email || typeof email !== "string") {
      res.status(400).json({ error: "Invalid or missing email address" });
      return; // Ensure no further execution
    }

    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return; // Ensure no further execution
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const otpExpiration = Date.now() + 5 * 60 * 1000; // 5 minutes expiration

    // Update user with OTP
    user.otp = otp;
    user.otpExpiration = otpExpiration;
    await user.save();

    // Send OTP via email
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is: ${otp}. It expires in 5 minutes.`,
    });

    res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("Error in requestOtp:", error);
    res.status(500).json({ error: "An error occurred while requesting OTP" });
  }
};



export const resetPassword = async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.otp !== otp || Date.now() > (user.otpExpiration || 0)) {
      return res.status(401).json({ message: "Invalid or expired OTP" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.otp = null;
    user.otpExpiration = null;
    await user.save();

    return res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select("-password"); // Exclude the password field
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const checkUserHeader = async (req: any, res: Response) => {
  try {
    // Find the user by ID from the token
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Construct the full URL for profile picture
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const userResponse = {
      ...user.toObject(),
      profilePicture: user.profilePicture
        ? `${baseUrl}${user.profilePicture}`
        : null, // If profile picture exists, return full URL
    };

    res.json(userResponse); // Return the user data with profile picture URL
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const checkUserCourses = async (req: any, res: Response) => {
try {
    const userId = req.params.userId;
    const user = await User.findById(userId).populate('courses_enrolled.course_id');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userCourses = await Promise.all(user.courses_enrolled.map(async (enrollment) => {
      try {
        const userId = req.params.userId;
        console.log('Received user ID:', userId);
        const course = await Course.findById(enrollment.course_id);
        if (!course) {
          console.error(`Course not found for id: ${enrollment.course_id}`);
          return null;
        }
        return {
          _id: course._id,
          title: course.title,
          thumbnail: course.thumbnail,
          registrationDate: enrollment.start_date,
          status: enrollment.status,
          trainingLocation: course.trainingLocation,
          statusDate: enrollment.status === 'completed' ? enrollment.completion_date : enrollment.start_date
        };
      } catch (error) {
        console.error(`Error processing course ${enrollment.course_id}:`, error);
        return null;
      }
    }));

    const validUserCourses = userCourses.filter(course => course !== null);

    res.json(validUserCourses);
  } catch (error) {
    console.error('Error fetching user courses:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUserProfilePicture = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    
    // Find the user by ID
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Ensure clean profile picture path
    let profilePicturePath = null;
    if (user.profilePicture) {
      // Remove any leading slashes and ensure it's a clean filename
      profilePicturePath = user.profilePicture.replace(/^\/+/, '');
    }

    res.json({ 
      profilePicture: profilePicturePath 
    });
  } catch (error) {
    console.error("Error fetching user profile picture:", error);
    res.status(500).json({ message: "Server error" });
  }
};