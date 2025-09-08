// utils/courseUtils.ts
import { Course } from "../models/course.model";

export const getUserCourses = async (user: any) => {
  const courses = await Promise.all(
    user.courses_enrolled.map(async (enrollment: any) => {
      try {
        const course = await Course.findById(enrollment.course_id);
        if (!course) {
          console.error(`Course not found for id: ${enrollment.course_id}`);
          return null;
        }
        return {
          _id: course._id,
          title: course.title,
          thumbnail: course.thumbnail || "",
          registrationDate: enrollment.start_date,
          status: enrollment.status,
          trainingLocation: course.trainingLocation,
          statusDate:
            enrollment.status === "completed"
              ? enrollment.completion_date
              : enrollment.start_date,
        };
      } catch (error) {
        console.error(
          `Error processing course ${enrollment.course_id}:`,
          error
        );
        return null;
      }
    })
  );

  return courses.filter((course) => course !== null);
};
