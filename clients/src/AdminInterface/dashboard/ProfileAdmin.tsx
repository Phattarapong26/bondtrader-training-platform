import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { getToken, clearTokens } from '../../hooks/tokenStorage';
import { useNavigate } from 'react-router-dom';

interface ProfileData {
  _id: string;
  name: string;
  employeeId: string;
  phone: string;
  email: string;
}

interface PopProfileProps {
  data: ProfileData;
  onClose: () => void;
}

const ProfileAdmin: React.FC<PopProfileProps> = ({ data, onClose }) => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedData, setEditedData] = useState<ProfileData>(data);
  const navigate = useNavigate();

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    try {
      const token = getToken();
      if (!token) {
        console.error('Token not found');
        clearTokens();
        navigate('/login');
        return;
      }
  
      const response = await axios.put('http://localhost:3000/api/Admin/UpdateDetail/Profile/yourself', editedData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
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
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        clearTokens();
        navigate('/login');
        return;
      }
  
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถอัปเดตข้อมูลได้',
      });
    }
  };

  const handleCancelClick = () => {
    setEditedData(data);
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const renderField = (field: keyof ProfileData, label: string) => {
    const isEditable = ['name', 'phone', 'email'].includes(field); // Removed 'employeeId' from editable fields
    return (
      <div className="mb-4" key={field}>
        <span className="text-yellow-500 font-bold">{label}</span>
        {isEditing && isEditable ? (
          <input
            type="text"
            name={field}
            value={editedData[field] || ''}
            onChange={handleInputChange}
            className="ml-4 border rounded px-2 py-1"
          />
        ) : (
          <span className="ml-4">{data[field] || 'N/A'}</span>
        )}
      </div>
    );
  };

  return (
    <div id="profile-admin-container" className="max-w-5xl mx-auto p-4 bg-white rounded-lg shadow-lg mt-10 relative">
      <button
        id="close-profile-btn"
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
      >
        <i className="fas fa-times"></i>
      </button>
      <div id="profile-header" className="flex items-center mb-6">
        <div id="profile-avatar" className="w-16 h-16 rounded-full bg-yellow-500 flex items-center justify-center text-white text-2xl">
          <i className="fas fa-user"></i>
        </div>
        <div id="profile-info" className="ml-4">
          <h1 id="profile-name" className="text-xl font-bold">{data.name}</h1>
          <p id="profile-email" className="text-gray-600">{data.email}</p>
        </div>
      </div>

      <nav id="profile-nav" className="flex justify-between items-center border-b pb-4 mb-6">
        <div id="nav-desktop" className="flex space-x-4 hidden md:flex">
          <a id="personal-info-link" href="#" className="text-yellow-500"><i className="fas fa-user"></i> ข้อมูลส่วนตัว</a>
        </div>
        <div id="nav-mobile" className="md:hidden">
          <button id="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} className="text-gray-500 hover:text-yellow-500">
            <i className="fas fa-bars"></i>
          </button>
        </div>
      </nav>
      {menuOpen && (
        <div id="mobile-menu" className="flex flex-col space-y-4 mb-6 md:hidden">
          <a id="mobile-personal-info" href="#" className="text-yellow-500"><i className="fas fa-user"></i> ข้อมูลส่วนตัว</a>
        </div>
      )}
      <div id="profile-actions" className="flex justify-between items-center mb-6">
        <h1 id="profile-title" className="text-2xl font-bold text-yellow-500">ข้อมูลส่วนตัว</h1>
        {isEditing ? (
          <div id="edit-actions">
            <button id="save-btn" onClick={handleSaveClick} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-300 mr-2">บันทึก</button>
            <button id="cancel-btn" onClick={handleCancelClick} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-300">ยกเลิก</button>
          </div>
        ) : (
          <button id="edit-btn" onClick={handleEditClick} className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition duration-300">แก้ไขข้อมูล</button>
        )}
      </div>
      <hr id="profile-divider" className="border-t-2 border-yellow-500 mb-6" />
      <div id="profile-content" className="flex flex-col md:flex-row" style={{
        maxHeight: '410px',
        overflowY: 'auto',
        minHeight: '410px',
        minWidth: '730px'
      }}>
        <div id="profile-fields" className="w-full md:w-2/3 ml-14 mt-12">
          {renderField('name', 'ชื่อ:')}
          {renderField('employeeId', 'รหัสพนักงาน:')}
          {renderField('phone', 'เบอร์โทร:')}
          {renderField('email', 'อีเมล:')}
        </div>
      </div>
    </div>
  );
};

export default ProfileAdmin;