export interface Course {
    _id: string;
    title: string;
    description: string;
    details: string;
    duration_hours: number;
    registrationDate: string;
    max_seats: number;
    start_date: string;
    thumbnail: string;
    video: string;
    status: string;
    statusDate: string;
  }


  export interface User {
    courses_enrolled: Array<{
      course_id: string;
      status: string;
      progress: number;
      start_date: string;
      completion_date: string;
    }>;
  }

  export interface Customer {
    _id: string;
    name: string;
    citizen_id: string;
    created_at: string;
    updated_at: string;
    // bond_status?: { status?: string };
    bond_status: {
        status: string;
        start_date: string;
        end_date: string;
      };
    company: string;
    email: string;
    phone: string;
    // profilePicture?: string;
    profilePicture?: string;
  }

  export interface Props {
    customer: Customer;
    onViewDetails: (customer: Customer) => void;
  }

  export interface AdminUser {
    _id: string;
    name: string;
    email: string;
    idCard: string;
    employeeId: string;
    phone: string;
    roles: string[];
  }
  
  export interface HeaderProps {
    toggleDropdown: () => void;
    dropdownOpen: boolean;
  }


  
  export interface HistoryCourseProps {
    onClose: () => void;
    onShowProfile: () => void;
    userData: { name: string; email: string; _id: string; };
    courses: Course[];
  }


  
  export interface CourseData {
    _id: string;
    title: string;
    registrationDate: string;
    status: string;
    statusDate: string;
    thumbnail: string;
  }
  
  export interface MainProfileProps {
    userData: Customer;
    onClose: () => void;
    className?: string;
  }

  export interface ProfileData {
    _id: string;
    id: string;
    name: string;
    employeeId: string;
    phone: string;
    email: string;
    startDate: string;
    idCard: string;
    profilePicture: string;
    endDate: string;
    company: string;
    bond_status: {
        start_date: string;
        end_date: string;
        status: string;
      };
  }

  export interface PopProfileProps {
    data: ProfileData;
    onClose: () => void;
    onShowHistoryCourse: () => void;
  }
  
  export interface DateResponse {
    formattedDate: string;
  }
  
  export interface AgeResponse {
    age: string;
  }
  
  export interface RenewalResponse {
    daysUntilRenewal: string;
  }

  export interface DashboardStats {
    totalDealers: number;
    activeDealers: number;
    inactiveDealers: number;
    deactiveDealers: number;
  }
  
  export interface StatCardProps {
    icon: any;
    title: string;
    value: string;
    onViewAll?: () => void;
  }


