import React from 'react';
import UserBookings from '../components/booking/UserBookings';
import './Pages.css';

const MyBookingsPage = () => {
    return (
        <div className="page-wrapper">
            <UserBookings />
        </div>
    );
};

export default MyBookingsPage;