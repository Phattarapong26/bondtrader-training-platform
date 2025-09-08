import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
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
  }, []);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const menuItems = [
    { id: 'home', path: '/UserHomepage', icon: 'fas fa-home', label: 'หน้าแรก' },
    { id: 'courses', path: '/UserHomepage', icon: 'fas fa-book', label: 'คอร์สเรียน' },
    { id: 'schedule', path: '/CourseRoadUser', icon: 'fas fa-info-circle', label: 'ตารางอบรม' },
  ];

  return (
    <aside id="user-sidebar" className={`sidebar ${isMobile && !isOpen ? 'sidebar-hidden' : ''}`}>
      <div id="user-sidebar-content" className="sidebar-content">
        {isMobile && (
          <button id="user-close-sidebar-btn" onClick={toggleSidebar} className="close-sidebar-button">
            <i className="fas fa-times"></i>
          </button>
        )}
        <img
          id="user-sidebar-logo"
          src="https://github.com/Phattarapong26/image/blob/main/ดีไซน์ที่ยังไม่ได้ตั้งชื่อ-2.png?raw=true"
          alt="Mula Global Logo"
          className="sidebar-logo"
        />
        <nav id="user-sidebar-nav" className="sidebar-nav">
          <ul id="user-nav-list">
            {menuItems.map((item) => (
              <li key={item.id} id={`user-nav-${item.id}`}>
                <Link
                  id={`user-nav-link-${item.id}`}
                  to={item.path}
                  className={isActive(item.path) ? 'active' : ''}
                >
                  <i className={item.icon}></i> {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;