import React, { useState } from 'react';
import api from '../../services/api';

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
        <form onSubmit={handleSubmit}>
            <div>
                <label>Resource:</label>
                <select name="resourceType" value={formData.resourceType} onChange={handleChange} required>
                    <option value="">Select resource</option>
                    <option value="Lecture Hall">Lecture Hall</option>
                    <option value="Lab">Lab</option>
                    <option value="Meeting Room">Meeting Room</option>
                    <option value="Equipment">Equipment</option>
                </select>
            </div>
            {formData.resourceType === 'Equipment' && (
                <div>
                    <label>Equipment Name:</label>
                    <input
                        type="text"
                        name="equipmentName"
                        value={formData.equipmentName}
                        onChange={handleChange}
                        required
                    />
                </div>
            )}
            <div>
                <label>Start Time:</label>
                <input type="datetime-local" name="startTime" value={formData.startTime} onChange={handleChange} required />
            </div>
            <div>
                <label>End Time:</label>
                <input type="datetime-local" name="endTime" value={formData.endTime} onChange={handleChange} required />
            </div>
            <div>
                <label>Purpose:</label>
                <input type="text" name="purpose" value={formData.purpose} onChange={handleChange} required />
            </div>
            <div>
                <label>Expected Attendees:</label>
                <input type="number" name="expectedAttendees" value={formData.expectedAttendees} onChange={handleChange} />
            </div>
            <button type="submit">Submit Booking</button>
        </form>
    );
};

export default BookingForm;