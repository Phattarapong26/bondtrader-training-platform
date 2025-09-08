ฉันต้องการแก้ไขระบบสำหรับ profilePicture. ซึ่งปัญหาคือในฐานข้อมูลฉันเก็บรูปในฐาน mongoDB เป็น http://localhost:3000/uploads/profilePicture- แทนที่จะเป็นแค่ชื่อไฟล์รูป. {
  "_id": {
    "$oid": "67244d899ed5c4281bdc4fa4"
  },
  "name": "Phattarapong Phengtavee",
  "company": "Uknowme asset",
  "citizen_id": "1329900959405",
  "email": "PhattarapongUknowme@gmail.com",
  "phone": "0966566414",
  "password": "$2b$10$2Lx3P7A4gyVySv.tt6I.0.Ja1058FY1aLt1Lnm0giX6gqpDCGz2ye",
  "password_changed": false,
  "bond_status": {
    "status": "inactive",
    "start_date": null,
    "end_date": null
  },
  "courses_enrolled": [],
  "created_at": {
    "$date": "2024-11-01T03:39:53.636Z"
  },
  "updated_at": {
    "$date": "2024-11-01T03:39:53.636Z"
  },
  "profilePicture": "http://localhost:3000/uploads/profilePicture-1730432542165-925008005.jpg",
  "role": "user"
}. และเมื่อฉันจะปรับปรุงให้เก็บแค่ชื่อไฟล์การเรียกใช้ใน clients ก็จะต้องแก้ทั้งระบบ โดยที่ใช้ UI เดิม แก้ไขแค่ข้อมูล profilePicture เท่านั้น. import React from 'react';
import Avatar from './Avatar';
interface Customer {
 _id: string;
 name: string;
 citizen_id: string;
 created_at: string;
 updated_at: string;
 bond_status?: { status?: string };
 company: string;
 email: string;
 phone: string;
 profilePicture?: string;
}
interface Props {
 customer: Customer;
 onViewDetails: (customer: Customer) => void;
}
const CustomerCard: React.FC = ({ customer, onViewDetails }) => {
const handleViewDetails = () => {
 console.log('CustomerCard: Sending customer data:', customer);
 onViewDetails(customer);
 };
// Add console.log to debug profilePicture
 console.log('Profile Picture URL:', customer.profilePicture);
return (







{customer.name}






Company: {customer.company}


Email: {customer.email}


Phone: {customer.phone}


Bond Status: {customer.bond_status?.status || 'No status available'}




 View Details




 );
};
export default CustomerCard;import React, { useMemo, useState } from 'react';
interface AvatarProps {
 name: string;
 size?: 'sm' | 'md' | 'lg';
 profilePicture?: string;
}
const API_URL = 'http://localhost:3000';
const Avatar: React.FC = ({ name, size = 'md', profilePicture }) => {
const [imageError, setImageError] = useState(false);
const sizeClasses = {
 sm: 'w-8 h-8',
 md: 'w-12 h-12',
 lg: 'w-16 h-16'
 };
const avatarUrl = useMemo(() => {
if (profilePicture && !imageError) {
return profilePicture.startsWith('http')
 ? profilePicture
 : `${API_URL}${profilePicture}`;
 }
const seed = encodeURIComponent(name);
const style = 'avataaars';
return `https://api.dicebear.com/6.x/${style}/svg?seed=${seed}`;
 }, [name, profilePicture, imageError]);
const handleImageError = () => {
 console.error('Error loading profile picture:', profilePicture);
 setImageError(true);
 };
return (






  ); }; export default Avatar; 
  import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { ProfileData,PopProfileProps} from './interfaces/allInterface';

const API_URL = 'http://localhost:3000';
const DEFAULT_PROFILE_PIC = '/default-profile.png';

