import React, { useState, useEffect } from 'react';
import api from '../../services/api';

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
        <div>
            <h2>My Bookings</h2>
            <ul>
                {bookings.map(booking => (
                    <li key={booking.id}>
                        {booking.resource} - {booking.startTime} to {booking.endTime} - {booking.status}
                        {booking.status === 'APPROVED' && (
                            <button onClick={() => handleCancel(booking.id)}>Cancel</button>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default UserBookings;