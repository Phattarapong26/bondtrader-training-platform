import React, { useState } from 'react';
import { FiFilter, FiSearch, FiPlus, FiMenu, FiX } from 'react-icons/fi';

interface HeadersProps {
  toggleSidebar: () => void;
  openPopup: () => void;
  onSearch: (searchQuery: string) => void;
  handleTabClick: (tab: string) => void;
  onFilter: (filters: FilterOptions) => void;
}

interface FilterOptions {
  duration: string;
  startDate: string;
}

const Headers: React.FC<HeadersProps> = ({
  toggleSidebar,
  openPopup,
  onSearch,
  handleTabClick,
  onFilter
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Latest');
  const [filters, setFilters] = useState<FilterOptions>({
    duration: '',
    startDate: ''
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchQuery = event.target.value;
    setSearchQuery(newSearchQuery);
    onSearch(newSearchQuery);
  };

  const handleTab = (newTab: string) => {
    setActiveTab(newTab);
    handleTabClick(newTab);
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = event.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  return (
    <header id="course-header">
      <div id="header-container" className="mx-auto border-b pb-6">
        <div id="header-content" className="flex items-center justify-between ">
          <div id="header-left" className="flex items-center">
            <button id="sidebar-toggle" className="mr-4 text-gray-800 hover:text-gray-200 transition-colors" onClick={toggleSidebar}>
              <FiMenu size={24} />
            </button>
            <h1 id="header-title" className="text-2xl font-bold">จัดการ Course ทั้งหมด</h1>
          </div>
          <div id="header-right" className="flex items-center space-x-4 ">
            <div id="search-container" className="relative">
              <input
                id="search-input"
                type="text"
                placeholder="ค้นหา..."
                className="pl-10 pr-4 py-2 rounded-full bg-gray-400  bg-opacity-20 focus:bg-opacity-100 focus:text-gray-800 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white"
                value={searchQuery}
                onChange={handleSearch}
              />
              <FiSearch id="search-icon" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray" />
            </div>
            <button
              id="add-course-btn"
              className="bg-yellow-500 text-white px-4 py-2 rounded-full flex items-center hover:bg-blue-50 transition-colors duration-300"
              onClick={openPopup}
            >
              <FiPlus className="mr-2" /> เพิ่ม Course
            </button>
            <button
              id="filter-toggle"
              className={`px-4 py-2 rounded-full flex items-center transition-colors duration-300 ${
                isFilterOpen ? 'bg-gray-500 text-white' : 'bg-gray-500 text-white'
              }`}
              onClick={toggleFilter}
            >
              {isFilterOpen ? <FiX className="mr-2" /> : <FiFilter className="mr-2" />}
              {isFilterOpen ? 'ปิดตัวกรอง' : 'ตัวกรอง'}
            </button>
          </div>
        </div>
        <div id="tab-container" className="mt-4 flex space-x-4  ">
          {['Latest', 'Popular', 'Upcoming'].map((tab) => (
            <button
              id={`tab-${tab.toLowerCase()}`}
              key={tab}
              className={`px-4 py-2  bg-gray-500  rounded-full transition-colors duration-300 ${
                activeTab === tab ? 'bg-yellow-500 text-white' : 'text-white hover:bg-yellow-500'
              }`}
              onClick={() => handleTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      {isFilterOpen && (
        <div id="filter-section" className="bg-yellow-500 shadow-md text-gray-700 rounded-b-lg ">
          <div id="filter-content" className="container  text-gray-700 ">
            <div id="filter-grid" className="flex flex-wrap text-gray-700 ">
              <div id="duration-filter" className="w-full md:w-1/2 px-2 mb-4 md:mb-0 ">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="duration">
                  ระยะเวลา
                </label>
                <select
                  id="duration-select"
                  name="duration"
                  value={filters.duration}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 text-gray-700  border rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="">ทั้งหมด</option>
                  <option value="short">สั้น (&lt; 2 ชั่วโมง)</option>
                  <option value="medium">ปานกลาง (2-5 ชั่วโมง)</option>
                  <option value="long">ยาว (&gt; 5 ชั่วโมง)</option>
                </select>
              </div>
              <div id="date-filter" className="w-full md:w-1/2 px-2 ">
                <label className="block text-gray-700 text-sm font-bold mb-2 " htmlFor="startDate">
                  วันเริ่มต้น
                </label>
                <select
                  id="start-date-select"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2  text-gray-700 border rounded-lg focus:outline-none focus:border-yellow-500"
                >
                  <option value="">ทั้งหมด</option>
                  <option value="upcoming">กำลังจะมาถึง</option>
                  <option value="past">ที่ผ่านมา</option>
                  <option value="today">วันนี้</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Headers;