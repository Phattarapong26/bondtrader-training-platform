import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Sidebar from '../../Components/Sidebar';
import HeaderAdmin from './HeadAdmin';
import CustomerCard from './CustomerCard';
import StatsSection from './StatsSection';
import CourseSliderAdmin from './CourseSliderAdmin';
import { MainProfile } from './MainProfile';
import { Search } from 'lucide-react';
import { getToken, setToken } from '../../hooks/tokenStorage';

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
}

interface DashboardStats {
  totalDealers: number;
  activeDealers: number;
  inactiveDealers: number;
  deactiveDealers: number;
}

const AdminDashboard: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalDealers: 0,
    activeDealers: 0,
    inactiveDealers: 0,
    deactiveDealers: 0,
  });
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showMainProfile, setShowMainProfile] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const token = getToken();
      if (!token) {
        console.error('Token not found');
        return;
      }
      const response = await axios.get<Customer[]>('http://localhost:3000/api/Admin/Get/users', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setCustomers(response.data);
      calculateStats(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          try {
            const refreshTokenResponse = await axios.post('http://localhost:3000/api/refresh-token', {
              token: getToken(),
            });
            const newToken = refreshTokenResponse.data.token;
            setToken(newToken);
            fetchCustomers();
          } catch (refreshError) {
            console.error('Error refreshing token:', refreshError);
            alert("Session expired. Please log in again.");
          }
        } else {
          alert(`Failed to fetch customer data: ${error.message}`);
        }
      } else {
        alert("An unexpected error occurred. Please try again later.");
      }
    }
  };

  const calculateStats = (data: Customer[]) => {
    const newStats: DashboardStats = {
      totalDealers: data.length,
      activeDealers: data.filter(user => user.bond_status?.status === 'active').length,
      inactiveDealers: data.filter(user => user.bond_status?.status === 'inactive').length,
      deactiveDealers: data.filter(user => user.bond_status?.status === 'deactive').length,
    };
    setStats(newStats);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, customers]);

  const handleViewAll = (category: string) => {
    console.log(`View all ${category}`);
  };

  const handleCustomerDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowMainProfile(true);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleCloseMainProfile = () => {
    setShowMainProfile(false);
    setSelectedCustomer(null);
  };

  const CustomersList: React.FC = () => (
    <div id="customers-grid">
      {customers.length > 0 ? (
        <div id="customers-list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCustomers.map(customer => (
            <CustomerCard
              key={customer._id}
              customer={customer}
              onViewDetails={() => handleCustomerDetails(customer)}
            />
          ))}
        </div>
      ) : (
        <p id="loading-text">Loading...</p>
      )}
    </div>
  );

  return (
    <div id="admin-dashboard-container" className="flex h-screen overflow-hidden bg-gray-100 ">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <main id="main-content" className="flex-1 overflow-y-auto">
        <HeaderAdmin
          toggleDropdown={toggleDropdown}
          dropdownOpen={dropdownOpen}
        />
        <div id="content-wrapper" className="flex-1 overflow-y-auto bg-white mt-2 ml-2 border-t border-gray-200 p-8 rounded-tl-lg h-[100%]">
          <StatsSection stats={stats} handleViewAll={handleViewAll} />
          <CourseSliderAdmin/>
          <div id="header-section" className="flex gap-10 mt-4 mb-4 border-b border-gray-200">
            <h1 id="page-title" className="text-2xl font-semibold text-gray-500 mb-4">รายชื่อผู้ค้าตราสารหนี้</h1>
            <div id="search-container" className="relative flex-grow">
              <Search id="search-icon" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                id="search-input"
                className="pl-10 pr-4 py-2 w-full max-w-md mb-3 border rounded-lg"
                placeholder="ค้นหาผู้ค้าตราสารหนี้"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>
          <CustomersList />
        </div>
      </main>
      {showMainProfile && selectedCustomer && (
        <div id="profile-modal" className="fixed inset-0 bg-gray-500 bg-opacity-75 z-50">
          <MainProfile
            userData={selectedCustomer}
            onClose={handleCloseMainProfile}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          />
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;