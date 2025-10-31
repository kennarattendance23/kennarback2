// src/App.js

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';

import Sidebar from './components/Sidebar';
import Employee from './pages/Employee';
import Dashboard from './pages/Dashboard';
import User from './pages/User';
import Report from './pages/Report';
import Login from './pages/Login';
import './App.css';

const AppWrapper = () => {
  const location = useLocation();

  // ✅ Initial state reads from localStorage (persist login)
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem('admins')
  );
  const [admin_name, setAdminName] = useState(
    localStorage.getItem('admins') ? JSON.parse(localStorage.getItem('admins')).admin_name : null
  );

  useEffect(() => {
    // ✅ Only handle explicit logout events
    const logoutHandler = () => {
      setIsLoggedIn(false);
      setAdminName(null);
      localStorage.removeItem('admins'); // clear stored session
    };

    window.addEventListener('logout', logoutHandler);
    return () => window.removeEventListener('logout', logoutHandler);
  }, []);

  // ✅ Called after login from Login page
  const onLoginChange = (user) => {
    if (user) {
      setIsLoggedIn(true);
      setAdminName(user.admin_name);
      localStorage.setItem('admins', JSON.stringify(user)); // persist session
    } else {
      setIsLoggedIn(false);
      setAdminName(null);
      localStorage.removeItem('admins');
    }
  };

  const isLoginPage = location.pathname === '/login';

  return (
    <div className="app-layout" style={{ display: 'flex' }}>
      {/* ✅ Sidebar only visible if logged in and not on login page */}
      {!isLoginPage && isLoggedIn && <Sidebar admin_name={admin_name} />}

      <div className="main-content" style={{ flex: 1, padding: '20px' }}>
        <Routes>
          {/* ✅ Default route goes to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* ✅ Login page */}
          <Route path="/login" element={<Login onLoginChange={onLoginChange} />} />

          {/* ✅ Protected routes */}
          <Route
            path="/dashboard"
            element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/employee"
            element={isLoggedIn ? <Employee /> : <Navigate to="/login" />}
          />
          <Route
            path="/user"
            element={isLoggedIn ? <User /> : <Navigate to="/login" />}
          />
          <Route
            path="/report"
            element={isLoggedIn ? <Report /> : <Navigate to="/login" />}
          />

          {/* ✅ Catch-all unknown routes */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </div>
  );
};

const App = () => (
  <Router>
    <AppWrapper />
  </Router>
);

export default App;


