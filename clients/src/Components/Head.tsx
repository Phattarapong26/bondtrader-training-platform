import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import axios from 'axios';
import PopProfile from '../UserInterface/home/ProfileData';
import HistoryCourse from '../UserInterface/home/HistoryCourse';
import { getToken, setToken, getUser, setUser, clearTokens, clearUser } from '../hooks/tokenStorage';

import Swal from 'sweetalert2'; // เพิ่ม SweetAlert

const handleChangePassword = async (user: User | null) => {
  const { value: formValues } = await Swal.fire({
    title: 'เปลี่ยนรหัสผ่าน',
    html:
      '<input id="swal-old-password" class="swal2-input" placeholder="รหัสผ่านเดิม" type="password">' +
      '<input id="swal-new-password" class="swal2-input" placeholder="รหัสผ่านใหม่" type="password">',
    focusConfirm: false,
    preConfirm: () => {
      const oldPassword = (document.getElementById('swal-old-password') as HTMLInputElement).value;
      const newPassword = (document.getElementById('swal-new-password') as HTMLInputElement).value;
      return { oldPassword, newPassword };
    },
  });

  if (formValues && user) { // เพิ่มการตรวจสอบ user
    try {
      const token = getToken();
      if (!token) return console.error('No token found');

      const response = await axios.post(
        'http://localhost:3000/api/User/change-password',
        {
          userId: user._id, // เปลี่ยนเป็น userId
          oldPassword: formValues.oldPassword,
          newPassword: formValues.newPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );


      Swal.fire('สำเร็จ', response.data.message, 'success');
    } catch (error) {
      Swal.fire('ผิดพลาด', 'ไม่สามารถเปลี่ยนรหัสผ่านได้', 'error');
      console.error('Error changing password:', error);
    }
  } else {
    console.error("User data is missing");
  }
};



interface User {
  _id: string;
  name: string;
  email: string;
  company: string;
  citizen_id: string;
  phone: string;
  bond_status: {
    start_date: string;
    end_date: string;
    status: string;
  };
  profilePicture: string;
}

interface HeaderProps {
  toggleDropdown: () => void;
  dropdownOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({
  toggleDropdown,
  dropdownOpen,
}) => {
  const [user, setUserState] = useState<User | null>(null);
  const [activeComponent, setActiveComponent] = useState<'none' | 'profile' | 'history'>('none');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = getToken();
      if (!token) {
        console.error('No token found');
        return;
      }

      const response = await axios.get('http://localhost:3000/api/user/CheckUserHeader/verify', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const userData: User = {
        _id: response.data._id,
        name: response.data.name,
        email: response.data.email,
        company: response.data.company,
        citizen_id: response.data.citizen_id,
        phone: response.data.phone,
        bond_status: {
          start_date: response.data.bond_status.start_date,
          end_date: response.data.bond_status.end_date,
          status: response.data.bond_status.status
        },
        profilePicture: response.data.profilePicture || ''
      };

      setUserState(userData);
      setUser(userData);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const toggleProfile = () => {
    setActiveComponent(activeComponent === 'profile' ? 'none' : 'profile');
    if (dropdownOpen) {
      toggleDropdown();
    }
  };

  const handleShowHistoryCourse = () => {
    setActiveComponent('history');
  };

  const handleShowProfile = () => {
    setActiveComponent('profile');
  };

  const handleClose = () => {
    setActiveComponent('none');
  };

  return (
    <>
      <header id="user-header" className="bg-white shadow-md p-4 h-20 pt-6">
        <div id="header-content" className="flex justify-end items-center">
          <div id="user-section" className="flex items-center">
            <div id="user-dropdown" className="relative">
              <button
                id="user-menu-btn"
                onClick={toggleDropdown}
                className="flex items-center focus:outline-none"
              >
                <User className="text-gray-500 mr-2" />
                {user && <span id="user-name">{user.name}</span>}
              </button>
              {dropdownOpen && (
                <div id="dropdown-menu" className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                  <button
                    id="profile-btn"
                    onClick={toggleProfile}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    โปรไฟล์
                  </button>
                  <button
                    id="change-password-btn"
                    onClick={() => handleChangePassword(user)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    เปลี่ยนรหัสผ่าน
                  </button>
                  <button
                    id="logout-btn"
                    onClick={() => {
                      console.log('Logging out and clearing token');
                      clearUser();
                      clearTokens();
                      window.location.href = '/login';
                    }}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    ออกจากระบบ
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      {activeComponent !== 'none' && user && (
        <div id="modal-overlay" className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50" style={{ zIndex: 1 }}>
          {activeComponent === 'profile' ? (
            <PopProfile
              data={{
                id: user._id,
                name: user.name,
                email: user.email,
                company: user.company,
                idCard: user.citizen_id,
                phone: user.phone,
                startDate: user.bond_status.start_date,
                endDate: user.bond_status.end_date,
                bond_status: user.bond_status.status,
                profilePicture: user.profilePicture
              }}
              onClose={handleClose}
              onShowHistoryCourse={handleShowHistoryCourse}
            />
          ) : (
            <HistoryCourse
              onClose={handleClose}
              onShowProfile={handleShowProfile}
              userData={{
                _id: user._id,
                name: user.name,
                email: user.email,
                trainingLocation: user.company // Add this to fix the linter error
              }}
              courses={[]}
            />
          )}
        </div>
      )}
    </>
  );
};

export default Header;