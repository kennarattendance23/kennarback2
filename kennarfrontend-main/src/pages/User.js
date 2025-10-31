import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../User.css';

function User() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    employee_id: '',
    admin_name: '',
    username: '',
    password: ''
  });
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const API_URL = "https://kennarbackend.onrender.com/api/admins";

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    axios
      .get(API_URL)
      .then((res) => setUsers(res.data))
      .catch((err) => console.error(err));
  };

  const addUser = () => {
    const { employee_id, admin_name, username, password } = form;
    if (!employee_id || !admin_name || !username || !password) {
      setError('All fields are required');
      return;
    }

    axios
      .post(API_URL, form)
      .then((res) => {
        setUsers((prev) => [...prev, res.data]);
        setForm({ employee_id: '', admin_name: '', username: '', password: '' });
        setError('');
        setShowPassword(false);
      })
      .catch((err) => {
        if (err.response?.status === 409) setError('Username already exists');
        else setError('Failed to add user');
      });
  };

  const confirmDeleteUser = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const deleteUser = () => {
    if (!selectedUser) return;
    axios
      .delete(`${API_URL}/${selectedUser.id}`)
      .then(() => {
        setUsers(users.filter((u) => u.id !== selectedUser.id));
        setShowModal(false);
        setSelectedUser(null);
      })
      .catch((err) => console.error(err));
  };

  const filteredUsers = users.filter((user) =>
    Object.values(user).some((val) =>
      String(val).toLowerCase().includes(search.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="user-scroll-wrapper">
      <div className="user-container">
        <h3 className="user-titleheader">User Account Management</h3>

        <div className="user-header">
          <input
            placeholder="Search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="user-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Employee ID</label>
              <input
                placeholder="Employee ID"
                value={form.employee_id}
                onChange={(e) =>
                  setForm({ ...form, employee_id: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>Name</label>
              <input
                placeholder="Fullname"
                value={form.admin_name}
                onChange={(e) =>
                  setForm({ ...form, admin_name: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>Username</label>
              <input
                placeholder="Username"
                value={form.username}
                onChange={(e) =>
                  setForm({ ...form, username: e.target.value })
                }
              />
            </div>

            {/* ✅ Password Field with Eye Toggle */}
            <div className="form-group password-group">
              <label>Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
                {form.password && (
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i
                      className={`fa-solid ${
                        showPassword ? 'fa-eye' : 'fa-eye-slash'
                      }`}
                    ></i>
                  </button>
                )}
              </div>
            </div>
          </div>

          <button onClick={addUser} className="add-user-btn">
            Add
          </button>
          {error && <p className="error-message">{error}</p>}
        </div>

        <table className="user-table">
          <thead>
            <tr>
              <th>EMPLOYEE ID</th>
              <th>NAME</th>
              <th>USERNAME</th>
              <th>PASSWORD</th>
              <th className="action-header">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.length > 0 ? (
              currentUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.employee_id}</td>
                  <td>{user.admin_name}</td>
                  <td>{user.username}</td>
                  <td>{user.password}</td>
                  <td className="action-cell">
                    <button
                      className="user-delete-btn"
                      onClick={() => confirmDeleteUser(user)}
                    >
                      DELETE
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center' }}>
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="user-pagination">
          <div className="user-pagination-info">
            {filteredUsers.length === 0
              ? 'Showing 0 of 0'
              : `Showing ${currentPage} of ${totalPages}`}
          </div>
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>{currentPage}</span>
          <button
            className="pagination-btn"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Next
          </button>
        </div>
      </div>

      {showModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Delete</h3>
            <p>
              Are you sure you want to delete{' '}
              <strong>{selectedUser.admin_name}</strong>?
            </p>
            <div className="modal-actions">
              <button
                className="cancel-button"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button className="delete-btn" onClick={deleteUser}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default User;
