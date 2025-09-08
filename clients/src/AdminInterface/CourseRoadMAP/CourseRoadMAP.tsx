import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import CheckName from './checkName';
import Sidebar from '../../Components/Sidebar';
import HeaderAdmin from '../dashboard/HeadAdmin';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../../hooks/tokenStorage';

interface Course {
  _id: string;
  title: string;
  description: string;
  duration_hours: number;
  start_date: string;
  thumbnail: string;
  status?: string;
}

const ITEMS_PER_PAGE = 4;

const CourseRoadMap: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [showCheckName, setShowCheckName] = useState<boolean>(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleDropdown = () => {
    setDropdownOpen(prev => !prev);
  };
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const token = getToken();
        if (!token) {
          setError('Token not found. Please login again.');
          setLoading(false);
          return;
        }
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
            status: `จะจัดขึ้นในวันที่ (${new Date(course.start_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })})`,
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
  }, []);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = courses.filter(course =>
      course.title.toLowerCase().includes(term) ||
      course._id.toLowerCase().includes(term)
    );
    setFilteredCourses(filtered);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleShowCheckName = (course: Course) => {
    setSelectedCourse(course);
    setShowCheckName(true);
  };

  const handleCloseCheckName = () => {
    setShowCheckName(false);
    setSelectedCourse(null);
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

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;

  return (
    <div id="course-roadmap-container" className="flex h-screen overflow-hidden bg-gray-100">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <main id="main-content" className="flex-1 ">
        <HeaderAdmin
          toggleDropdown={toggleDropdown}
          dropdownOpen={dropdownOpen}
        />
        <div id="content-wrapper" className="w-full mx-auto ml-2 bg-white rounded-lg p-5 h-full mt-2">
          <div id="course-list-container" className="mx-auto p-4 bg-white shadow-md rounded-lg mr-5 h-full">
            <h1 id="page-title" className="text-3xl font-bold mb-4">Course Road map</h1>
            <h2 id="section-title" className="text-xl font-semibold mb-4">ตารางการอบรม</h2>
            <div id="search-container" className="relative mb-6">
              <input
                id="course-search"
                type="text"
                placeholder="ค้นหาหลักสูตรของฉัน"
                value={searchTerm}
                onChange={handleSearch}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
              <FontAwesomeIcon id="search-icon" icon={faSyncAlt} className="absolute right-3 top-3 text-gray-500" />
            </div>
            <hr id="divider" className="border-t-2 border-green-500 mb-4" />
            {paginatedCourses.map((course, index) => (
              <div id={`course-item-${course._id}`} key={index} className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <img
                    id={`course-image-${course._id}`}
                    src={`http://localhost:3000/uploads/${course.thumbnail}`}
                    alt={`Course ${index + 1}`}
                    className="w-32 h-20 object-cover rounded-lg mr-4"
                  />
                  <div>
                    <p id={`course-title-${course._id}`} className="text-gray-700 font-bold">{course.title}</p>
                    <p id={`course-date-${course._id}`} className="text-gray-500">วันลงทะเบียน: {new Date(course.start_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p id={`course-status-${course._id}`} className="text-green-500">Date: {course.status}</p>
                  </div>
                </div>
                <button 
                  id={`view-participants-${course._id}`}
                  className="bg-yellow-500 text-white px-4 py-2 rounded-lg"
                  onClick={() => handleShowCheckName(course)}
                >
                  รายชื่อผู้สมัคร
                </button>
              </div>
            ))}
            <p id="total-courses" className="text-gray-700">ทั้งหมด {filteredCourses.length} รายการ</p>
            <div id="pagination" className="flex justify-between items-center mt-4">
              <p id="page-info" className="text-gray-600">หน้า {currentPage} จาก {totalPages}</p>
              <div id="pagination-buttons" className="flex">
                <button 
                  id="prev-page"
                  className="bg-white border border-gray-300 text-gray-700 px-3 py-1 rounded-lg mr-2"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                <button 
                  id="next-page"
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
      {showCheckName && selectedCourse && (
        <div id="check-name-modal" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div id="check-name-content" className="bg-white p-6 rounded-lg w-3/4 max-h-3/4 overflow-auto">
            <CheckName course={selectedCourse} />
            <button 
              id="close-check-name"
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg"
              onClick={handleCloseCheckName}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseRoadMap;