export interface ProfileData {
  id: string;
  name: string;
  idCard: string;
  startDate: string;
  endDate: string;
  bond_status: string;
  profilePicture?: string;
  company: string;
  email: string;
  phone: string;
}

export interface PopProfileProps {
  data: ProfileData;
  onClose: () => void;
  onShowHistoryCourse: () => void;
}
export interface Course {
  _id: string;
  title: string;
  description: string;
  duration_hours: number;
  start_date: string;
  thumbnail: string;
}

export interface User {
  name: string;
  email: string;
}