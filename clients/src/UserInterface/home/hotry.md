import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';
import jsPDF from 'jspdf';

interface Course {
  _id: string;
  title: string;
  description: string;
  details: string;
  duration_hours: number;
  max_seats: number;
  registrationDate: string;  // เพิ่ม field นี้
  start_date?: string;      // ทำเป็น optional
  thumbnail: string;
  video: string;
  qr_code: string;
  trainingLocation: string;
  status: string;
  statusDate: string;
}
const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return 'ไม่ระบุ';

  try {
    // แสดง log เพื่อดูค่าที่ได้รับเข้ามา
    console.log('Incoming date string:', dateString);

    const date = new Date(dateString);
    // ตรวจสอบว่าวันที่ถูกต้องหรือไม่
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date string: ${dateString}`);
      return 'ไม่ระบุ';
    }

    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error in formatDate:', error);
    return 'ไม่ระบุ';
  }
};

// ปรับปรุงการตรวจสอบวันที่หมดอายุ
const isTrainingExpired = (dateString: string): boolean => {
  if (!dateString) return false;

  try {
    const timestamp = Date.parse(dateString);
    if (isNaN(timestamp)) {
      console.warn(`Invalid registration date for expiry check: ${dateString}`);
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const trainingDate = new Date(timestamp);
    trainingDate.setHours(0, 0, 0, 0);

    return trainingDate < today;
  } catch (error) {
    console.error('Error checking training expiry:', error, 'Registration date:', dateString);
    return false;
  }
};

interface HistoryCourseProps {
  onClose: () => void;
  onShowProfile: () => void;
  userData: { name: string; email: string; _id: string; trainingLocation: string; };
  courses: Course[];
}

const HistoryCourse: React.FC<HistoryCourseProps> = ({ onClose, onShowProfile, userData, courses: initialCourses }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filter, setFilter] = useState<'all' | 'ongoing' | 'completed'>('all');
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCourseHistory();
  }, [userData._id]);

  const fetchCourseHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token not found');
      }

      const response = await axios.get(`http://localhost:3000/api/user-courses/${userData._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // แสดง log ข้อมูลที่ได้จาก API
      console.log('Raw API response:', response.data);

      const processedCourses = response.data.map((course: Course) => {
        console.log('Processing course:', course);
        return {
          ...course,
          start_date: course.registrationDate, // ใช้ registrationDate แทน start_date
          statusDate: course.statusDate ? new Date(course.statusDate).toISOString() : null
        };
      });

      console.log('Processed courses:', processedCourses); // เพิ่ม log ตรงนี้
      setCourses(processedCourses);
    } catch (error) {
      // ... error handling code ...
    } finally {
      setLoading(false);
    }
  };

  const generateCertification = async (course: Course) => {
    try {
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // Add background image
      const backgroundImg = '/api/placeholder/297/210';
      pdf.addImage(backgroundImg, 'JPEG', 0, 0, 297, 210);

      // Get page dimensions
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Add custom font for Thai language support

      pdf.addFont('THSarabunNew', 'normal', 'normal');
      pdf.addFont('THSarabunNew-Bold', 'bold', 'bold');

      // Certificate title
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(36);
      pdf.setTextColor(44, 62, 80);
      pdf.text("Certificate of Completion", pageWidth / 2, 40, { align: "center" });

      // Decorative line
      pdf.setDrawColor(52, 152, 219);
      pdf.setLineWidth(1);
      pdf.line(40, 50, pageWidth - 40, 50);

      // Certification text
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(52, 73, 94);
      pdf.text("This is to certify that", pageWidth / 2, 70, { align: "center" });

      // Recipient name
      pdf.setFontSize(28);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(41, 128, 185);
      pdf.text(userData.name, pageWidth / 2, 85, { align: "center" });

      // Course completion text
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(52, 73, 94);
      pdf.text("has successfully completed the course", pageWidth / 2, 100, { align: "center" });

      // Format course title with proper Thai font
      pdf.setFontSize(24);
      pdf.setFont("THSarabunNew", "bold");
      pdf.setTextColor(41, 128, 185);

      // Split long course titles into multiple lines if necessary
      const maxWidth = 180;
      const lines = pdf.splitTextToSize(course.title, maxWidth);
      let yPosition = 115;
      lines.forEach((line: string) => {
        pdf.text(line, pageWidth / 2, yPosition, { align: "center" });
        yPosition += 10;
      });

      // Dates in Thai format
      const completedDate = formatDate(course.statusDate);
      const issuedDate = formatDate(new Date().toISOString());

      pdf.setFontSize(14);
      pdf.setFont("THSarabunNew", "normal");
      pdf.setTextColor(52, 73, 94);
      pdf.text(`Completed on: ${completedDate}`, pageWidth / 2, yPosition + 10, { align: "center" });
      pdf.text(`Issued on: ${issuedDate}`, pageWidth / 2, yPosition + 20, { align: "center" });

      // Signatures and positions
      // First signature - Course Instructor
      pdf.setDrawColor(52, 152, 219);
      pdf.setLineWidth(0.5);
      pdf.line(60, pageHeight - 50, 140, pageHeight - 50);
      pdf.setFontSize(12);
      pdf.text("Uknowme Asset", 100, pageHeight - 55, { align: "center" });
      pdf.text("Course Instructor", 100, pageHeight - 40, { align: "center" });

      // Second signature - Academic Director
      pdf.line(pageWidth - 140, pageHeight - 50, pageWidth - 60, pageHeight - 50);
      pdf.text("Phattarapong MD", pageWidth - 100, pageHeight - 55, { align: "center" });
      pdf.text("Academic Director", pageWidth - 100, pageHeight - 40, { align: "center" });

      // Watermark
      pdf.setTextColor(200, 200, 200);
      pdf.setFontSize(60);
      pdf.setGState(pdf.GState({ opacity: 0.2 }));
      pdf.text("Uknowme", pageWidth / 2, pageHeight / 2, {
        align: "center",
        angle: 45
      });

      // Save PDF
      pdf.save(`${userData.name}_${course.title}_certificate.pdf`);
      console.log('PDF generated successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('เกิดข้อผิดพลาดในการสร้าง PDF กรุณาลองใหม่อีกครั้ง');
    }
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filter === 'all' ||
      (filter === 'ongoing' && course.status === 'ongoing') ||
      (filter === 'completed' && course.status === 'completed'))
  );

  const handlePersonalInfoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onShowProfile();
  };

  return (
    <div className="max-w-5xl mx-auto p-4 bg-white rounded-lg shadow-lg mt-10 relative">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        aria-label="Close"
      >
        <X size={24} />
      </button>

      <div className="flex items-center mb-6 bg-white">
        <div className="w-16 h-16 rounded-full bg-yellow-500 flex items-center justify-center text-white text-2xl">
          <i className="fas fa-user"></i>
        </div>
        <div className="ml-4">
          <h1 className="text-xl font-bold">{userData.name}</h1>
          <p className="text-gray-600">{userData.email}</p>
        </div>
      </div>

      <div className="md:flex space-x-4 mb-6 hidden">
        <a href="#" className="text-gray-600 hover:text-black" onClick={handlePersonalInfoClick}>ข้อมูลส่วนตัว</a>
        <a href="#" className="text-orange-500 border-b-2 border-orange-500">หลักสูตรของฉัน</a>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-lg font-bold mb-4">หลักสูตรของฉัน</h2>
        <div className="flex items-center mb-4">
          <input
            type="text"
            placeholder="ค้นหาหลักสูตรของฉัน"
            className="flex-grow p-2 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="ml-2 p-2 bg-gray-200 rounded-lg" onClick={() => setSearchTerm('')}>
            <i className="fas fa-sync-alt"></i>
          </button>
        </div>

        <div className="flex space-x-4 mb-4">
          <button
            className={`flex items-center space-x-2 ${filter === 'all' ? 'text-black' : 'text-gray-600'}`}
            onClick={() => setFilter('all')}
          >
            <span>ทั้งหมด</span>
          </button>
          <button
            className={`flex items-center space-x-2 ${filter === 'ongoing' ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-600'}`}
            onClick={() => setFilter('ongoing')}
          >
            <span>ยังไม่ได้เรียน</span>
            <span className="bg-red-500 text-white rounded-full px-2">{courses.filter(course => course.status === 'ongoing').length}</span>
          </button>
          <button
            className={`flex items-center space-x-2 ${filter === 'completed' ? 'text-green-500 border-b-2 border-green-500' : 'text-gray-600'}`}
            onClick={() => setFilter('completed')}
          >
            <span>เรียนจบแล้ว</span>
            <span className="bg-green-500 text-white rounded-full px-2">{courses.filter(course => course.status === 'completed').length}</span>
          </button>
        </div>

        <div className="space-y-4" style={{
          maxHeight: '300px',
          overflowY: 'auto',
          minHeight: '300px',
          minWidth: '700px'
        }}>
          {loading && <div className="text-center py-4">กำลังโหลดข้อมูล...</div>}
          {error && <div className="text-red-500 text-center py-4">{error}</div>}
          {!loading && !error && filteredCourses.map(course => (
            <div key={course._id} className="flex flex-col md:flex-row items-center bg-white p-4 rounded-lg shadow">
              <img
                src={`http://localhost:3000/uploads/${course.thumbnail}`}
                alt="Course thumbnail"
                className="w-30 h-24 rounded-lg mr-4 mb-4 md:mb-0"
              />
              <div className="flex-grow">
                <h3 className="font-bold">{course.title}</h3>
                <p className="text-gray-600">สถานที่อบรม: {course.trainingLocation || 'สถานที่ฝึกอบรมไม่ระบุ'}</p>
                <p className="text-gray-600">
                  วันที่จัดอบรม: {
                    course.registrationDate ? (
                      formatDate(course.registrationDate)
                    ) : (
                      'ไม่ระบุวันที่จัดอบรม'
                    )
                  }
                  {isTrainingExpired(course.registrationDate) &&
                    <span className="text-red-500 ml-2">(คอร์สสิ้นสุดลงแล้ว)</span>
                  }
                </p>
                <p className={`text-sm ${course.status === 'completed' ? 'text-green-500' : 'text-red-500'}`}>
                  สถานะ: {course.status === 'completed' ? 'เรียนจบแล้ว' : 'ยังไม่ได้เรียน'}
                </p>
                {course.status === 'completed' && course.statusDate && (
                  <p className="text-gray-600">วันจบหลักสูตร: {formatDate(course.statusDate)}</p>
                )}
              </div>
              <button
                onClick={() => generateCertification(course)}
                className={`p-2 rounded-lg ${course.status === 'completed'
                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                disabled={course.status !== 'completed'}
              >
                ดาวน์โหลด
              </button>
            </div>
          ))}
          {!loading && !error && filteredCourses.length === 0 && (
            <div className="text-center py-4 text-gray-500">ไม่พบข้อมูลหลักสูตร</div>
          )}
        </div>
      </div>
    </div>
  );
};


export default HistoryCourse;