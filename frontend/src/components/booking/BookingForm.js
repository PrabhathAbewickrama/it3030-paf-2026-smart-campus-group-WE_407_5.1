import React, { useState } from 'react';
import axios from 'axios';

const BookingForm = () => {
    const [formData, setFormData] = useState({
        resource: '',
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
        try {
            await axios.post('/api/bookings', formData);
            alert('Booking created successfully');
            // Reset form or redirect
        } catch (error) {
            alert('Error creating booking: ' + error.response.data);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Resource:</label>
                <input type="text" name="resource" value={formData.resource} onChange={handleChange} required />
            </div>
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