import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, [isOpen]); // Add `isOpen` to the dependency array if you need to rerun the effect

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <aside id="admin-sidebar" className={`sidebar ${isMobile && !isOpen ? 'sidebar-hidden' : ''}`}>
      <div id="sidebar-content" className="sidebar-content">
        {isMobile && (
          <button id="close-sidebar-btn" onClick={toggleSidebar} className="close-sidebar-button">
            <i className="fas fa-times"></i>
          </button>
        )}
        <img
          id="sidebar-logo"
          src="https://github.com/Phattarapong26/image/blob/main/ดีไซน์ที่ยังไม่ได้ตั้งชื่อ-2.png?raw=true"
          alt="Mula Global Logo"
          className="sidebar-logo"
        />
        <nav id="sidebar-nav" className="sidebar-nav">
          <ul id="nav-list">
            <li id="nav-home">
              <a
                id="home-link"
                href="/AdminDashboard"
                className={isActive('/AdminDashboard') ? 'active' : ''}
              >
                <i className="fas fa-home"></i> หน้าแรก
              </a>
            </li>
            <li id="nav-courses">
              <a
                id="courses-link"
                href="/MainProduct"
                className={isActive('/MainProduct') ? 'active' : ''}
              >
                <i className="fas fa-book"></i> จัดการคอร์ส
              </a>
            </li>
            <li id="nav-schedule">
              <a
                id="schedule-link"
                href="/CourseRoadMAP"
                className={isActive('/CourseRoadMAP') ? 'active' : ''}
              >
                <i className="fas fa-info-circle"></i> ตารางอบรม
              </a>
            </li>
            <li id="nav-traders">
              <a
                id="traders-link"
                href="/DataBondTrade"
                className={isActive('/DataBondTrade') ? 'active' : ''}
              >
                <i className="fas fa-user"></i> ผู้ค้าตราสารหนี้
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
