import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faCertificate, faUser, faTimes } from '@fortawesome/free-solid-svg-icons';
import Sidebar from '../../Components/Sidebar';
import HeaderAdmin from '../dashboard/HeadAdmin';
import CheckName from '../CourseRoadMAP/checkName';
import { Course,User} from '../dashboard/interface/incloudeInterface';
import { getToken, clearTokens } from '../../hooks/tokenStorage';

const AboutCourseAdmin: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [enrolledUsers, setEnrolledUsers] = useState<number>(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showCheckName, setShowCheckName] = useState(false);

  const getAxiosInstance = () => {
    const token = getToken();
    if (!token) {
      clearTokens();
      navigate('/login');
      throw new Error('Token not found');
    }
    
    return axios.create({
      baseURL: 'http://localhost:3000/api',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const toggleCheckName = () => setShowCheckName(!showCheckName);

  useEffect(() => {
    const fetchCourseAndEnrollments = async () => {
      try {
        const axiosInstance = getAxiosInstance();
        const [courseResponse, usersResponse] = await Promise.all([
          axiosInstance.get<Course>(`/courses/${id}`), 
          axiosInstance.get<User[]>(`/v1/user/courses/${id}`)
        ]);
        setCourse(courseResponse.data);
        const enrolledCount = usersResponse.data.filter(user => 
          user.courses_enrolled.some(course => course.course_id === id)
        ).length;
        setEnrolledUsers(enrolledCount);
      } catch (error) {
        console.error('Error fetching data:', error);
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          clearTokens();
          navigate('/login');
          return;
        }
        Swal.fire('Error', 'Failed to fetch course details', 'error');
        navigate('/admin/courses');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourseAndEnrollments();
  }, [id, navigate]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!course) {
    return <div>Course not found</div>;
  }

  const availableSeats = course.max_seats - enrolledUsers;

  return (
    <div id="about-course-container" className="flex h-screen overflow-hidden bg-gray-100">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <main id="main-content" className="flex-1 overflow-y-auto">
        <HeaderAdmin
          toggleDropdown={toggleDropdown}
          dropdownOpen={dropdownOpen}
        />
        <div id="content-wrapper" className="w-full mx-auto p-6 ml-3 mt-3 bg-white shadow-md rounded-lg border">
          <div id="course-header" className="bg-gray-800 shadow-md rounded-lg p-6 flex">
            <div id="course-info" className="w-2/3 pr-6">
              <h1 id="course-id" className="text-gray-400 text-sm">{course._id}</h1>
              <h2 id="course-title" className="text-3xl font-bold text-white leading-tight mb-4">
                {course.title}
              </h2>
              <p id="course-description" className="text-gray-300 mb-4">
                {course.description}
              </p>
            </div>
            <div id="course-media" className="w-1/3 bg-white shadow-md rounded-lg p-4">
              <video
                id="course-video"
                src={`http://localhost:3000/uploads/${course.video}`}
                controls
                className="w-full rounded mb-4"
              />
              <ul id="course-details" className="text-gray-700">
                <li id="duration" className="flex items-center mb-2">
                  <FontAwesomeIcon icon={faClock} className="mr-2" /> {course.duration_hours} ชั่วโมงการเรียน
                </li>
                <li id="certificate" className="flex items-center mb-2">
                  <FontAwesomeIcon icon={faCertificate} className="mr-2" /> วุฒิบัตร
                </li>
                <li id="seats" className="flex items-center mb-2">
                  <FontAwesomeIcon icon={faUser} className="mr-2" /> {enrolledUsers}/{course.max_seats} ที่นั่ง
                </li>
              </ul>
            </div>
          </div>
          <div id="course-details-section" className="bg-white shadow-md rounded-lg p-6 mt-6">
            <div id="course-description-section" className="border-b border-gray-300 pb-4 mb-4">
              <h3 id="description-title" className="text-xl font-bold text-gray-800 mb-2">รายละเอียดหลักสูตร</h3>
              <p id="description-content" className="text-gray-700">
                {course.details}
              </p>
            </div>
            <div id="additional-info">
              <h3 id="info-title" className="text-xl font-bold text-gray-800 mb-2">ข้อมูลเพิ่มเติม</h3>
              <p id="info-content" className="text-gray-700">
                จำนวนที่นั่งสูงสุด: {course.max_seats}<br />
                จำนวนผู้ลงทะเบียน: {enrolledUsers}<br />
                จำนวนที่นั่งว่าง: {availableSeats}<br />
                วันที่เริ่ม: {new Date(course.start_date).toLocaleDateString('th-TH')}
              </p>
            </div>
          </div>
          
          <div id="participants-section" className="mt-6">
            <button
              id="show-participants-btn"
              onClick={toggleCheckName}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              แสดงรายชื่อผู้เข้าอบรม
            </button>
          </div>

          {showCheckName && (
            <div id="check-name-modal" className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div id="check-name-content" className="bg-white rounded-lg p-6 w-3/4 max-w-3xl max-h-[90vh] overflow-y-auto relative">
                <button
                  id="close-check-name"
                  onClick={toggleCheckName}
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                >
                  <FontAwesomeIcon icon={faTimes} size="lg" />
                </button>
                <CheckName course={course} />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AboutCourseAdmin;