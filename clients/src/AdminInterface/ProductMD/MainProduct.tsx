import React, { useState, useEffect } from "react";
import Headers from "./Header";
import CourseCard from "./CourseCard";
import Sidebar from "../../Components/Sidebar";
import HeaderAdmin from '../dashboard/HeadAdmin';
import CourseUploadPopup from "./UploadCourse";
import axios from "axios";
import "./MainProduct.css";
import { useAuth } from '../../hooks/useAuth';

interface User {
  name: string;
  email: string;
}

interface CourseData {
  _id: string;
  title: string;
  description: string;
  details: string;
  duration_hours: number;
  max_seats: number;
  start_date: string;
  thumbnail: string | File;
  video: string | File;
  qr_code: string | File;
  trainingLocation: string;
}

interface CourseUploadData {
  title: string;
  description: string;
  details: string;
  duration_hours: number;
  max_seats: number;
  start_date: string;
  thumbnail: File | null;
  video: File | null;
  qr_code: File | null;
}

interface MainProductProps {
  user: User;
}

interface FilterOptions {
  duration: string;
  startDate: string;
}

const MainProduct: React.FC<MainProductProps> = ({ user }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Latest");
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<CourseData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    duration: '',
    startDate: ''
  });

  const { token } = useAuth();

  const fetchCourses = async (authToken: string) => {
    try {
      const response = await axios.get<CourseData[]>("http://localhost:3000/api/courses", {
        headers: {
          "Authorization": `Bearer ${authToken}`
        }
      });
      const fetchedCourses: CourseData[] = response.data;
      setCourses(fetchedCourses);
      setFilteredCourses(fetchedCourses);
      setError(null); // Clear any existing errors
    } catch (error: any) {
      console.error("Error fetching courses:", error);
      if (error.response?.status === 401) {
        setError("เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่");
      } else {
        setError("ไม่สามารถดึงข้อมูลคอร์สได้ กรุณาลองใหม่อีกครั้ง");
      }
    }
  };

  useEffect(() => {
    if (!token) {
      // console.log("No JWT Token available");
      // setError("กรุณาเข้าสู่ระบบ");
      return;
    }

    console.log("JWT Token found:", token);
    fetchCourses(token);
  }, [token]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    let sortedCourses = [...courses];
    
    switch(tab) {
      case 'Latest':
        sortedCourses.sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
        break;
      case 'Popular':
        // If you have a popularity metric, implement sorting here
        break;
      case 'Upcoming':
        const now = new Date();
        sortedCourses = sortedCourses.filter(course => new Date(course.start_date) > now);
        break;
      default:
        break;
    }
    
    setFilteredCourses(sortedCourses);
  };

  const openPopup = () => {
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  const handleCourseSubmit = async (courseData: CourseUploadData): Promise<void> => {
    if (!token) {
      setError('กรุณาเข้าสู่ระบบก่อนเพิ่มคอร์ส');
      return;
    }

    try {
      const formData = new FormData();
      Object.entries(courseData).forEach(([key, value]) => {
        if (value !== null) {
          if (value instanceof File) {
            formData.append(key, value, value.name);
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      const response = await axios.post<CourseData>(
        "http://localhost:3000/api/Admin/Add/NewCourses",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${token}`
          },
        }
      );

      const newCourse: CourseData = response.data;
      setCourses(prevCourses => [...prevCourses, newCourse]);
      setFilteredCourses(prevCourses => [...prevCourses, newCourse]);
      setError(null);
      closePopup();
    } catch (error) {
      console.error("Error uploading course:", error);
      setError("ไม่สามารถอัพโหลดคอร์สได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  const handleSearch = (searchQuery: string) => {
    setSearchQuery(searchQuery);
    applyFilters({ ...filters, searchQuery });
  };

  const handleFilter = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    applyFilters({ ...newFilters, searchQuery });
  };

  const applyFilters = (currentFilters: FilterOptions & { searchQuery: string }) => {
    let filtered = [...courses];

    // Apply search filter
    if (currentFilters.searchQuery) {
      const query = currentFilters.searchQuery.toLowerCase();
      filtered = filtered.filter(course => 
        course.title.toLowerCase().includes(query) || 
        course.description.toLowerCase().includes(query)
      );
    }

    // Apply duration filter
    if (currentFilters.duration) {
      filtered = filtered.filter(course => {
        if (currentFilters.duration === 'short') return course.duration_hours < 2;
        if (currentFilters.duration === 'medium') return course.duration_hours >= 2 && course.duration_hours <= 5;
        if (currentFilters.duration === 'long') return course.duration_hours > 5;
        return true;
      });
    }

    // Apply start date filter
    if (currentFilters.startDate) {
      const today = new Date();
      filtered = filtered.filter(course => {
        const courseDate = new Date(course.start_date);
        if (currentFilters.startDate === 'upcoming') return courseDate > today;
        if (currentFilters.startDate === 'past') return courseDate < today;
        if (currentFilters.startDate === 'today') return courseDate.toDateString() === today.toDateString();
        return true;
      });
    }

    setFilteredCourses(filtered);
  };

  const handleEditCourse = async (updatedCourse: CourseData) => {
    if (!token) {
      setError('กรุณาเข้าสู่ระบบก่อนแก้ไขคอร์ส');
      return;
    }

    try {
      const formData = new FormData();
      Object.entries(updatedCourse).forEach(([key, value]) => {
        if (value !== null) {
          if (value instanceof File) {
            formData.append(key, value, value.name);
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      const response = await axios.put<CourseData>(
        `http://localhost:3000/api/Admin/UpdateDetail/courses/${updatedCourse._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${token}`
          }
        }
      );
      
      const updatedCourses = courses.map(course => 
        course._id === updatedCourse._id ? response.data : course
      );
      
      setCourses(updatedCourses);
      setFilteredCourses(updatedCourses);
      setError(null);
    } catch (error) {
      console.error("Error updating course:", error);
      setError("ไม่สามารถอัพเดทคอร์สได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!token) {
      setError('กรุณาเข้าสู่ระบบก่อนลบคอร์ส');
      return;
    }

    try {
      await axios.delete(`http://localhost:3000/api/Admin/Deleted/courses/${courseId}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      const updatedCourses = courses.filter(course => course._id !== courseId);
      setCourses(updatedCourses);
      setFilteredCourses(updatedCourses);
      setError(null);
    } catch (error) {
      console.error("Error deleting course:", error);
      setError("ไม่สามารถลบคอร์สได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Apply filters whenever courses, filters, or searchQuery changes
  useEffect(() => {
    applyFilters({ ...filters, searchQuery });
  }, [courses, filters, searchQuery]);

  return (
    <div id="main-product-container" className="flex h-screen text-gray-700">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div id="main-content" className="flex-1 flex flex-col overflow-hidden text-gray-700">
        <HeaderAdmin
          toggleDropdown={toggleDropdown}
          dropdownOpen={dropdownOpen}
        />
        <main id="product-main" className="flex-1 overflow-x-hidden overflow-y-auto text-yellow-500 bg-gray-200">
          <div id="product-content" className="w-full py-8 text-gray-700 bg-white ml-2 mt-2 p-9 rounded-tl-lg">
            <Headers
              toggleSidebar={toggleSidebar}
              openPopup={openPopup}
              onSearch={handleSearch}
              handleTabClick={handleTabClick}
              onFilter={handleFilter}
            />
            
            {error && (
              <div id="error-message" className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <strong className="font-bold">ข้อผิดพลาด! </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            
            <div id="courses-grid" className="mt-8 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 text-gray-700">
              {filteredCourses.map((course) => (
                <CourseCard
                  key={course._id}
                  course={course}
                  onEdit={handleEditCourse}
                  onDelete={handleDeleteCourse}
                  jwtToken={token}
                />
              ))}
            </div>
            
            <CourseUploadPopup
              id="upload-popup"
              isOpen={isPopupOpen}
              onClose={closePopup}
              onSubmit={handleCourseSubmit}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainProduct;