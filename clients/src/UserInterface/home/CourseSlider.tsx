// CourseSlider.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CourseCard from './CourseCard';
import { getToken } from '../../hooks/tokenStorage';

interface Course {
  _id: string;
  title: string;
  description: string;
  duration_hours: number;
  date: string;
  start_date: string;
  thumbnail: string;
}

interface CourseCardProps {
  course: Course;
  onClick: () => void;
  isOutOfDate: boolean;
}

const CourseSlider: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const token = getToken();
        const response = await axios.get<Course[]>("http://localhost:3000/api/courses", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        const currentDate = new Date();
        const upcomingCourses = response.data
          .filter(course => new Date(course.start_date) >= currentDate)
          .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
          .map(course => ({
            ...course,
            start_date: new Date(course.start_date).toISOString().split('T')[0],
            thumbnail: course.thumbnail,
          }));
        
        setCourses(upcomingCourses);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setError('Failed to fetch courses. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCourses();
  }, []);
  

  const handleCourseClick = (courseId: string) => {
    navigate(`/AboutCourse/${courseId}`);
  };

  const isOutOfDate = (courseDate: string) => {
    const today = new Date();
    const courseEndDate = new Date(courseDate);
    return today > courseEndDate;
  };

  if (isLoading) return <div id="loading-message">Loading courses...</div>;
  if (error) return <div id="error-message">{error}</div>;
  if (courses.length === 0) return <div id="no-courses-message">No upcoming courses available.</div>;

  return (
    <div id="course-slider-container" className="p-4">
      <h2 id="course-slider-title" className="text-2xl font-bold mb-4 text-gray-500">ตารางการจัดอบรม</h2>
      <div
        id="course-slider-grid"
        className="grid-container mt-[25px] border-t border-gray-200 pt-3 relative overflow-x-auto pb-6"
        ref={sliderRef}
        style={{ whiteSpace: 'nowrap' }}
      >
        <div id="course-slider-content" className="flex space-x-4">
          {courses.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              onClick={() => handleCourseClick(course._id)}
              isOutOfDate={isOutOfDate(course.date)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseSlider;
