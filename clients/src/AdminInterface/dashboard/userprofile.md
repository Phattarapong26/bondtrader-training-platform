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
  data: {
    _id: string;
    citizen_id: string;
    name?: string;
    email?: string;
    company?: string;
    phone?: string;
    idCard?: string;
    bond_status?: {
      start_date: string;
      end_date: string;
      status: string;
    };
  };
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
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [editedData, setEditedData] = useState<ProfileData | null>(null);
  const [profilePicture, setProfilePicture] = useState<string>('');
  const [formattedStartDate, setFormattedStartDate] = useState<string>('');
  const [formattedEndDate, setFormattedEndDate] = useState<string>('');
  const [ageStatus, setAgeStatus] = useState<string>('');
  const [renewalDays, setRenewalDays] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchUserDetails();
  }, [data._id]);

  const fetchUserDetails = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token not found');
      }

      const response = await axios.get(`http://localhost:3000/api/Admin/Get/user/${data._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const userData = response.data;
      const profileData: ProfileData = {
        id: userData._id,
        name: userData.name,
        idCard: userData.citizen_id,
        startDate: userData.created_at,
        bond_status: {
          start_date: userData.bond_status?.start_date || '',
          end_date: userData.bond_status?.end_date || '',
          status: userData.bond_status?.status || ''
        },
        profilePicture: userData.profilePicture || '',
        company: userData.company,
        email: userData.email,
        phone: userData.phone
      };

      setProfileData(profileData);
      setEditedData(profileData);
      setProfilePicture(profileData.profilePicture);

      // Fetch additional date-related information
      await Promise.all([
        fetchFormattedDates(profileData),
        fetchAgeStatus(profileData),
        fetchRenewalDays(profileData)
      ]);

      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching user details:', error);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้',
      });
      setIsLoading(false);
    }
  };

  const fetchFormattedDates = async (data: ProfileData) => {
    try {
      if (data.bond_status?.start_date) {
        const startDateResponse = await axios.post<DateResponse>('http://localhost:3000/api/format', {
          dateString: data.bond_status.start_date
        });
        setFormattedStartDate(startDateResponse.data.formattedDate);
      } else {
        setFormattedStartDate('ยังไม่ได้รับสถานะ');
      }

      if (data.bond_status?.end_date) {
        const endDateResponse = await axios.post<DateResponse>('http://localhost:3000/api/format', {
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

  const fetchAgeStatus = async (data: ProfileData) => {
    try {
      if (data.bond_status?.start_date) {
        const response = await axios.post<AgeResponse>('http://localhost:3000/api/calculateAge', {
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

  const fetchRenewalDays = async (data: ProfileData) => {
    try {
      if (data.bond_status?.end_date && data.bond_status.end_date.trim() !== '') {
        const response = await axios.post<RenewalResponse>('http://localhost:3000/api/daysUntilRenewal', {
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
      if (!token || !editedData) {
        console.error('Token not found or no data to save');
        return;
      }

      const response = await axios.put(`http://localhost:3000/api/Admin/Update/users/Status&EndDate/${editedData.id}`, {
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
    if (profileData) {
      setEditedData(profileData);
      setProfilePicture(profileData.profilePicture);
    }
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (editedData) {
      setEditedData(prevData => ({
        ...prevData!,
        bond_status: {
          ...prevData!.bond_status,
          [name]: value
        }
      }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="text-center text-red-500">
        ไม่สามารถโหลดข้อมูลผู้ใช้ได้
      </div>
    );
  }

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
              <span className="ml-4">{profileData[field as keyof ProfileData]}</span>
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
            {isEditing && editedData ? (
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