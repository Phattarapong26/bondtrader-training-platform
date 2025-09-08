import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PopUpProfile from './ProfileUser';
import PopUpCourseHistory from './HistoryUser';
import {CourseData, MainProfileProps, Course, ProfileData } from '../dashboard/interface/incloudeInterface';
import { getToken, clearTokens } from '../../hooks/tokenStorage';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

// คำนิยามใหม่ที่ขยาย ProfileData เพื่อใช้ในส่วนนี้โดยเฉพาะ
interface ExtendedProfileData extends Omit<ProfileData, 'employeeId'> {
  employeeId?: string;
}

export const MainProfile: React.FC<MainProfileProps> = ({ userData, onClose }) => {
  const [showProfile, setShowProfile] = useState<boolean>(true);
  const [showCourseHistory, setShowCourseHistory] = useState<boolean>(false);
  const [courseData, setCourseData] = useState<CourseData[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (showCourseHistory) {
      fetchCourseHistory();
    }
  }, [showCourseHistory]);

  const fetchCourseHistory = async () => {
    try {
      const token = getToken();
      if (!token) {
        console.error('Token not found');
        clearTokens();
        navigate('/login');
        return;
      }
      
      const response = await axios.get(`http://localhost:3000/api/Admin/Check/user/HistoryCourses/${userData._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Course history response:', response.data);
      setCourseData(response.data);
    } catch (error) {
      console.error('Error fetching course history:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          clearTokens();
          navigate('/login');
          return;
        }
        Swal.fire({
          icon: 'error',
          title: 'ไม่สามารถโหลดประวัติคอร์ส',
          text: error.response?.status === 404 ? 'ไม่พบข้อมูลคอร์สของผู้ใช้นี้' : 'เกิดข้อผิดพลาดในการโหลดประวัติคอร์ส'
        });
      }
    }
  };

  const handleCloseProfile = () => {
    setShowProfile(false);
    onClose();
  };

  const handleShowCourseHistory = () => {
    setShowProfile(false);
    setShowCourseHistory(true);
  };

  const handleCloseCourseHistory = () => {
    setShowCourseHistory(false);
    onClose();
  };

  const handleShowProfile = () => {
    setShowCourseHistory(false);
    setShowProfile(true);
  };

  // แปลง CourseData ให้เป็น Course ที่สมบูรณ์
  const convertToCourses = (data: CourseData[]): Course[] => {
    return data.map(item => ({
      _id: item._id,
      title: item.title,
      description: '',
      details: '',
      duration_hours: 0,
      registrationDate: item.registrationDate,
      max_seats: 0,
      start_date: '',
      thumbnail: item.thumbnail,
      video: '',
      status: item.status,
      statusDate: item.statusDate
    }));
  };

  return (
    <div id="main-profile-container">
      {showProfile && (
        <PopUpProfile
          data={{
            id: userData._id,
            name: userData.name,
            idCard: userData.citizen_id,
            startDate: userData.created_at,
            bond_status: {
              start_date: userData.bond_status.start_date,
              end_date: userData.bond_status.end_date,
              status: userData.bond_status.status,
            },
            profilePicture: userData.profilePicture ?? '',
            company: userData.company,
            email: userData.email,
            phone: userData.phone,
            endDate: userData.bond_status.end_date
          } as ExtendedProfileData}
          onClose={handleCloseProfile}
          onShowHistoryCourse={handleShowCourseHistory}
        />
      )}
      {showCourseHistory && (
        <PopUpCourseHistory
          onClose={handleCloseCourseHistory}
          onShowProfile={handleShowProfile}
          userData={{
            name: userData.name,
            email: userData.email,
            _id: userData._id,
          }}
          courses={convertToCourses(courseData)}
        />
      )}
    </div>
  );
};

export default MainProfile;