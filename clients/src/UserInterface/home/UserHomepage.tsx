import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Banner from './Banner';
import CourseSlider from './CourseSlider';
import MultiJobbersSection from './MultiJobbersSection';
import Sidebar from '../../Components/SidebarUser';
import Header from '../../Components/Head';
import { Course,User} from './interfaces/allInterface';

const UserHomepage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get<Course[]>("http://localhost:3000/api/courses");
        setCourses(response.data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    const fetchUserData = async () => {
      try {
        const response = await axios.get<User>('/api/users');
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchCourses();
    fetchUserData();
  }, []);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <div id="user-homepage" className="flex h-screen overflow-hidden bg-white">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <main id="main-content" className="flex-1 overflow-y-auto">
        <Header
          toggleDropdown={toggleDropdown}
          dropdownOpen={dropdownOpen}
        />
        <div id="content-container" className="pl-7 pr-3 pt-7 ml-2 mt-2 rounded-tl-lg shadow-md bg-white border">
          <Banner />
          <CourseSlider />
          <MultiJobbersSection />
        </div>
      </main>
    </div>
  );
};

export default UserHomepage;