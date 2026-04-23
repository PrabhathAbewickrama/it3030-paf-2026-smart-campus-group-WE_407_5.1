import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './HomePage.css';

const HomePage = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="home-container">
      <div className="home-header">
        <div>
          <h1>SLIIT Campus - Booking Management System</h1>
          <p>Manage facility bookings efficiently</p>
        </div>

        <div className="home-session">
          <span className="home-role-badge">{currentUser.role === 'admin' ? 'Admin' : 'Normal User'}</span>
          <p className="home-welcome">
            Logged in as <strong>{currentUser.username}</strong>
          </p>
          <button type="button" className="btn btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="pages-grid">
        {currentUser.role === 'user' && (
          <>
            <div className="page-card">
              <h2>Create Booking</h2>
              <p>Request a booking for a resource like a lecture hall, lab, meeting room, or equipment.</p>
              <Link to="/create-booking" className="btn btn-primary">Go to Create Booking</Link>
            </div>

            <div className="page-card">
              <h2>My Bookings</h2>
              <p>View your own bookings, track their status, and cancel approved requests when needed.</p>
              <Link to="/my-bookings" className="btn btn-primary">View My Bookings</Link>
            </div>
          </>
        )}

        {currentUser.role === 'admin' && (
          <div className="page-card">
            <h2>Admin Dashboard</h2>
            <p>Review pending bookings, approve or reject them, and manage campus booking activity.</p>
            <Link to="/admin" className="btn btn-primary">Open Admin Dashboard</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
