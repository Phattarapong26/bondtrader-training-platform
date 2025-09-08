import { Request, Response } from "express";
import { Course } from "../models/course.model";
import { User } from "../models/user.model";

export const getCourseById = async (req: Request, res: Response) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json(course);
  } catch (err) {
    console.error("Error fetching course:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllCourses = async (req: Request, res: Response) => {
  try {
    const courses = await Course.find();
    res.json(courses); // Return the list of courses
  } catch (err) {
    console.error("Error fetching courses:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};