const PopProfile: React.FC<PopProfileProps> = ({ data, onClose, onShowHistoryCourse }) => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedData, setEditedData] = useState<ProfileData>(data);
  const [formattedDates, setFormattedDates] = useState({
    startDate: '--',
    endDate: '--',
    age: 'ยังไม่ได้รับสถานะ',
    daysUntilRenewal: '--'
  });

  const [profilePicture, setProfilePicture] = useState<string>(() => {
    const storedPicture = localStorage.getItem('profilePicture');
    const defaultPicture = data?.profilePicture || '';

    return storedPicture || defaultPicture || DEFAULT_PROFILE_PIC;
  });

  const [imageError, setImageError] = useState(false);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);

  useEffect(() => {
    updateDateInformation(data);
  }, [data]);

  const updateDateInformation = async (currentData: ProfileData) => {
    try {
      const [startDateResponse, endDateResponse, ageResponse, renewalResponse] = await Promise.all([
        axios.post('http://localhost:3000/api/date/format', { dateString: currentData.startDate }),
        axios.post('http://localhost:3000/api/date/format', { dateString: currentData.endDate }),
        axios.post('http://localhost:3000/api/date/calculateAge', { startDate: currentData.startDate }),
        axios.post('http://localhost:3000/api/date/daysUntilRenewal', { endDate: currentData.endDate })
      ]);

      setFormattedDates({
        startDate: startDateResponse.data.formattedDate,
        endDate: endDateResponse.data.formattedDate,
        age: ageResponse.data.age,
        daysUntilRenewal: renewalResponse.data.daysUntilRenewal
      });
    } catch (error) {
      console.error('Error fetching date information:', error);
      setFormattedDates({
        startDate: 'ไม่สามารถโหลดข้อมูลได้',
        endDate: 'ไม่สามารถโหลดข้อมูลได้',
        age: 'ไม่สามารถโหลดข้อมูลได้',
        daysUntilRenewal: 'ไม่สามารถโหลดข้อมูลได้'
      });
    }
  };

  const getProfilePictureUrl = (picture?: string): string => {
    if (!picture || imageError) return DEFAULT_PROFILE_PIC;
    const cleanUrl = picture.replace(new RegExp(API_URL, 'g'), '');
    const cleanPath = cleanUrl.replace(/^\/+/, '');
    return `${API_URL}/${cleanPath}`;
  };

  useEffect(() => {
    if (data?.profilePicture) {
      try {
        const picUrl = getProfilePictureUrl(data.profilePicture);
        console.log('Processing Profile Picture:', {
          original: data.profilePicture,
          processed: picUrl
        });
        const img = new Image();
        img.onload = () => {
          setProfilePicture(picUrl);
          localStorage.setItem('profilePicture', picUrl);
          setImageError(false);
        };
        img.onerror = () => {
          console.error('Failed to load image:', picUrl);
          setImageError(true);
          setProfilePicture(DEFAULT_PROFILE_PIC);
        };
        img.src = picUrl;
      } catch (error) {
        console.error('Error processing profile picture:', error);
        setImageError(true);
        setProfilePicture(DEFAULT_PROFILE_PIC);
      }
    }
  }, [data?.profilePicture]);


  const handleImageError = () => {
    console.error('Error loading profile picture:', profilePicture);
    setImageError(true);
    setProfilePicture(DEFAULT_PROFILE_PIC);
  };

  const handleMyCourseClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onShowHistoryCourse();
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token not found');

      let updatedData = { ...editedData };

      if (profilePictureFile) {
        const formData = new FormData();
        formData.append('profilePicture', profilePictureFile);

        const uploadResponse = await axios.post('http://localhost:3000/api/upload-profile-picture', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        });

        updatedData.profilePicture = uploadResponse.data.profilePictureUrl;
      }

      const response = await axios.put('http://localhost:3000/api/users/me', updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setIsEditing(false);
      setEditedData(response.data);
      updateDateInformation(response.data);

      if (response.data.profilePicture) {
        setProfilePicture(response.data.profilePicture);
        localStorage.setItem('profilePicture', response.data.profilePicture);
      }

      Swal.fire({
        icon: 'success',
        title: 'อัพเดทข้อมูลสำเร็จ',
        showConfirmButton: false,
        timer: 1500,
      });

    } catch (error: any) {
      console.error('Error saving data:', error);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: error.response?.data?.message || 'ไม่สามารถอัปเดตข้อมูลได้',
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePictureFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setProfilePicture(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCancelClick = () => {
    setEditedData(data);
    setProfilePicture(data.profilePicture || DEFAULT_PROFILE_PIC);
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedData(prevData => ({ ...prevData, [name]: value }));
  };

  const renderField = (field: keyof ProfileData, label: string) => {
    const isEditable = ['name', 'company', 'email', 'phone'].includes(field);
    const displayValue = formattedDates[field as keyof typeof formattedDates] || data[field] || "--";

    return (
      <div className="mb-4" key={field}>
        <span className="text-yellow-500 font-bold">{label}</span>
        {isEditing && isEditable ? (
          <input
            type="text"
            name={field}
            value={editedData[field]}
            onChange={handleInputChange}
            className="ml-4 border rounded px-2 py-1"
          />
        ) : (
          <span className="ml-4">{displayValue}</span>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto p-4 bg-white rounded-lg shadow-lg mt-10 relative">
      <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
        <i className="fas fa-times"></i>
      </button>
      <div className="flex items-center mb-6">
        <div className="w-16 h-16 rounded-full bg-yellow-500 flex items-center justify-center text-white text-2xl">
          <i className="fas fa-user"></i>
        </div>
        <div className="ml-4">
          <h1 className="text-xl font-bold">{data.name}</h1>
          <p className="text-gray-600">{data.email}</p>
        </div>
      </div>

      <nav className="flex justify-between items-center border-b pb-4 mb-6">
        <div className="hidden md:flex space-x-4">
          <a href="#" className="text-yellow-500"><i className="fas fa-user"></i> ข้อมูลส่วนตัว</a>
          <a href="#" className="text-gray-500 hover:text-yellow-500" onClick={handleMyCourseClick}>
            <i className="fas fa-book"></i> หลักสูตรของฉัน
          </a>
        </div>
        <div className="md:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-500 hover:text-yellow-500">
            <i className="fas fa-bars"></i>
          </button>
        </div>
      </nav>
      {menuOpen && (
        <div className="flex flex-col space-y-4 mb-6 md:hidden">
          <a href="#" className="text-yellow-500"><i className="fas fa-user"></i> ข้อมูลส่วนตัว</a>
          <a href="#" className="text-gray-500 hover:text-yellow-500" onClick={handleMyCourseClick}>
            <i className="fas fa-book"></i> หลักสูตรของฉัน
          </a>
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-yellow-500">ข้อมูลส่วนตัว</h1>
        {isEditing ? (
          <div>
            <button onClick={handleSaveClick} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-300 mr-2">บันทึก</button>
            <button onClick={handleCancelClick} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-300">ยกเลิก</button>
          </div>
        ) : (
          <button onClick={handleEditClick} className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition duration-300">แก้ไขข้อมูล</button>
        )}
      </div>
      <hr className="border-t-2 border-yellow-500 mb-6" />
      <div className="flex flex-col md:flex-row" style={{
        maxHeight: '410px',
        overflowY: 'auto',
        minHeight: '410px',
        minWidth: '730px'
      }}>
        <div className="w-full md:w-1/3 flex justify-center mb-10 p-auto relative">
        <img
      src={profilePicture}
      alt="Profile picture"
      className="rounded-full h-40 w-40 object-cover mt-24"
      onError={handleImageError}
    />

          {isEditing && (
            <label className="absolute inset-0 flex items-center justify-center cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <div className="bg-yellow-500 rounded-full h-12 w-12 flex items-center justify-center shadow-lg">
                <i className="fas fa-camera text-white text-lg"></i>
              </div>
            </label>
          )}
        </div>
        <div className="w-full md:w-2/3 ml-14 mt-12">
          {renderField('name', 'ชื่อ:')}
          {renderField('company', 'บริษัท:')}
          {renderField('idCard', 'รหัสประชาชน:')}
          {renderField('email', 'อีเมล:')}
          {renderField('phone', 'เบอร์โทร:')}
          {renderField('startDate', 'วันที่เริ่มต้น:')}
          {renderField('endDate', 'วันที่สิ้นสุด:')}
          {renderField('bond_status', 'สถานะพันธบัตร:')}

          <div className="mb-4">
            <span className="text-yellow-500 font-bold">อายุสถานะ:</span>
            <span className="ml-4">{formattedDates.age}</span>
          </div>
          <div className="mb-4">
            <span className="text-yellow-500 font-bold">เวลาที่เหลือจนถึงวันต่ออายุ:</span>
            <span className="ml-4">{formattedDates.daysUntilRenewal}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopProfile;

import React, { useState, useEffect } from 'react';
import { Bell, User } from 'lucide-react';
import axios from 'axios';
import PopProfile from '../UserInterface/home/ProfileData';
import HistoryCourse from '../UserInterface/home/HistoryCourse';

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
      const token = localStorage.getItem('token');
      if (!token) return console.error('No token found');

      const response = await axios.post(
        'http://localhost:3000/api/v1/users/change-password',
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
  const [user, setUser] = useState<User | null>(null);
  const [activeComponent, setActiveComponent] = useState<'none' | 'profile' | 'history'>('none');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      const response = await axios.get('http://localhost:3000/api/v1/header/users/verfify', {
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

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
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
      <header className="bg-white shadow-md p-4 h-20 pt-6">
        <div className="flex justify-end items-center">
          <div className="flex items-center ">
            <Bell className="text-gray-500 mr-4" />
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="flex items-center focus:outline-none"
              >
                <User className="text-gray-500 mr-2" />
                {user && <span>{user.name}</span>}
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                  <button
                    onClick={toggleProfile}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    โปรไฟล์
                  </button>
                  <button
                    onClick={() => handleChangePassword(user)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    เปลี่ยนรหัสผ่าน
                  </button>

                  <button
                    onClick={() => {
                      console.log('Logging out and clearing token');
                      localStorage.removeItem('user');
                      localStorage.removeItem('token');
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
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50" style={{ zIndex: 1 }}>
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
                email: user.email
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
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

interface ProfileData {
  id: string;
  name: string;
  idCard: string;
  startDate: string;
  bond_status: {
    start_date: string;
    end_date: string;
    status: string;
  };
  profilePicture: string;
  company: string;
  email: string;
  phone: string;
}

interface PopProfileProps {
  data: ProfileData;
  onClose: () => void;
  onShowHistoryCourse: () => void;
}

interface DateResponse {
  formattedDate: string;
}

interface AgeResponse {
  age: string;
}

interface RenewalResponse {
  daysUntilRenewal: string;
}

const PopUpProfile: React.FC<PopProfileProps> = ({ data, onClose, onShowHistoryCourse }) => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedData, setEditedData] = useState<ProfileData>(data);
  const [profilePicture, setprofilePicture] = useState<string>(data?.profilePicture || '');
  const [formattedStartDate, setFormattedStartDate] = useState<string>('');
  const [formattedEndDate, setFormattedEndDate] = useState<string>('');
  const [ageStatus, setAgeStatus] = useState<string>('');
  const [renewalDays, setRenewalDays] = useState<string>('');

  useEffect(() => {
    fetchFormattedDates();
    fetchAgeStatus();
    fetchRenewalDays();
  }, [data]);

  const fetchFormattedDates = async () => {
    try {
      // Check bond_status.start_date instead of data.startDate
      if (data.bond_status?.start_date) {
        const startDateResponse = await axios.post<DateResponse>('http://localhost:3000/api/date/format', {
          dateString: data.bond_status.start_date
        });
        setFormattedStartDate(startDateResponse.data.formattedDate);
      } else {
        setFormattedStartDate('ยังไม่ได้รับสถานะ');
      }

      if (data.bond_status?.end_date) {
        const endDateResponse = await axios.post<DateResponse>('http://localhost:3000/api/date/format', {
          dateString: data.bond_status.end_date
        });
        setFormattedEndDate(endDateResponse.data.formattedDate);
      } else {
        setFormattedEndDate('ยังไม่มีข้อมูล');
      }
    } catch (error) {
      console.error('Error fetching formatted dates:', error);
      setFormattedStartDate('ยังไม่ได้รับสถานะ');
      setFormattedEndDate('ยังไม่มีข้อมูล');
    }
  };

  const fetchAgeStatus = async () => {
    try {
      // Use bond_status.start_date instead of startDate
      if (data.bond_status?.start_date) {
        const response = await axios.post<AgeResponse>('http://localhost:3000/api/date/calculateAge', {
          startDate: data.bond_status.start_date
        });
        setAgeStatus(response.data.age);
      } else {
        setAgeStatus('ยังไม่ได้รับสถานะ');
      }
    } catch (error) {
      console.error('Error calculating age:', error);
      setAgeStatus('ยังไม่ได้รับสถานะ');
    }
  };

  const fetchRenewalDays = async () => {
    try {
      // Only calculate renewal days if end_date exists and is not empty
      if (data.bond_status?.end_date && data.bond_status.end_date.trim() !== '') {
        const response = await axios.post<RenewalResponse>('http://localhost:3000/api/date/daysUntilRenewal', {
          endDate: data.bond_status.end_date
        });
        setRenewalDays(response.data.daysUntilRenewal);
      } else {
        setRenewalDays('ยังไม่มีข้อมูล');
      }
    } catch (error) {
      console.error('Error calculating renewal days:', error);
      setRenewalDays('ยังไม่มีข้อมูล');
    }
  };

  const handleMyCourseClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onShowHistoryCourse();
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Token not found');
        return;
      }

      const response = await axios.put(`http://localhost:3000/api/users/${data.id}`, {
        bond_status: {
          status: editedData.bond_status.status,
          end_date: editedData.bond_status.end_date,
        },
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log("Saving data:", response.data);
      setIsEditing(false);

      Swal.fire({
        icon: 'success',
        title: 'อัพเดทข้อมูลสำเร็จ',
        showConfirmButton: false,
        timer: 1500,
      }).then(() => {
        window.location.reload();
      });

    } catch (error) {
      console.error('Error saving data:', error);

      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถอัปเดตข้อมูลได้',
      });
    }
  };

  const handleCancelClick = () => {
    setEditedData(data);
    setprofilePicture(data.profilePicture);
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedData(prevData => ({
      ...prevData,
      bond_status: {
        ...prevData.bond_status,
        [name]: value
      }
    }));
  };

  return (
    <div className="max-w-5xl mx-auto p-4 bg-white rounded-lg shadow-lg mt-28 relative">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
      >
        <i className="fas fa-times"></i>
      </button>
      <div className="flex items-center mb-6">
        <div className="w-16 h-16 rounded-full bg-yellow-500 flex items-center justify-center text-white text-2xl">
          <i className="fas fa-user"></i>
        </div>
        <div className="ml-4">
          <h1 className="text-xl font-bold">{data.name}</h1>
          <p className="text-gray-600">{data.email}</p>
        </div>
      </div>

      <nav className="flex justify-between items-center border-b pb-4 mb-6">
        <div className="flex space-x-4 md:flex">
          <a href="#" className="text-yellow-500"><i className="fas fa-user"></i> ข้อมูลส่วนตัว</a>
          <a href="#" className="text-gray-500 hover:text-yellow-500" onClick={handleMyCourseClick}>
            <i className="fas fa-book"></i> หลักสูตรของฉัน
          </a>
        </div>
        <div className="md:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-500 hover:text-yellow-500">
            <i className="fas fa-bars"></i>
          </button>
        </div>
      </nav>
      {menuOpen && (
        <div className="flex flex-col space-y-4 mb-6 md:hidden">
          <a href="#" className="text-yellow-500"><i className="fas fa-user"></i> ข้อมูลส่วนตัว</a>
          <a href="#" className="text-gray-500 hover:text-yellow-500" onClick={handleMyCourseClick}>
            <i className="fas fa-book"></i> หลักสูตรของฉัน
          </a>
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-yellow-500">ข้อมูลส่วนตัว</h1>
        {isEditing ? (
          <div>
            <button onClick={handleSaveClick} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-300 mr-2">บันทึก</button>
            <button onClick={handleCancelClick} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-300">ยกเลิก</button>
          </div>
        ) : (
          <button onClick={handleEditClick} className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition duration-300">แก้ไขข้อมูล</button>
        )}
      </div>
      <hr className="border-t-2 border-yellow-500 mb-6" />
      <div className="flex flex-col md:flex-row" style={{
        maxHeight: '410px',
        overflowY: 'auto',
        minHeight: '410px',
        minWidth: '730px'
      }}>
        <div className="w-full md:w-1/3 flex justify-center mb-10 p-auto relative">
          <img
            src={profilePicture.startsWith('http')
              ? profilePicture
              : `http://localhost:3000/uploads/${profilePicture}`}
            alt="Profile picture"
            className="rounded-full h-40 w-40 object-cover mt-24"
            style={{ opacity: profilePicture ? 1 : 0.3 }}
            onError={(e) => {
              e.currentTarget.src = '/default-profile.png';
            }}
          />
        </div>

        <div className="w-full md:w-2/3 ml-14 mt-12">
        {['name', 'company', 'idCard', 'email', 'phone'].map((field) => (
          <div className="mb-4" key={field}>
            <span className="text-yellow-500 font-bold">{getFieldLabel(field)}</span>
            <span className="ml-4">{data[field as keyof ProfileData]}</span>
          </div>
        ))}

        <div className="mb-4">
          <span className="text-yellow-500 font-bold">{getFieldLabel('startDate')}</span>
          <span className="ml-4">{formattedStartDate}</span>
        </div>

        <div className="mb-4">
          <span className="text-yellow-500 font-bold">วันที่สิ้นสุด:</span>
          {isEditing ? (
            <input
              type="date"
              name="end_date"
              value={editedData.bond_status.end_date}
              onChange={handleInputChange}
              className="ml-4 border rounded px-2 py-1"
            />
          ) : (
            <span className="ml-4">{formattedEndDate}</span>
          )}
        </div>

        <div className="mb-4">
          <span className="text-yellow-500 font-bold">สถานะพันธบัตร:</span>
          {isEditing ? (
            <select
              name="status"
              value={editedData.bond_status.status}
              onChange={handleInputChange}
              className="ml-4 border rounded px-2 py-1"
            >
              <option value="Active">Active</option>
              <option value="Deactive">Deactive</option>
              <option value="Follow">Follow</option>
            </select>
          ) : (
            <span className="ml-4">{data.bond_status.status || 'ยังไม่มีข้อมูล'}</span>
          )}
        </div>

        <div className="mb-4">
          <span className="text-yellow-500 font-bold">อายุสถานะ:</span>
          <span className="ml-4">{ageStatus}</span>
        </div>

        <div className="mb-4">
          <span className="text-yellow-500 font-bold">เวลาที่เหลือจนถึงวันต่ออายุ:</span>
          <span className="ml-4">{renewalDays}</span>
        </div>
      </div>
      </div>
    </div>
  );
};

function getFieldLabel(field: string): string {
  const labels: { [key: string]: string } = {
    name: 'ชื่อ:',
    company: 'บริษัท:',
    idCard: 'รหัสประชาชน:',
    email: 'อีเมล:',
    phone: 'เบอร์โทร:',
    startDate: 'วันที่เริ่มต้น:',
  };
  return labels[field] || field;
}

export default PopUpProfile;

ส่วนนี่คือ backend import express from 'express';

import mongoose from 'mongoose';

import multer from 'multer';

import path from 'path';

import cors from 'cors';

import dotenv from 'dotenv';

import bcrypt from 'bcrypt';

import { Request, Response, NextFunction } from 'express';

import { MongoClient, ObjectId } from 'mongodb';

import jwt from 'jsonwebtoken';

import fs from 'fs';

import nodemailer from 'nodemailer';

import { User, IUser } from './user.model';

import { Admin, IAdmin } from './admin.model';

import { Course, ICourse } from './course.model';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'complex_fallback_secret_for_dev_only';

const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'another_complex_fallback_secret';

let client: MongoClient;

const app = express();

const PORT = process.env.PORT || 3000;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/Uknowmedatabase';

mongoose.connect(MONGODB_URI)

 .then(() => console.log('Connected to MongoDB'))

 .catch((err) => console.error('MongoDB connection error:', err));

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

const uploadsPath = path.join(__dirname, 'uploads');

app.use('/uploads', express.static(uploadsPath));

if (!fs.existsSync(uploadsPath)) {

 fs.mkdirSync(uploadsPath, { recursive: true });

}

declare global {

namespace Express {

interface Request {

 userId?: string;

 }

 }

}

interface CustomRequest extends Request {

 userId?: string;

}

const storage = multer.diskStorage({

 destination: (req, file, cb) => {

 cb(null, uploadsPath);

 },

 filename: (req, file, cb) => {

const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);

 cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));

 },

});

const upload = multer({ storage });

const verifyToken = (req: Request, res: Response, next: NextFunction) => {

const authHeader = req.headers['authorization'];

const token = authHeader && authHeader.split(' ')[1];

if (!token) {

return res.status(403).json({ message: 'No token provided' });

 }

 jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {

if (err) {

 console.error('JWT verification error:', err);

return res.status(401).json({ message: 'Unauthorized', error: err.message });

 }

 (req as CustomRequest).userId = decoded.userId;

 next();

 });

};

client = new MongoClient(MONGODB_URI);

const db = client.db('Uknowmedatabase');

const adminsCollection = db.collection('admins');

app.post('/api/upload-profile-picture', verifyToken, upload.single('profilePicture'), async (req: CustomRequest, res: Response) => {

try {

if (!req.file) {

return res.status(400).json({ message: 'No file uploaded' });

 }

const user = await User.findById(req.userId);

if (!user) {

return res.status(404).json({ message: 'User not found' });

 }

const profilePicturePath = /uploads/${req.file.filename};

const baseUrl = ${req.protocol}://${req.get('host')};

const profilePictureUrl = ${baseUrl}${profilePicturePath};

const updatedUser = await User.findByIdAndUpdate(

 req.userId,

 { $set: { profilePicture: profilePicturePath } },

 { new: true }

 );

if (!updatedUser) {

return res.status(404).json({

 message: 'User not found after update'

 });

 }

 res.json({

 profilePictureUrl,

 user: {

 ...updatedUser.toObject(),

 profilePicture: profilePictureUrl

 }

 });

 } catch (error: any) {

 console.error('Error uploading profile picture:', error);

 res.status(500).json({

 message: 'Server error',

 error: error.message

 });

 }

});app.put('/api/users/me', verifyToken, async (req: CustomRequest, res: Response) => {

 try {

const { name, company, email, phone, profilePicture } = req.body;

const user = await User.findById(req.userId);

if (!user) {

 console.log('User not found');

return res.status(404).json({ message: 'User not found' });

 }

 user.name = name || user.name;

 user.company = company || user.company;

 user.email = email || user.email;

 user.phone = phone || user.phone;

 user.profilePicture = profilePicture || user.profilePicture;

 console.log('User before save:', user);

await user.save();

 console.log('User after save:', user);

 res.json(user);

 } catch (error: any) {

 console.error('Error updating user:', error);

 res.status(500).json({ message: 'Server error', error: error.message });

 }

});