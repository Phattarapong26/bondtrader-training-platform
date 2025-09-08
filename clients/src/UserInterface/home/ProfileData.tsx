import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { ProfileData, PopProfileProps } from "./interfaces/allInterface";
import { getToken } from '../../hooks/tokenStorage';

const API_URL = "http://localhost:3000";
const DEFAULT_PROFILE_PIC = "/default-profile.png";

const PopProfile: React.FC<PopProfileProps> = ({
  data,
  onClose,
  onShowHistoryCourse,
}) => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedData, setEditedData] = useState<ProfileData>(data);
  const [formattedDates, setFormattedDates] = useState({
    startDate: "--",
    endDate: "--",
    age: "ยังไม่ได้รับสถานะ",
    daysUntilRenewal: "--",
  });

  const getProfilePictureUrl = (picture?: string): string => {
    if (!picture) return DEFAULT_PROFILE_PIC;
    if (picture.startsWith('data:')) return picture;
    if (picture.startsWith('http')) return picture;
    return `${API_URL}/uploads/${picture}`;
  };

  const [profilePicture, setProfilePicture] = useState<string>(() => {
    const storedPicture = localStorage.getItem("profilePicture");
    const defaultPicture = data?.profilePicture || "";

    if (storedPicture) return getProfilePictureUrl(storedPicture);
    if (defaultPicture) return getProfilePictureUrl(defaultPicture);
    
    return DEFAULT_PROFILE_PIC;
  });

  const [imageError, setImageError] = useState(false);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);

  useEffect(() => {
    updateDateInformation(data);
  }, [data]);

  useEffect(() => {
    const loadProfilePicture = async () => {
      try {
        const token = getToken();
        if (!token) throw new Error('Authentication token not found');
  
        const response = await axios.get(`${API_URL}/api/user/profile-picture/${data.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
  
        const picUrl = response.data.profilePicture || DEFAULT_PROFILE_PIC;
        
        // Log the received URL for debugging
        console.log('Received profile picture URL:', picUrl);
  
        // Validate and clean URL
        if (!picUrl || picUrl === DEFAULT_PROFILE_PIC) {
          setProfilePicture(DEFAULT_PROFILE_PIC);
          return;
        }
  
        // Construct a valid URL
        const validUrl = picUrl.startsWith('http') 
          ? picUrl 
          : `${API_URL}/uploads/${picUrl.replace(/^\/+/, '')}`;
  
        // Validate URL
        try {
          new URL(validUrl);
        } catch (urlError) {
          console.error('Invalid URL:', validUrl);
          setProfilePicture(DEFAULT_PROFILE_PIC);
          return;
        }
        
        // Attempt to load image
        const img = new Image();
        img.onload = () => {
          setProfilePicture(validUrl);
          setImageError(false);
        };
        img.onerror = () => {
          console.error('Failed to load image:', validUrl);
          setProfilePicture(DEFAULT_PROFILE_PIC);
          setImageError(true);
        };
        img.src = validUrl;
  
      } catch (error) {
        console.error("Failed to load profile picture:", error);
        setImageError(true);
        setProfilePicture(DEFAULT_PROFILE_PIC);
      }
    };
  
    loadProfilePicture();
  }, [data.id]);

  const updateDateInformation = async (currentData: ProfileData) => {
    try {
      const [startDateResponse, endDateResponse, ageResponse, renewalResponse] =
        await Promise.all([
          axios.post("http://localhost:3000/api/format", {
            dateString: currentData.startDate,
          }),
          axios.post("http://localhost:3000/api/format", {
            dateString: currentData.endDate,
          }),
          axios.post("http://localhost:3000/api/calculateAge", {
            startDate: currentData.startDate,
          }),
          axios.post("http://localhost:3000/api/daysUntilRenewal", {
            endDate: currentData.endDate,
          }),
        ]);

      setFormattedDates({
        startDate: startDateResponse.data.formattedDate,
        endDate: endDateResponse.data.formattedDate,
        age: ageResponse.data.age,
        daysUntilRenewal: renewalResponse.data.daysUntilRenewal,
      });
    } catch (error) {
      console.error("Error fetching date information:", error);
      setFormattedDates({
        startDate: "ไม่สามารถโหลดข้อมูลได้",
        endDate: "ไม่สามารถโหลดข้อมูลได้",
        age: "ไม่สามารถโหลดข้อมูลได้",
        daysUntilRenewal: "ไม่สามารถโหลดข้อมูลได้",
      });
    }
  };

  const handleImageError = () => {
    console.error("Error loading profile picture:", profilePicture);
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
      const token = getToken();
      if (!token) throw new Error("Authentication token not found.");
  
      let updatedData = { ...editedData };
  
      if (profilePictureFile) {
        const formData = new FormData();
        formData.append("profilePicture", profilePictureFile);
  
        const uploadResponse = await axios.post(
          `${API_URL}/api/User/update/profile`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );
  
        updatedData.profilePicture = uploadResponse.data.profilePictureUrl;
      }
  
      const response = await axios.put(
        `${API_URL}/api/User/updateDetail`,
        updatedData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      setIsEditing(false);
      setEditedData(response.data);
      updateDateInformation(response.data);
  
      if (response.data.profilePicture) {
        localStorage.setItem("profilePicture", response.data.profilePicture);
        setProfilePicture(getProfilePictureUrl(response.data.profilePicture));
      }
  
      Swal.fire({
        icon: "success",
        title: "Profile updated successfully!",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error: any) {
      console.error("Error saving data:", error.response?.data || error.message);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: error.response?.data?.message || "Could not update profile.",
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
    setProfilePicture(getProfilePictureUrl(data.profilePicture || DEFAULT_PROFILE_PIC));
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedData((prevData) => ({ ...prevData, [name]: value }));
  };

  const renderField = (field: keyof ProfileData, label: string) => {
    const isEditable = ["name", "company", "email", "phone"].includes(field);
    const displayValue =
      formattedDates[field as keyof typeof formattedDates] ||
      data[field] ||
      "--";

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
    <div id="profile-container" className="max-w-5xl mx-auto p-4 bg-white rounded-lg shadow-lg mt-10 relative">
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
        <div id="desktop-nav" className="hidden md:flex space-x-4">
          <a id="personal-info-link" href="#" className="text-yellow-500">
            <i className="fas fa-user"></i> ข้อมูลส่วนตัว
          </a>
          <a
            id="my-courses-link"
            href="#"
            className="text-gray-500 hover:text-yellow-500"
            onClick={handleMyCourseClick}
          >
            <i className="fas fa-book"></i> หลักสูตรของฉัน
          </a>
        </div>
        <div id="mobile-menu-btn" className="md:hidden">
          <button
            id="toggle-menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-gray-500 hover:text-yellow-500"
          >
            <i className="fas fa-bars"></i>
          </button>
        </div>
      </nav>
      {menuOpen && (
        <div id="mobile-menu" className="flex flex-col space-y-4 mb-6 md:hidden">
          <a id="mobile-personal-info-link" href="#" className="text-yellow-500">
            <i className="fas fa-user"></i> ข้อมูลส่วนตัว
          </a>
          <a
            id="mobile-my-courses-link"
            href="#"
            className="text-gray-500 hover:text-yellow-500"
            onClick={handleMyCourseClick}
          >
            <i className="fas fa-book"></i> หลักสูตรของฉัน
          </a>
        </div>
      )}
      <div id="profile-actions" className="flex justify-between items-center mb-6">
        <h1 id="profile-section-title" className="text-2xl font-bold text-yellow-500">ข้อมูลส่วนตัว</h1>
        {isEditing ? (
          <div id="edit-actions">
            <button
              id="save-profile-btn"
              onClick={handleSaveClick}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-300 mr-2"
            >
              บันทึก
            </button>
            <button
              id="cancel-edit-btn"
              onClick={handleCancelClick}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-300"
            >
              ยกเลิก
            </button>
          </div>
        ) : (
          <button
            id="edit-profile-btn"
            onClick={handleEditClick}
            className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition duration-300"
          >
            แก้ไขข้อมูล
          </button>
        )}
      </div>
      <hr id="profile-divider" className="border-t-2 border-yellow-500 mb-6" />
      <div
        id="profile-content"
        className="flex flex-col md:flex-row"
        style={{
          maxHeight: "410px",
          overflowY: "auto",
          minHeight: "410px",
          minWidth: "730px",
        }}
      >
        <div id="profile-picture-section" className="w-full md:w-1/3 flex justify-center mb-10 p-auto relative">
          <img
            id="profile-picture"
            src={profilePicture}
            alt="Profile picture"
            className="rounded-full h-40 w-40 object-cover mt-24"
            onError={handleImageError}
          />

          {isEditing && (
            <label id="profile-picture-upload" className="absolute inset-0 flex items-center justify-center cursor-pointer">
              <input
                id="profile-picture-input"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <div id="upload-icon" className="bg-yellow-500 rounded-full h-12 w-12 flex items-center justify-center shadow-lg">
                <i className="fas fa-camera text-white text-lg"></i>
              </div>
            </label>
          )}
        </div>
        <div id="profile-details" className="w-full md:w-2/3 ml-14 mt-12">
          {renderField("name", "ชื่อ:")}
          {renderField("company", "บริษัท:")}
          {renderField("idCard", "รหัสประชาชน:")}
          {renderField("email", "อีเมล:")}
          {renderField("phone", "เบอร์โทร:")}
          {renderField("startDate", "วันที่เริ่มต้น:")}
          {renderField("endDate", "วันที่สิ้นสุด:")}
          {renderField("bond_status", "สถานะพันธบัตร:")}

          <div id="bond-age" className="mb-4">
            <span className="text-yellow-500 font-bold">อายุสถานะ:</span>
            <span className="ml-4">{formattedDates.age}</span>
          </div>
          <div id="renewal-time" className="mb-4">
            <span className="text-yellow-500 font-bold">
              เวลาที่เหลือจนถึงวันต่ออายุ:
            </span>
            <span className="ml-4">{formattedDates.daysUntilRenewal}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopProfile;