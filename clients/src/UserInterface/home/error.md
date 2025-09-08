"Fix the database logic and the React component functionality in the following code, but make sure not to change anything outside of these two areas.
* **Code**: [
* [import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Course } from './UserHomepage';

interface MultiJobbersSectionProps {
  courses: Course[];
}

const MultiJobbersSection: React.FC<MultiJobbersSectionProps> = ({ courses }) => {
  const navigate = useNavigate();

  const handleCourseClick = (courseId: number) => {
    navigate(`/course/${courseId}`);
  };

  return (
    <section className="mb-6 ">
      <h2 className="text-2xl font-bold mb-4 border-b border-b-gray-200 pb-5">หลักสูตร Multi-Jobbers</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {courses.map((course) => (
          <div 
            key={course.id} 
            className="bg-white rounded-lg shadow-md p-4 cursor-pointer w-[400px]"
            onClick={() => handleCourseClick(course.id)}
          >
            <img src={course.image} alt={course.title} className="w-full h-40 object-cover rounded-t-lg" />
            <h3 className="text-lg font-semibold mt-2">{course.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-3">{course.description}</p>
            <p className="text-sm text-gray-500 mt-2">ระยะเวลา: {course.duration}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default MultiJobbersSection;],[import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Course } from './UserHomepage';
import CourseCard from './CourseCard';

interface CourseSliderProps {
  courses: Course[];
}

const CourseSlider: React.FC<CourseSliderProps> = ({ courses }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => Math.min(prevIndex + 1, courses.length - 5));
  };

  const handleCourseClick = (courseId: number) => {
    navigate(`/course/${courseId}`);
  };

  const visibleCourses = courses.slice(currentIndex, currentIndex + 5);

  return (
    <section className="mb-6">
      <h2 className="text-2xl font-bold mb-4 border-b border-b-gray-200 pb-5">Your Course Roadmap</h2>
      <div className="relative">
        <div className="flex space-x-4 overflow-hidden">
          {visibleCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onClick={() => handleCourseClick(course.id)}
            />
          ))}
        </div>
        <button
          onClick={prevSlide}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-200 p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={currentIndex === 0}
        >
          <i className="fas fa-chevron-left"></i>
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-200 p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={currentIndex >= courses.length - 5}
        >
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>
    </section>
  );
};

export default CourseSlider;],[import React from 'react';
import { Course } from './UserHomepage';

interface CourseCardProps {
  course: Course;
  onClick: () => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onClick }) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-md p-4 cursor-pointer w-64 flex-shrink-0"
      onClick={onClick}
    >
      <img src={course.image} alt={course.title} className="w-full h-40 object-cover rounded-t-lg" />
      <h3 className="text-lg font-semibold mt-2">{course.title}</h3>
      <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
      <p className="text-sm text-gray-500 mt-2">ระยะเวลา: {course.duration}</p>
    </div>
  );
};

export default CourseCard;]
* ]

* **Expected Outcome**: [MultiJobbersSection.tsx จะดึงข้อมูล course ทั้งหมดในฐานข้อมูลมาแสดง , CourseSlider.tsx จะดึงข้อมูล course 6 ชุดจากฐานข้อมูลมาแสดง โดยจะแสดงแค่ข้อมูลที่เป็นวันที่ที่ยังไม่ถึงที่คอร์สจะเริ่ม หากวันที่เลยมาแล้วจะไม่แสดงในนี้จะเรียงใหม่เรื่อยๆจาก"start_date"ปัจจุบันไปยังอนาคตเท่านั้น . เมื่อผู้ใช้คลิ๊ก card course นั้นๆในMultiJobbersSection.tsxหรือ CourseSlider.tsx จะพาผู้ใช้ไปยัง AboutCourse ที่จะแสดงข้อมูล Course ที่ผู้ใช้คลิ๊ก]
Correct the errors related to:
1. The database operations (CRUD or connection issues).
2. The component rendering or state management problems.
Please explain the changes made, but do not alter any part of the code that isn't involved with these two issues."