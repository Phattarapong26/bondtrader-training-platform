import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../../Components/Sidebar';
import HeaderAdmin from '../dashboard/HeadAdmin';
import { MainProfile } from '../dashboard/MainProfile';
import { Edit, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../utils/api';

interface User {
  _id: string;
  name: string;
  citizen_id: string;
  created_at: string;
  updated_at: string;
  bond_status: {
    status: string;
    start_date: string;
    end_date: string;
  };
  company: string;
  email: string;
  phone: string;
}

const DataBondTrade: React.FC = () => {
  const location = useLocation();
  const initialCategory = location.state?.category || 'all';
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);
  const [showMainProfile, setShowMainProfile] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'deactive'>(initialCategory);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const ITEMS_PER_PAGE = 10;

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  useEffect(() => {
    fetchUsers();
  }, [statusFilter]);

  const fetchUsers = async () => {
    try {
      const response = await api.get<User[]>('/user/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('ไม่สามารถโหลดข้อมูลผู้ใช้ได้ กรุณาลองใหม่อีกครั้ง');
    }
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleStatusFilter = (status: 'all' | 'active' | 'inactive' | 'deactive') => {
    setStatusFilter(status);
    setCurrentPage(1); // Reset to first page when changing filter
  };

  const formatDateToThai = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', options);
  };

  const isExpired = (endDate: string): boolean => {
    if (!endDate) return false;
    const today = new Date();
    const expiry = new Date(endDate);
    return expiry < today;
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // ตรวจสอบสถานะตามตัวกรอง
      let statusMatch = true;
      if (statusFilter !== 'all') {
        if (statusFilter === 'active') {
          statusMatch = user.bond_status.status === 'active' && !isExpired(user.bond_status.end_date);
        } else if (statusFilter === 'inactive') {
          statusMatch = user.bond_status.status === 'inactive';
        } else if (statusFilter === 'deactive') {
          statusMatch = user.bond_status.status === 'deactive';
        }
      }
      
      const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase());
      return statusMatch && matchesSearch;
    });
  }, [statusFilter, users, searchQuery]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const currentUsers = filteredUsers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleViewUserDetails = (user: User) => {
    setSelectedCustomer(user);
    setShowMainProfile(true);
  };

  const handleCloseMainProfile = () => {
    setShowMainProfile(false);
    setSelectedCustomer(null);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  return (
    <div id="bond-trade-container" className="flex h-screen overflow-hidden bg-gray-100">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <main id="main-content" className="flex-1 overflow-y-auto">
        <HeaderAdmin toggleDropdown={toggleDropdown} dropdownOpen={dropdownOpen} />
        <div id="content-wrapper" className="flex-1 overflow-y-auto bg-white mt-2 ml-2 border-t border-gray-200 p-8 rounded-tl-lg h-full">
          <div id="header-section" className="flex justify-between mb-4 border-b pb-7">
            <h1 id="page-title" className="text-2xl font-semibold text-gray-700">รายชื่อผู้ค้าตราสารหนี้</h1>
            <div id="filter-section" className="flex items-center space-x-2">
              <input
                id="search-input"
                type="text"
                placeholder="ค้นหา..."
                className="border border-gray-300 p-2 pl-4 rounded-[20px] shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-[300px]"
                value={searchQuery}
                onChange={handleSearch}
              />
              <button
                id="active-filter"
                className={`px-4 py-2 rounded-[20px] transition-colors duration-200 ease-in-out ${statusFilter === 'active' ? 'bg-yellow-500 text-white' : 'bg-gray-500 text-white hover:bg-gray-300'}`}
                onClick={() => handleStatusFilter('active')}
              >
                Active
              </button>
              <button
                id="inactive-filter"
                className={`px-4 py-2 rounded-[20px] transition-colors duration-200 ease-in-out ${statusFilter === 'inactive' ? 'bg-yellow-500 text-white' : 'bg-gray-500 text-white hover:bg-gray-300'}`}
                onClick={() => handleStatusFilter('inactive')}
              >
                Inactive
              </button>
              <button
                id="deactive-filter"
                className={`px-4 py-2 rounded-[20px] transition-colors duration-200 ease-in-out ${statusFilter === 'deactive' ? 'bg-yellow-500 text-white' : 'bg-gray-500 text-white hover:bg-gray-300'}`}
                onClick={() => handleStatusFilter('deactive')}
              >
                Deactive
              </button>
              <button
                id="all-filter"
                className={`px-4 py-2 rounded-[20px] transition-colors duration-200 ease-in-out ${statusFilter === 'all' ? 'bg-yellow-500 text-white' : 'bg-gray-500 text-white hover:bg-gray-300 text-white'}`}
                onClick={() => handleStatusFilter('all')}
              >
                All
              </button>
            </div>
          </div>

          <div id="table-container" className="overflow-x-auto shadow-md sm:rounded-lg">
            <table id="users-table" className="w-full text-sm text-left text-gray-500">
              <thead id="table-header" className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3">#</th>
                  <th scope="col" className="px-6 py-3">ชื่อผู้ค้า</th>
                  <th scope="col" className="px-6 py-3">เบอร์ติดต่อ</th>
                  <th scope="col" className="px-6 py-3">สถานะ</th>
                  <th scope="col" className="px-6 py-3">วันที่</th>
                  <th scope="col" className="px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody id="table-body">
                {currentUsers.map((user, index) => {
                  const expired = isExpired(user.bond_status.end_date);
                  return (
                  <tr id={`user-row-${user._id}`} key={user._id} className="bg-white border-b hover:bg-gray-50">
                    <td id={`user-index-${user._id}`} className="px-6 py-4">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                    <td id={`user-name-${user._id}`} className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{user.name}</td>
                    <td id={`user-phone-${user._id}`} className="px-6 py-4">{user.phone}</td>
                    <td id={`user-status-${user._id}`} className="px-6 py-4">
                      <span id={`status-badge-${user._id}`} className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.bond_status.status === 'active' 
                          ? expired 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.bond_status.status === 'active' && expired ? 'Deactive' : user.bond_status.status}
                      </span>
                    </td>
                    <td id={`user-date-${user._id}`} className="px-6 py-4">
                      {user.bond_status.end_date ? formatDateToThai(user.bond_status.end_date) : 'ยังไม่ได้รับสถานะ'}
                    </td>
                    <td id={`user-actions-${user._id}`} className="px-6 py-4">
                      <button
                        id={`edit-user-${user._id}`}
                        onClick={() => handleViewUserDetails(user)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit size={20} />
                      </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div id="pagination" className="flex justify-between items-center mt-4">
            <button
              id="prev-page"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`flex items-center justify-center w-10 h-10 rounded-full ${currentPage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
            >
              <ChevronLeft size={20} />
            </button>
            <span id="page-info" className="text-sm text-gray-700">{`หน้า ${currentPage} จาก ${totalPages}`}</span>
            <button
              id="next-page"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`flex items-center justify-center w-10 h-10 rounded-full ${currentPage === totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </main>

      {showMainProfile && selectedCustomer && (
        <div id="profile-modal" className="fixed inset-0 bg-gray-500 bg-opacity-75 z-50 flex items-center justify-center">
          <MainProfile
            id="main-profile"
            userData={selectedCustomer}
            onClose={handleCloseMainProfile}
            className="bg-white rounded-lg shadow-xl"
          />
        </div>
      )}
    </div>
  );
};

export default DataBondTrade;