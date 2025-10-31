// === src/pages/Dashboard.js ===
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Dashboard.css';

// ✅ Use the same base URL as your backend
const API_BASE_URL = 'https://kennarbackend.onrender.com/api';

function Dashboard() {
  const [stats, setStats] = useState({
    employees: 0,
    present: 0,
    late: 0,
    absent: 0,
  });

  const [time, setTime] = useState(new Date());
  const navigate = useNavigate();

  // 📅 Fetch dashboard stats
  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard-stats`);
      console.log("📊 Dashboard data:", response.data); // for debugging

      setStats({
        employees: response.data.employees || 0,
        present: response.data.present || 0,
        late: response.data.late || 0,
        absent: response.data.absent || 0,
      });
    } catch (error) {
      console.error('❌ Error fetching dashboard stats:', error);
    }
  };

  // 🕒 Auto-refresh every 30 seconds + live clock
  useEffect(() => {
    fetchStats(); // initial load
    const statsInterval = setInterval(fetchStats, 30000);
    const clockInterval = setInterval(() => setTime(new Date()), 1000);
    return () => {
      clearInterval(statsInterval);
      clearInterval(clockInterval);
    };
  }, []);

  // Clock hand positions
  const hourDeg = ((time.getHours() % 12) + time.getMinutes() / 60) * 30;
  const minuteDeg = time.getMinutes() * 6;
  const secondDeg = time.getSeconds() * 6;

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  // Calendar generation
  const getCalendarDays = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const calendar = [];
    for (let i = 0; i < firstDay; i++) calendar.push(null);
    for (let day = 1; day <= daysInMonth; day++) calendar.push(day);

    return { calendar, today };
  };

  const { calendar, today } = getCalendarDays();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="dashboard-main">
      <div className="header">
        <h2>Dashboard</h2>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      {/* 📊 Dashboard Boxes */}
      <div className="stats-grid">
        <div className="stat-box">
          <strong>Employees</strong>
          <p>{stats.employees}</p>
        </div>
        <div className="stat-box">
          <strong>Present</strong>
          <p>{stats.present}</p>
        </div>
        <div className="stat-box">
          <strong>Late</strong>
          <p>{stats.late}</p>
        </div>
        <div className="stat-box">
          <strong>Absent</strong>
          <p>{stats.absent}</p>
        </div>
      </div>

      {/* 🕒 Clock + 📅 Calendar */}
      <div className="calendar-clock">
        <div className="clock">
          <div className="clock-face">
            {[...Array(12)].map((_, i) => {
              const angle = (i + 1) * 30;
              const rotate = `rotate(${angle}deg)`;
              const reverseRotate = `rotate(${-angle}deg)`;
              return (
                <div key={i} className="clock-number" style={{ transform: rotate }}>
                  <div style={{ transform: reverseRotate }}>{i + 1}</div>
                </div>
              );
            })}

            <div className="hand hour" style={{ transform: `rotate(${hourDeg}deg)` }}></div>
            <div className="hand minute" style={{ transform: `rotate(${minuteDeg}deg)` }}></div>
            <div className="hand second" style={{ transform: `rotate(${secondDeg}deg)` }}></div>
          </div>
        </div>

        <div className="calendar">
          <h3>
            {today.toLocaleString('default', { month: 'long' })} {today.getFullYear()}
          </h3>
          <div className="calendar-grid">
            {dayNames.map((day, i) => (
              <div key={i} className="calendar-day-name">{day}</div>
            ))}
            {calendar.map((day, i) => (
              <div
                key={i}
                className={`calendar-day ${day === today.getDate() ? 'today' : ''}`}
              >
                {day || ''}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

