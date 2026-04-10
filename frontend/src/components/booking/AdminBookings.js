import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './AdminBookings.css';

const AdminBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [approval, setApproval] = useState({ status: 'APPROVED', adminReason: '' });

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await api.get('/api/bookings');
            setBookings(response.data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        }
    };

    const handleApproveReject = async () => {
        try {
            await api.put(`/api/bookings/${selectedBooking.id}/approve`, approval);
            setSelectedBooking(null);
            fetchBookings();
        } catch (error) {
            alert('Error: ' + (error.response?.data || error.message));
        }
    };

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1>Admin Dashboard</h1>
                <p>Review and manage all booking requests</p>
            </div>

            <div className="admin-list-container">
                {bookings.length === 0 ? (
                    <div className="admin-empty">
                        <h3>No bookings</h3>
                        <p>No bookings to review</p>
                    </div>
                ) : (
                    <ul className="admin-list">
                        {bookings.map(booking => (
                            <li key={booking.id} className="admin-item">
                                <div className="admin-item-header">
                                    <div className="admin-resource">{booking.resource}</div>
                                    <div className="admin-datetime">
                                        {new Date(booking.startTime).toLocaleString()} - {new Date(booking.endTime).toLocaleString()}
                                    </div>
                                </div>
                                <div className="admin-item-details">
                                    <div className="detail-row">
                                        <span className="detail-label">Status</span>
                                        <span className={`status-badge status-${booking.status.toLowerCase()}`}>
                                            {booking.status}
                                        </span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">User ID</span>
                                        <span className="detail-value">{booking.userId}</span>
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
                                </div>
                                {booking.status === 'PENDING' && (
                                    <button className="review-button" onClick={() => setSelectedBooking(booking)}>
                                        Review Request
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {selectedBooking && (
                <div className="review-panel">
                    <h3>Review Booking Request</h3>
                    
                    <div className="review-section">
                        <label>Resource</label>
                        <div className="detail-value">{selectedBooking.resource}</div>
                    </div>

                    <div className="review-section">
                        <label>Purpose</label>
                        <div className="detail-value">{selectedBooking.purpose}</div>
                    </div>

                    <div className="review-section">
                        <label>Decision: *</label>
                        <select value={approval.status} onChange={(e) => setApproval({ ...approval, status: e.target.value })}>
                            <option value="">Select action</option>
                            <option value="APPROVED">Approve</option>
                            <option value="REJECTED">Reject</option>
                        </select>
                    </div>

                    <div className="review-section">
                        <label>Comments/Reason:</label>
                        <textarea 
                            placeholder="Add comments or reason for rejection" 
                            rows="4"
                            value={approval.adminReason} 
                            onChange={(e) => setApproval({ ...approval, adminReason: e.target.value })} 
                        />
                    </div>

                    <div className="review-actions">
                        <button className="btn-submit" onClick={handleApproveReject}>Submit Decision</button>
                        <button className="btn-cancel-review" onClick={() => setSelectedBooking(null)}>Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminBookings;