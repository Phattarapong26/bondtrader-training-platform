import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import axios from 'axios';
import PopProfile from './ProfileAdmin';
import { AdminUser, HeaderProps } from '../dashboard/interface/incloudeInterface';
import { getToken, getUser, setUser, clearTokens, clearUser } from '../../hooks/tokenStorage';
import { useNavigate } from 'react-router-dom';

const HeaderAdmin: React.FC<HeaderProps> = ({
  toggleDropdown,
  dropdownOpen,
}) => {
  const navigate = useNavigate();
  const [user, setUserState] = useState<AdminUser | null>(null);
  const [activeComponent, setActiveComponent] = useState<'none' | 'profile'>('none');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = getToken();
      if (!token) {
        setError('No token found');
        return;
      }

      let userData: AdminUser | null = null;

      try {
        const response = await axios.get('http://localhost:3000/api/Admin/Verify/Token/Header', {
          headers: { Authorization: `Bearer ${token}` }
        });

        userData = {
          _id: response.data._id,
          name: response.data.name,
          email: response.data.email,
          idCard: response.data.idCard,
          employeeId: response.data.employeeId,
          phone: response.data.phone,
          roles: response.data.roles
        };
      } catch (adminError) {
        console.error('Error fetching admin data:', adminError);
        
        try {
          const userResponse = await axios.get('http://localhost:3000/api/users/Verify/Token/Header', {
            headers: { Authorization: `Bearer ${token}` }
          });

          userData = {
            _id: userResponse.data._id,
            name: userResponse.data.name,
            email: userResponse.data.email,
            idCard: userResponse.data.citizen_id || '',
            employeeId: userResponse.data.employeeId || '',
            phone: userResponse.data.phone || '',
            roles: userResponse.data.roles || ['User']
          };
        } catch (userError) {
          console.error('Error fetching user data:', userError);
        }
      }

      // If both API calls fail, try to use stored data
      if (!userData) {
        const storedUser = getUser();
        if (storedUser) {
          userData = storedUser as AdminUser;
          console.log('Using stored user data');
        } else {
          setError('Failed to fetch user data and no local data available');
          return;
        }
      }

      setUserState(userData);
      setUser(userData); // บันทึกข้อมูลผู้ใช้ใน tokenStorage
    } catch (error) {
      console.error('Error in fetchUserData:', error);
      setError('An unexpected error occurred');
    }
  };

  const toggleProfile = () => {
    setActiveComponent(activeComponent === 'profile' ? 'none' : 'profile');
    if (dropdownOpen) {
      toggleDropdown();
    }
  };

  const handleClose = () => {
    setActiveComponent('none');
  };
  
  const handleLogout = () => {
    clearTokens();
    clearUser();
    navigate('/login');
  };

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <>
      <header id="admin-header" className="bg-white shadow-md p-4 h-20 pt-6">
        <div id="header-content" className="flex justify-end items-center">
          <div id="user-section" className="flex items-center ">
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
                    id="logout-btn"
                    onClick={handleLogout}
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
          {activeComponent === 'profile' && (
            <PopProfile
              data={user}
              onClose={handleClose}
            />
          )}
        </div>
      )}
    </>
  );
};

export default HeaderAdmin;