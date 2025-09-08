import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {  faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import { useAuth } from '../../hooks/useAuth';
import Sidebar from '../../Components/SidebarUser';
import Header from '../../Components/Head';

interface CourseDetails {
  _id: string;
  title: string;
  description: string;
  details: string;
  duration_hours: number;
  max_seats: number;
  start_date: string;
  thumbnail: string;
  video: string;
  qr_code: string;
}

interface Course {
  courseId: string;
  course_id: CourseDetails;
  status: string;
  start_date: string;
  completion_date: string | null;
  thumbnail: string;
  title: string;
  description: string;
}
const ITEMS_PER_PAGE = 6;

const CourseRoadUser: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isAuthenticated, isLoading, token } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  const toggleDropdown = () => setDropdownOpen(prev => !prev);

  useEffect(() => {
    const fetchCourses = async () => {
      if (isLoading) return;

      if (!isAuthenticated) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get<Course[]>(
          "http://localhost:3000/api/user/CourseRoadmap",
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );

        const currentDate = new Date();
        const upcomingCourses = response.data
          .filter(course => new Date(course.start_date) >= currentDate)
          .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
          .map(course => ({
            ...course,
            start_date: new Date(course.start_date).toISOString().split('T')[0], 
          }));

        setCourses(upcomingCourses);
        setFilteredCourses(upcomingCourses);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to fetch courses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [isAuthenticated, isLoading, token]);

  const formatDescription = (description: string, maxLength: number = 80) => {
    // จำกัดความยาวคำอธิบายไม่เกิน 50 ตัวอักษร
    if (description.length > 130) {
      description = description.slice(0, 130) + '...';
    }
  
    const words = description.split(' ');
    const lines: string[] = [];
    let currentLine = '';
  
    words.forEach(word => {
      if ((currentLine + word).length > maxLength) {
        lines.push(currentLine.trim());
        currentLine = '';
      }
      currentLine += word + ' ';
    });
  
    if (currentLine) {
      lines.push(currentLine.trim());
    }
  
    return lines;
  };
  

  // ในส่วนของการดึง QR code
  const handleStartCourse = async (courseId: string) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/courses/${courseId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const course = response.data;
      const qrCodeUrl = `http://localhost:3000/uploads/${course.qr_code}`;
      Swal.fire({
        title: 'QR Code to Start Course',
        imageUrl: qrCodeUrl,
        imageWidth: 300,
        imageHeight: 300,
        imageAlt: 'Course QR Code',
      });
    } catch (error) {
      console.error('Error fetching QR code:', error);
      Swal.fire('Error', 'Failed to load QR code. Please try again.', 'error');
    }
  };

  const totalPages = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE);

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const toggleProfile = () => {
    // Functionality for toggling the profile (to be implemented)
  };
  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;

  return (
    <div id="course-road-container" className="flex h-screen overflow-hidden bg-gray-100">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <main id="course-road-main" className="flex-1">
        <Header
          toggleDropdown={toggleDropdown}
          dropdownOpen={dropdownOpen}
        />
        <div id="course-road-content" className="w-full mx-auto ml-2 bg-white rounded-lg p-5 h-full mt-2">
          <div id="course-road-card" className="mx-auto p-4 bg-white shadow-md rounded-lg mr-5 h-full">
            <h1 id="course-road-title" className="text-2xl font-bold mb-4 text-gray-500">Course Road Map</h1>
            <hr id="course-road-divider" className="border-t-2 border-green-500 mb-4 " />
            {paginatedCourses.map((course, index) => (
              <div id={`course-item-${index}`} key={index} className="flex items-center justify-between mb-4">
                <div id={`course-info-${index}`} className="flex items-center">
                  {/* Check if the course has a thumbnail */}
                  {course.thumbnail ? (
                    <img
                      id={`course-thumbnail-${index}`}
                      src={`http://localhost:3000/uploads/${course.thumbnail}`}
                      alt={course.title}
                      className="w-32 h-20 object-cover rounded-lg mr-4"
                    />
                  ) : (
                    <div id={`course-no-image-${index}`} className="w-32 h-20 bg-gray-200 rounded-lg mr-4 flex items-center justify-center">
                      <span id={`no-image-text-${index}`} className="text-gray-500">No Image</span>
                    </div>
                  )}
                  <div id={`course-details-${index}`}>
                    <h3 id={`course-title-${index}`} className="text-lg font-semibold">{course.title}</h3>
                    <div id={`course-description-${index}`} className="text-gray-700">
                      {formatDescription(course.description).map((line, i) => (
                        <p id={`description-line-${index}-${i}`} key={i}>{line}</p>
                      ))}
                    </div>

                    <p id={`course-start-date-${index}`} className="text-gray-500">
                      Start Date: {course.start_date}
                    </p>
                  </div>
                </div>
                <button
                  id={`start-course-btn-${index}`}
                  className="bg-yellow-500 text-white px-4 py-2 rounded-lg"
                  onClick={() => handleStartCourse(course.courseId)}
                >
                  Start Course
                </button>
              </div>
            ))}


            <p id="course-count" className="text-gray-700">Total {filteredCourses.length} courses</p>
            <div id="pagination-controls" className="flex justify-between items-center mt-4">
              <p id="page-info" className="text-gray-600">Page {currentPage} of {totalPages}</p>
              <div id="pagination-buttons" className="flex">
                <button
                  id="prev-page-btn"
                  className="bg-white border border-gray-300 text-gray-700 px-3 py-1 rounded-lg mr-2"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                <button
                  id="next-page-btn"
                  className="bg-white border border-gray-300 text-gray-700 px-3 py-1 rounded-lg"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CourseRoadUser;
