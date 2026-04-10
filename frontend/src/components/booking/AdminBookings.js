import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [approval, setApproval] = useState({ status: 'APPROVED', adminReason: '' });

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await axios.get('/api/bookings');
            setBookings(response.data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        }
    };

    const handleApproveReject = async () => {
        try {
            await axios.put(`/api/bookings/${selectedBooking.id}/approve`, approval);
            setSelectedBooking(null);
            fetchBookings();
        } catch (error) {
            alert('Error: ' + error.response.data);
        }
    };

    return (
        <div>
            <h2>All Bookings</h2>
            <ul>
                {bookings.map(booking => (
                    <li key={booking.id}>
                        {booking.resource} - {booking.startTime} to {booking.endTime} - {booking.status}
                        {booking.status === 'PENDING' && (
                            <button onClick={() => setSelectedBooking(booking)}>Review</button>
                        )}
                    </li>
                ))}
            </ul>
            {selectedBooking && (
                <div>
                    <h3>Review Booking</h3>
                    <p>{selectedBooking.purpose}</p>
                    <select value={approval.status} onChange={(e) => setApproval({ ...approval, status: e.target.value })}>
                        <option value="APPROVED">Approve</option>
                        <option value="REJECTED">Reject</option>
                    </select>
                    <input type="text" placeholder="Reason" value={approval.adminReason} onChange={(e) => setApproval({ ...approval, adminReason: e.target.value })} />
                    <button onClick={handleApproveReject}>Submit</button>
                    <button onClick={() => setSelectedBooking(null)}>Cancel</button>
                </div>
            )}
        </div>
    );
};

export default AdminBookings;