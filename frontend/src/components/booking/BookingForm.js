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
    const [errors, setErrors] = useState({
        timeError: '',
        dateError: '',
        purposeError: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Clear errors when user changes relevant fields
        if (e.target.name === 'startTime' || e.target.name === 'endTime') {
            setErrors(prev => ({ ...prev, timeError: '', dateError: '' }));
        }
        if (e.target.name === 'purpose') {
            setErrors(prev => ({ ...prev, purposeError: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = { timeError: '', dateError: '', purposeError: '' };
        let hasErrors = false;

        // Validate that start time is before end time
        if (new Date(formData.startTime) >= new Date(formData.endTime)) {
            newErrors.timeError = 'Start time must be before end time';
            hasErrors = true;
        }

        // Validate that start date is before or equal to end date
        const startDate = new Date(formData.startTime).toDateString();
        const endDate = new Date(formData.endTime).toDateString();
        if (startDate > endDate) {
            newErrors.dateError = 'Start date must be before or equal to end date';
            hasErrors = true;
        }

        // Validate purpose character count (1-100 characters)
        const charCount = formData.purpose.trim().length;
        if (charCount < 1 || charCount > 100) {
            newErrors.purposeError = `Description must be between 1-100 characters (currently ${charCount} characters)`;
            hasErrors = true;
        }

        setErrors(newErrors);

        if (hasErrors) {
            return;
        }

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
            setErrors({ timeError: '', dateError: '', purposeError: '' });
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
                        {errors.timeError && <div className="field-error">{errors.timeError}</div>}
                        {errors.dateError && <div className="field-error">{errors.dateError}</div>}
                    </div>
                    <div className="form-group">
                        <label>Purpose: *</label>
                        <textarea name="purpose" placeholder="Describe the purpose of the booking" rows="3" value={formData.purpose} onChange={handleChange} required />
                        {errors.purposeError && <div className="field-error">{errors.purposeError}</div>}
                    </div>
                    <div className="form-group">
                        <label>{formData.resourceType === 'Equipment' ? 'Equipment Quantity:' : 'Expected Attendees:'}</label>
                        <input 
                            type="number" 
                            name="expectedAttendees" 
                            placeholder={formData.resourceType === 'Equipment' ? 'Quantity needed' : 'Number of attendees'} 
                            min="0" 
                            value={formData.expectedAttendees} 
                            onChange={handleChange} 
                        />
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