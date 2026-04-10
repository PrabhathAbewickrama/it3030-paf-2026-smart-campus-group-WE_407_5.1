import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
    return (
        <div className="home-container">
            <div className="home-header">
                <h1>Smart Campus - Booking Management System</h1>
                <p>Manage facility bookings efficiently</p>
            </div>

            <div className="pages-grid">
                <div className="page-card">
                    <h2>Create Booking</h2>
                    <p>Request a booking for a resource (lecture hall, lab, meeting room, or equipment)</p>
                    <Link to="/create-booking" className="btn btn-primary">Go to Create Booking</Link>
                </div>

                <div className="page-card">
                    <h2>My Bookings</h2>
                    <p>View your bookings and their status. Cancel approved bookings if needed</p>
                    <Link to="/my-bookings" className="btn btn-primary">View My Bookings</Link>
                </div>

                <div className="page-card">
                    <h2>Admin Dashboard</h2>
                    <p>Review pending bookings, approve or reject them with comments</p>
                    <Link to="/admin" className="btn btn-primary">Admin Dashboard</Link>
                </div>
            </div>

          
        </div>
    );
};

export default HomePage;