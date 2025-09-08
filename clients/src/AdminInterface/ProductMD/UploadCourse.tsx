import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { PlusCircle, X } from 'lucide-react';

const API_CONFIG = {
  baseUrl: 'http://localhost:3000',
  coursesEndpoint: '/api/Admin/Add/NewCourses',
};

interface CourseUploadPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (courseData: CourseData) => Promise<void>;
  id?: string;
}

interface CourseData {
  title: string;
  description: string;
  details: string;
  duration_hours: number;
  max_seats: number;
  start_date: string;
  thumbnail: File | null;
  video: File | null;
  qr_code: File | null; 
  trainingLocation: string; 
}

const CourseUploadPopup: React.FC<CourseUploadPopupProps> = ({ isOpen, onClose, onSubmit, id }) => {
  const [courseData, setCourseData] = useState<CourseData>({
    title: '',
    description: '',
    details: '',
    duration_hours: 0,
    max_seats: 0,
    start_date: '',
    thumbnail: null,
    video: null,
    qr_code: null, 
    trainingLocation: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCourseData({ ...courseData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      setCourseData({ ...courseData, [name]: files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      Object.entries(courseData).forEach(([key, value]) => {
        if (value !== null) {
          formData.append(key, value);
        }
      });

      // Get the JWT token from localStorage
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post(`${API_CONFIG.baseUrl}${API_CONFIG.coursesEndpoint}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      });

      onSubmit(response.data);
      onClose();
      Swal.fire({
        icon: 'success',
        title: 'เพิ่มคอร์สสำเร็จ',
        showConfirmButton: false,
        timer: 1500,
      }).then(() => {
        window.location.reload();
      });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(`เกิดข้อผิดพลาด: ${err.response?.status} ${err.response?.statusText}`);
        console.error('Error uploading course:', err.response?.data);
      } else {
        setError('เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ กรุณาลองใหม่อีกครั้ง');
        console.error('Unexpected error:', err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div id={`upload-modal-overlay-${id}`} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div id={`upload-modal-content-${id}`} className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
        <div id={`upload-modal-header-${id}`} className="flex justify-between items-center p-6 bg-gray-100">
          <h2 id={`upload-modal-title-${id}`} className="text-2xl font-semibold text-gray-800">อัพโหลดคอร์สใหม่</h2>
          <button id={`upload-modal-close-${id}`} onClick={onClose} className="text-gray-600 hover:text-gray-800">
            <X size={24} />
          </button>
        </div>
        {error && <div id={`upload-modal-error-${id}`} className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">{error}</div>}
        <form id={`upload-form-${id}`} onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor={`title-${id}`} className="block text-sm font-medium text-gray-700">ชื่อคอร์ส</label>
              <input
                type="text"
                id={`title-${id}`}
                name="title"
                value={courseData.title}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label htmlFor={`description-${id}`} className="block text-sm font-medium text-gray-700">คำอธิบายคอร์ส</label>
              <textarea
                id={`description-${id}`}
                name="description"
                value={courseData.description}
                onChange={handleInputChange}
                required
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label htmlFor={`details-${id}`} className="block text-sm font-medium text-gray-700">รายละเอียดคอร์ส</label>
              <textarea
                id={`details-${id}`}
                name="details"
                value={courseData.details}
                onChange={handleInputChange}
                required
                rows={5}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label htmlFor={`trainingLocation-${id}`} className="block text-sm font-medium text-gray-700">สถานที่อบรม</label>
              <input
                type="text"
                id={`trainingLocation-${id}`}
                name="trainingLocation"
                value={courseData.trainingLocation}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor={`duration_hours-${id}`} className="block text-sm font-medium text-gray-700">ระยะเวลาคอร์ส (ชั่วโมง)</label>
                <input
                  type="number"
                  id={`duration_hours-${id}`}
                  name="duration_hours"
                  value={courseData.duration_hours}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label htmlFor={`max_seats-${id}`} className="block text-sm font-medium text-gray-700">จำนวนที่นั่งสูงสุด</label>
                <input
                  type="number"
                  id={`max_seats-${id}`}
                  name="max_seats"
                  value={courseData.max_seats}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
            </div>
            <div>
              <label htmlFor={`start_date-${id}`} className="block text-sm font-medium text-gray-700">วันที่เริ่มคอร์ส</label>
              <input
                type="date"
                id={`start_date-${id}`}
                name="start_date"
                value={courseData.start_date}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label htmlFor={`thumbnail-${id}`} className="block text-sm font-medium text-gray-700">อัพโหลดรูปภาพหน้าปก</label>
              <input
                type="file"
                id={`thumbnail-${id}`}
                name="thumbnail"
                onChange={handleFileChange}
                accept="image/*"
                required
                className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100"
              />
            </div>
            <div>
              <label htmlFor={`video-${id}`} className="block text-sm font-medium text-gray-700">อัพโหลดวิดีโอ</label>
              <input
                type="file"
                id={`video-${id}`}
                name="video"
                onChange={handleFileChange}
                accept="video/*"
                required
                className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100"
              />
            </div>
            <div>
              <label htmlFor={`qr_code-${id}`} className="block text-sm font-medium text-gray-700">อัพโหลด QR Code</label>
              <input
                type="file"
                id={`qr_code-${id}`}
                name="qr_code"
                onChange={handleFileChange}
                accept="image/*"
                required
                className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button
              id={`cancel-btn-${id}`}
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              ยกเลิก
            </button>
            <button
              id={`upload-btn-${id}`}
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  กำลังอัพโหลด...
                </>
              ) : (
                <>
                  <PlusCircle className="mr-2" size={20} />
                  อัพโหลดคอร์ส
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseUploadPopup;
