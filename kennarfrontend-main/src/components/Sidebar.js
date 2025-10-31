// src/components/Sidebar.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../logo.png';   // ✅ Make sure this file exists
import '../sidebar.css';

const Sidebar = ({ admin_name }) => {
  const location = useLocation();
  const currentPath = location.pathname.replace(/\/$/, '');

  return (
    <div className="sidebar">
      {/* ✅ Logo Section */}
      <div className="logo-container">
        <img
          src={logo}
          alt="Kennar Auto Shop Logo"
          className="sidebar-logo"
        />
      </div>

      {/* ✅ Admin Name */}
      <h3 className="admin-name">{admin_name || 'Guest'}</h3>

      {/* ✅ Navigation Links */}
      <nav>
        <Link to="/dashboard" className={currentPath === '/dashboard' ? 'active' : ''}>
          <img src="/icons/homereal.png" alt="Dashboard" className="sidebar-icon" />
          <span>Dashboard</span>
        </Link>
        <Link to="/employee" className={currentPath === '/employee' ? 'active' : ''}>
          <img src="/icons/employee-man-alt.png" alt="Employee" className="sidebar-icon" />
          <span>Employee</span>
        </Link>
        <Link to="/user" className={currentPath === '/user' ? 'active' : ''}>
          <img src="/icons/circle-user.png" alt="User" className="sidebar-icon" />
          <span>User</span>
        </Link>
        <Link to="/report" className={currentPath === '/report' ? 'active' : ''}>
          <img src="/icons/newspaper.png" alt="Report" className="sidebar-icon" />
          <span>Report</span>
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;
