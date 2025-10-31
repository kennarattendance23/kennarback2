// src/components/Sidebar.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaUserTie, FaUser, FaChartBar } from 'react-icons/fa';
import '../sidebar.css';


const Sidebar = ({ admin_name }) => {
  const location = useLocation();
  const currentPath = location.pathname.replace(/\/$/, '');

  return (
    <div className="sidebar">
      <div className="logo-container">
        <img src="/logo.png" alt="Logo" className="sidebar-logo" />
      </div>

      <h3 className="admin-name">{admin_name || 'Guest'}</h3>

      <nav>
        <Link to="/dashboard" className={currentPath === '/dashboard' ? 'active' : ''}>
          <FaHome /> <span>Dashboard</span>
        </Link>
        <Link to="/employee" className={currentPath === '/employee' ? 'active' : ''}>
          <FaUserTie /> <span>Employee</span>
        </Link>
        <Link to="/user" className={currentPath === '/user' ? 'active' : ''}>
          <FaUser /> <span>User</span>
        </Link>
        <Link to="/report" className={currentPath === '/report' ? 'active' : ''}>
          <FaChartBar /> <span>Report</span>
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;









