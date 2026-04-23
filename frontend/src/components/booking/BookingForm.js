import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './BookingForm.css';

const BookingForm = () => {
    const navigate = useNavigate();
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
        purposeError: '',
        attendeeError: '',
        conflictError: ''
    });
    const [conflictInfo, setConflictInfo] = useState(null);
    const [availabilityLoading, setAvailabilityLoading] = useState(false);
    const [timeSlotChecked, setTimeSlotChecked] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Clear errors when user changes relevant fields
        if (e.target.name === 'startTime' || e.target.name === 'endTime') {
            setErrors(prev => ({ ...prev, timeError: '', dateError: '', conflictError: '' }));
            setConflictInfo(null);
            setTimeSlotChecked(false);
        }
        if (e.target.name === 'purpose') {
            setErrors(prev => ({ ...prev, purposeError: '' }));
        }
        if (e.target.name === 'expectedAttendees') {
            setErrors(prev => ({ ...prev, attendeeError: '' }));
        }
        if (e.target.name === 'resourceType' || e.target.name === 'equipmentName') {
            setErrors(prev => ({ ...prev, conflictError: '' }));
            setConflictInfo(null);
            setTimeSlotChecked(false);
        }
    };

    const checkTimeSlotAvailability = async () => {
        if (!formData.startTime || !formData.endTime) {
            alert('Please select start and end times first');
            return;
        }

        if (!formData.resourceType) {
            alert('Please select a resource type first');
            return;
        }

        const newErrors = { ...errors };
        if (new Date(formData.startTime) >= new Date(formData.endTime)) {
            newErrors.timeError = 'Start time must be before end time';
            setErrors(newErrors);
            return;
        }

        setAvailabilityLoading(true);
        setConflictInfo(null);

        try {
            const resource = formData.resourceType === 'Equipment'
                ? `Equipment: ${formData.equipmentName}`
                : formData.resourceType;

            const response = await api.get('/api/bookings/check-availability', {
                params: {
                    resource,
                    startTime: formData.startTime,
                    endTime: formData.endTime
                }
            });

            if (response.data.available) {
                setConflictInfo({ available: true, message: 'Time slot is available!' });
                setErrors(prev => ({ ...prev, conflictError: '' }));
            } else {
                setConflictInfo({
                    available: false,
                    conflicts: response.data.conflictingBookings,
                    conflictCount: response.data.conflictCount
                });
                setErrors(prev => ({
                    ...prev,
                    conflictError: `${response.data.conflictCount} booking(s) already scheduled during this time`
                }));
            }
            setTimeSlotChecked(true);
        } catch (error) {
            console.error('Error checking availability:', error);
            const errorMessage = error.response?.data?.error || error.message;
            alert('Error checking availability: ' + errorMessage);
        } finally {
            setAvailabilityLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = { timeError: '', dateError: '', purposeError: '', attendeeError: '', conflictError: '' };
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

        // Validate expected attendees / equipment quantity (1-100)
        const attendees = Number(formData.expectedAttendees);
        if (!Number.isInteger(attendees) || attendees < 1 || attendees > 100) {
            newErrors.attendeeError = 'Expected attendees must be an integer between 1 and 100';
            hasErrors = true;
        }

        // Check if time slot availability was verified
        if (!timeSlotChecked) {
            newErrors.conflictError = 'Please check availability before submitting the booking';
            hasErrors = true;
        }

        // Check if time slot has conflicts
        if (timeSlotChecked && conflictInfo && !conflictInfo.available) {
            newErrors.conflictError = `Cannot book: ${conflictInfo.conflictCount} booking(s) already scheduled during this time`;
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
            expectedAttendees: Number(formData.expectedAttendees)
        };

        try {
            await api.post('/api/bookings', payload);
            alert('Booking created successfully');
            navigate('/', { replace: true });
        } catch (error) {
            const backendMessage = error.response?.data ? JSON.stringify(error.response.data) : error.message;
            alert('Error creating booking: ' + backendMessage);
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
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={checkTimeSlotAvailability}
                            disabled={availabilityLoading || !formData.startTime || !formData.endTime || !formData.resourceType}
                        >
                            {availabilityLoading ? 'Checking availability...' : 'Check Availability'}
                        </button>
                        {timeSlotChecked && conflictInfo && (
                            <div className={conflictInfo.available ? 'availability-success' : 'availability-warning'}>
                                <p className="conflict-status">
                                    {conflictInfo.available
                                        ? '✓ Time slot is available'
                                        : `✗ Conflicts found: ${conflictInfo.conflictCount} booking(s)`}
                                </p>
                                {!conflictInfo.available && conflictInfo.conflicts && conflictInfo.conflicts.length > 0 && (
                                    <div className="conflicts-list">
                                        <strong>Conflicting Bookings:</strong>
                                        <ul>
                                            {conflictInfo.conflicts.map((booking, index) => (
                                                <li key={index}>
                                                    <span className="booking-purpose">{booking.purpose}</span>
                                                    <span className="booking-time">
                                                        {new Date(booking.startTime).toLocaleString()} - {new Date(booking.endTime).toLocaleString()}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                        {errors.conflictError && <div className="field-error">{errors.conflictError}</div>}
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
                            min="1" 
                            max="100"
                            value={formData.expectedAttendees} 
                            onChange={handleChange} 
                        />
                        {errors.attendeeError && <div className="field-error">{errors.attendeeError}</div>}
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
