import React, { useState } from 'react';
import api from '../../services/api';
import './BookingForm.css';

const BookingForm = () => {
    const [formData, setFormData] = useState({
        resourceType: '',
        equipmentName: '',
        startTime: '',
        endTime: '',
        purpose: '',
        expectedAttendees: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const resource = formData.resourceType === 'Equipment'
            ? `Equipment: ${formData.equipmentName}`
            : formData.resourceType;

        const payload = {
            resource,
            startTime: formData.startTime,
            endTime: formData.endTime,
            purpose: formData.purpose,
            expectedAttendees: formData.expectedAttendees
        };

        try {
            await api.post('/api/bookings', payload);
            alert('Booking created successfully');
            // Reset form or redirect
            setFormData({
                resourceType: '',
                equipmentName: '',
                startTime: '',
                endTime: '',
                purpose: '',
                expectedAttendees: ''
            });
        } catch (error) {
            alert('Error creating booking: ' + (error.response?.data || error.message));
        }
    };

    return (
        <div className="booking-container">
            <div className="booking-header">
                <h1>Create Booking</h1>
                <p>Request a resource for your event or meeting</p>
            </div>

            <div className="form-card">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Resource Type: *</label>
                        <select name="resourceType" value={formData.resourceType} onChange={handleChange} required>
                            <option value="">Select resource</option>
                            <option value="Lecture Hall">Lecture Hall</option>
                            <option value="Lab">Lab</option>
                            <option value="Meeting Room">Meeting Room</option>
                            <option value="Equipment">Equipment</option>
                        </select>
                    </div>
                    {formData.resourceType === 'Equipment' && (
                        <div className="form-group">
                            <label>Equipment Name: *</label>
                            <input
                                type="text"
                                name="equipmentName"
                                placeholder="Enter equipment name (e.g., Projector, Laptop)"
                                value={formData.equipmentName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    )}
                    <div className="form-group">
                        <label>Start Time: *</label>
                        <input type="datetime-local" name="startTime" value={formData.startTime} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>End Time: *</label>
                        <input type="datetime-local" name="endTime" value={formData.endTime} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Purpose: *</label>
                        <textarea name="purpose" placeholder="Describe the purpose of the booking" rows="3" value={formData.purpose} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Expected Attendees:</label>
                        <input type="number" name="expectedAttendees" placeholder="Number of attendees" min="0" value={formData.expectedAttendees} onChange={handleChange} />
                    </div>
                    <div className="form-buttons">
                        <button type="submit" className="btn btn-primary">Submit Booking</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookingForm;