import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CourseCard from './MulitCourseCard';
import { FaSearch } from 'react-icons/fa';

interface Course {
  _id: string;
  title: string;
  description: string;
  duration_hours: number;
  date: string;
  start_date: string;
  thumbnail: string;
}

const MultiJobbersSection: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/courses');
        if (Array.isArray(response.data)) {
          setCourses(response.data);
        } else {
          console.error('Invalid API response:', response.data);
          throw new Error('Invalid API response');
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };
    fetchCourses();
  }, []);

  const handleCourseClick = (courseId: string) => {
    navigate(`/AboutCourse/${courseId}`);
  };

  const isValidCourse = (startDate: string) => {
    const courseDate = new Date(startDate);
    const today = new Date();
    courseDate.setDate(courseDate.getDate() + 1);
    return today <= courseDate;
  };


  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
    isValidCourse(course.start_date)
  );

  return (
    <div id="multi-jobbers-container" className="mx-auto px-4 ">
      <div id="multi-jobbers-header" className='flex items-center justify-start space-x-4 border-b'>
        <h1 id="multi-jobbers-title" className="text-2xl font-bold text-center my-8 text-gray-500">หลักสูตร Multi-Jobbers</h1>
        <div id="search-container" className="relative max-w-md mx-auto">
          <input
            id="course-search-input"
            type="text"
            placeholder="ค้นหาคอร์ส..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-xl pr-10"
          />
          <FaSearch id="search-icon" className="absolute right-3 top-3 text-gray-400" />
        </div>
      </div>
      {filteredCourses.length === 0 ? (
        <div id="no-courses-message" className="text-center text-gray-500 my-8 ">
          ไม่พบคอร์สที่คุณค้นหา
        </div>
      ) : (
        <div id="courses-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-3  pt-3">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              onClick={() => handleCourseClick(course._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiJobbersSection;
