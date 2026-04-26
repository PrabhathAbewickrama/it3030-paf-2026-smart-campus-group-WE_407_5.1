import React, { useCallback, useEffect, useState } from 'react';
import api from '../../services/api';
import { useNotifications } from '../../context/NotificationContext.jsx';
import './AdminBookings.css';

const initialFilters = {
    status: '',
    resource: '',
    userId: ''
};

const AdminBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [approval, setApproval] = useState({ status: 'APPROVED', adminReason: '' });
    const [filters, setFilters] = useState(initialFilters);
    const { addNotification } = useNotifications();

    const fetchBookings = useCallback(async (activeFilters = filters) => {
        try {
            const response = await api.get('/api/bookings', {
                params: {
                    status: activeFilters.status || undefined,
                    resource: activeFilters.resource.trim() || undefined,
                    userId: activeFilters.userId || undefined
                }
            });
            setBookings(response.data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        }
    }, [filters]);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const handleApproveReject = async () => {
        try {
            await api.put(`/api/bookings/${selectedBooking.id}/approve`, approval);

            addNotification({
                title: approval.status === 'APPROVED' ? 'Booking approved' : 'Booking rejected',
                message: approval.status === 'APPROVED'
                    ? `Booking #${selectedBooking.id} was approved for ${selectedBooking.resource}.`
                    : `Booking #${selectedBooking.id} was rejected${approval.adminReason ? `: ${approval.adminReason}` : '.'}`,
                type: approval.status === 'APPROVED' ? 'success' : 'warning',
                module: 'bookings',
                roleScope: ['ADMIN', 'MANAGER', 'USER']
            });
            setSelectedBooking(null);
            setApproval({ status: 'APPROVED', adminReason: '' });
            fetchBookings();
        } catch (error) {
            addNotification({
                title: 'Booking review failed',
                message: String(error.response?.data || error.message),
                type: 'error',
                module: 'bookings'
            });
        }
    };

    const handleFilterChange = (event) => {
        const { name, value } = event.target;
        setFilters((previous) => ({ ...previous, [name]: value }));
    };

    const applyFilters = (event) => {
        event.preventDefault();
        fetchBookings(filters);
    };

    const resetFilters = () => {
        setFilters(initialFilters);
        fetchBookings(initialFilters);
    };

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1>Admin Dashboard</h1>
                <p>Review and manage all booking requests</p>
            </div>

            <form className="admin-filters" onSubmit={applyFilters}>
                <div className="admin-filter-grid">
                    <div className="admin-filter-group">
                        <label>Status</label>
                        <select name="status" value={filters.status} onChange={handleFilterChange}>
                            <option value="">All statuses</option>
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>

                    <div className="admin-filter-group">
                        <label>Resource</label>
                        <input
                            type="text"
                            name="resource"
                            value={filters.resource}
                            onChange={handleFilterChange}
                            placeholder="Filter by resource"
                        />
                    </div>

                    <div className="admin-filter-group">
                        <label>User ID</label>
                        <input
                            type="number"
                            name="userId"
                            value={filters.userId}
                            onChange={handleFilterChange}
                            placeholder="Filter by user id"
                            min="1"
                        />
                    </div>
                </div>

                <div className="admin-filter-actions">
                    <button type="submit" className="review-button">Apply Filters</button>
                    <button type="button" className="btn-cancel-review" onClick={resetFilters}>Reset</button>
                </div>
            </form>

            <div className="admin-list-container">
                {bookings.length === 0 ? (
                    <div className="admin-empty">
                        <h3>No bookings</h3>
                        <p>No bookings match the current filters</p>
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
                                    {booking.adminReason && (
                                        <div className="detail-row">
                                            <span className="detail-label">Admin Note</span>
                                            <span className="detail-value">{booking.adminReason}</span>
                                        </div>
                                    )}
                                </div>
                                {booking.status === 'PENDING' && (
                                    <button
                                        className="review-button"
                                        onClick={() => {
                                            setSelectedBooking(booking);
                                            setApproval({ status: 'APPROVED', adminReason: '' });
                                        }}
                                    >
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
