import React from 'react';
import AdminBookings from '../components/booking/AdminBookings';
import './Pages.css';

const AdminDashboardPage = () => {
    return (
        <div className="page-wrapper">
            <AdminBookings />
        </div>
    );
};

export default AdminDashboardPage;