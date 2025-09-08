import React from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

interface DeletedPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  courseTitle: string;
  jwtToken?: string;
  id?: string;
}

const DeletedPopup: React.FC<DeletedPopupProps> = ({ isOpen, onClose, onConfirm, courseTitle, jwtToken, id }) => {
  React.useEffect(() => {
    if (isOpen) {
      showDeleteConfirmation();
    }
  }, [isOpen, courseTitle, onClose, onConfirm]);

  const showDeleteConfirmation = () => {
    MySwal.fire({
      title: 'ยืนยันการลบคอร์ส',
      html: `คุณแน่ใจหรือไม่ว่าต้องการลบคอร์ส <strong>"${courseTitle}"</strong>?<br />การดำเนินการนี้ไม่สามารถย้อนกลับได้`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ยืนยันการลบ',
      cancelButtonText: 'ยกเลิก',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        handleConfirm();
      } else {
        onClose();
      }
    });
  };

  const handleConfirm = async () => {
    const token = jwtToken || localStorage.getItem('token');
    if (!token) {
      console.error('No authentication token found');
      MySwal.fire({
        title: 'ข้อผิดพลาด',
        text: 'ต้องการการยืนยันตัวตนเพื่อดำเนินการนี้',
        icon: 'error',
      });
      return;
    }
    console.log('JWT Token for deletion:', token);
    
    try {
      await onConfirm();
      // Show success message
      MySwal.fire({
        title: 'สำเร็จ',
        text: `คอร์ส "${courseTitle}" ถูกลบเรียบร้อยแล้ว`,
        icon: 'success',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'ตกลง',
      });
    } catch (error) {
      console.error('Error deleting course:', error);
      MySwal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถลบคอร์สได้ กรุณาลองใหม่อีกครั้ง',
        icon: 'error',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'ตกลง',
      });
    }
  };

  return null;
};

export default DeletedPopup;