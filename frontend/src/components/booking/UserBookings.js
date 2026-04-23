import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './UserBookings.css';

const UserBookings = () => {
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await api.get('/api/bookings/my');
            setBookings(response.data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        }
    };

    const handleCancel = async (id) => {
        try {
            await api.put(`/api/bookings/${id}/cancel`);
            fetchBookings(); // Refresh list
        } catch (error) {
            alert('Error cancelling booking: ' + (error.response?.data || error.message));
        }
    };

    return (
        <div className="bookings-container">
            <div className="bookings-header">
                <h1>My Bookings</h1>
                <p>View and manage your resource bookings</p>
            </div>

            <div className="bookings-list-container">
                {bookings.length === 0 ? (
                    <div className="bookings-empty">
                        <h3>No bookings yet</h3>
                        <p>Create a booking to get started</p>
                    </div>
                ) : (
                    <ul className="bookings-list">
                        {bookings.map(booking => (
                            <li key={booking.id} className="booking-item">
                                <div className="booking-item-header">
                                    <div className="booking-resource">{booking.resource}</div>
                                    <div className="booking-datetime">
                                        {new Date(booking.startTime).toLocaleString()} - {new Date(booking.endTime).toLocaleString()}
                                    </div>
                                </div>
                                <div className="booking-item-details">
                                    <div className="detail-row">
                                        <span className="detail-label">Status</span>
                                        <span className={`status-badge status-${booking.status.toLowerCase()}`}>
                                            {booking.status}
                                        </span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Purpose</span>
                                        <span className="detail-value">{booking.purpose}</span>
                                    </div>
                                    {booking.expectedAttendees && (
                                        <div className="detail-row">
                                            <span className="detail-label">Attendees</span>
                                            <span className="detail-value">{booking.expectedAttendees}</span>
                                        </div>
                                    )}
                                    {booking.adminReason && (
                                        <div className="detail-row">
                                            <span className="detail-label">Admin Note</span>
                                            <span className="detail-value">{booking.adminReason}</span>
                                        </div>
                                    )}
                                </div>
                                {booking.status === 'APPROVED' && (
                                    <div className="booking-actions">
                                        <button className="btn-cancel" onClick={() => handleCancel(booking.id)}>
                                            Cancel Booking
                                        </button>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default UserBookings;