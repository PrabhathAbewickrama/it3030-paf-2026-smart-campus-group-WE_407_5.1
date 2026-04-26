import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { getAssets } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext.jsx';
import './BookingForm.css';

const resourceOptions = {
    'Lecture Hall': Array.from({ length: 10 }, (_, index) => `Lecture Hall ${index + 1}`),
    Lab: Array.from({ length: 10 }, (_, index) => `Lab ${index + 1}`),
    'Meeting Room': Array.from({ length: 4 }, (_, index) => `Meeting Room ${index + 1}`)
};

const formatAssetResource = (asset) => `${asset.name}${asset.location ? ` (${asset.location})` : ''}`;

// Use HTML <input type="time"> with minute precision between 06:00 and 22:00.

const BookingForm = () => {
    const navigate = useNavigate();
    const { addNotification } = useNotifications();
    const [assets, setAssets] = useState([]);
    const [assetsLoading, setAssetsLoading] = useState(true);
    const [formData, setFormData] = useState({
        resourceType: '',
        resourceName: '',
        equipmentName: '',
        assetId: '',
        startDate: '',
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
    // Keep end picker's min aligned with start picker to preserve the same UI
    const endMin = '06:00';

    // Fetch assets on component mount
    useEffect(() => {
        const fetchAssets = async () => {
            try {
                setAssetsLoading(true);
                const response = await getAssets();
                setAssets(response.data || []);
            } catch (error) {
                console.error('Error fetching assets:', error);
                addNotification({
                    title: 'Error',
                    message: 'Failed to load available assets',
                    type: 'error',
                    module: 'bookings'
                });
            } finally {
                setAssetsLoading(false);
            }
        };

        fetchAssets();
    }, [addNotification]);

    const buildDateTime = (date, time) => {
        if (!date || !time) {
            return '';
        }

        return `${date}T${time}:00`;
    };

    const availableAssets = assets.filter((asset) => asset.status === 'AVAILABLE');
    const selectedAsset = availableAssets.find((asset) => String(asset.id) === String(formData.assetId));
    const selectedResource = selectedAsset
        ? formatAssetResource(selectedAsset)
        : (formData.resourceType === 'Equipment'
            ? formData.equipmentName.trim()
                ? `Equipment: ${formData.equipmentName.trim()}`
                : ''
            : formData.resourceName);
    const isEquipmentBooking = selectedAsset?.type === 'Equipment' || formData.resourceType === 'Equipment';

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => {
            const updated = {
                ...previous,
                [name]: value,
                ...(name === 'resourceType' ? { resourceName: '', equipmentName: '', assetId: '' } : {})
            };

            if (name === 'assetId') {
                updated.resourceType = '';
                updated.resourceName = '';
                updated.equipmentName = '';
            }

            if ((name === 'resourceName' || name === 'equipmentName') && value) {
                updated.assetId = '';
            }

            // If startTime changes, only clear endTime when it's not after the new start
            if (name === 'startTime') {
                if (previous.endTime && previous.endTime > value) {
                    // keep previous endTime since it's still after the new start
                    updated.endTime = previous.endTime;
                } else {
                    updated.endTime = '';
                }
            }

            return updated;
        });

        // Clear errors when user changes relevant fields
        if (name === 'startDate' || name === 'startTime' || name === 'endTime') {
            setErrors(prev => ({ ...prev, timeError: '', dateError: '', conflictError: '' }));
            setConflictInfo(null);
            setTimeSlotChecked(false);
        }
        if (name === 'purpose') {
            setErrors(prev => ({ ...prev, purposeError: '' }));
        }
        if (name === 'expectedAttendees') {
            setErrors(prev => ({ ...prev, attendeeError: '' }));
        }
        if (name === 'assetId' || name === 'resourceType' || name === 'resourceName' || name === 'equipmentName') {
            setErrors(prev => ({ ...prev, conflictError: '' }));
            setConflictInfo(null);
            setTimeSlotChecked(false);
        }
    };

    const checkTimeSlotAvailability = async () => {
        const validationMessage = !formData.startDate
            ? 'Select a booking date before checking availability.'
            : !formData.startTime || !formData.endTime
                ? 'Choose both the start and end time before checking availability.'
                : !selectedResource
                    ? 'Select an admin asset or campus resource before checking availability.'
                    : '';

        if (validationMessage) {
            setErrors(prev => ({ ...prev, conflictError: validationMessage }));
            setConflictInfo(null);
            setTimeSlotChecked(false);
            return;
        }

        const newErrors = { ...errors };
        const startDateTime = buildDateTime(formData.startDate, formData.startTime);
        const endDateTime = buildDateTime(formData.startDate, formData.endTime);

        if (new Date(startDateTime) >= new Date(endDateTime)) {
            newErrors.timeError = 'Start time must be before end time';
            newErrors.conflictError = '';
            setErrors(newErrors);
            return;
        }

        setAvailabilityLoading(true);
        setConflictInfo(null);
        setErrors(prev => ({ ...prev, conflictError: '' }));

        try {
            const response = await api.get('/api/bookings/check-availability', {
                params: {
                    resource: selectedResource,
                    assetId: selectedAsset ? selectedAsset.id : undefined,
                    startTime: startDateTime,
                    endTime: endDateTime
                }
            });

            if (response.data.available) {
                setConflictInfo({ available: true, message: 'Time slot is available!' });
                setErrors(prev => ({ ...prev, conflictError: '' }));
                addNotification({
                    title: 'Booking slot is available',
                    message: `${selectedResource} is free for the selected time window.`,
                    type: 'success',
                    module: 'bookings'
                });
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
                addNotification({
                    title: 'Booking conflict detected',
                    message: `${response.data.conflictCount} conflicting booking(s) were found for ${selectedResource}.`,
                    type: 'warning',
                    module: 'bookings'
                });
            }
            setTimeSlotChecked(true);
        } catch (error) {
            console.error('Error checking availability:', error);
            const errorMessage = error.response?.data?.message
                || error.response?.data?.error
                || 'Availability check could not be completed. Please try again.';
            setErrors(prev => ({ ...prev, conflictError: errorMessage }));
            setConflictInfo(null);
            setTimeSlotChecked(false);
            addNotification({
                title: 'Availability check failed',
                message: errorMessage,
                type: 'error',
                module: 'bookings'
            });
        } finally {
            setAvailabilityLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = { timeError: '', dateError: '', purposeError: '', attendeeError: '', conflictError: '' };
        let hasErrors = false;

        // Validate that start time is before end time
        const startDateTime = buildDateTime(formData.startDate, formData.startTime);
        const endDateTime = buildDateTime(formData.startDate, formData.endTime);

        if (new Date(startDateTime) >= new Date(endDateTime)) {
            newErrors.timeError = 'Start time must be before end time';
            hasErrors = true;
        }

        if (!formData.startDate) {
            newErrors.dateError = 'Start date is required';
            hasErrors = true;
        }

        if (!selectedResource) {
            newErrors.conflictError = 'Select an admin asset or campus resource before submitting the booking';
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

        const payload = {
            resource: selectedResource,
            assetId: selectedAsset ? selectedAsset.id : null,
            startTime: startDateTime,
            endTime: endDateTime,
            purpose: formData.purpose,
            expectedAttendees: Number(formData.expectedAttendees)
        };

        try {
            await api.post('/api/bookings', payload);
            addNotification({
                title: 'Booking request submitted',
                message: `${selectedResource} was submitted for approval. Admins can review it now.`,
                type: 'success',
                module: 'bookings',
                roleScope: ['USER', 'ADMIN']
            });
            navigate('/bookings/my', { replace: true });
        } catch (error) {
            const backendMessage = error.response?.data ? JSON.stringify(error.response.data) : error.message;
            addNotification({
                title: 'Booking request failed',
                message: backendMessage,
                type: 'error',
                module: 'bookings'
            });
        }
    };

    return (
        <div className="booking-container">
            <div className="booking-header">
                <h1>Create Booking</h1>
                <p>Request a resource for your event or meeting</p>
            </div>

            {assetsLoading && (
                <div className="loading-message">
                    <p>Loading available assets...</p>
                </div>
            )}

            <div className="form-card">
                <form onSubmit={handleSubmit}>
                    <div className="booking-layout-grid">
                        <div className="form-group">
                            <label>Admin Asset:</label>
                            <select
                                name="assetId"
                                value={formData.assetId}
                                onChange={handleChange}
                                disabled={Boolean(formData.resourceType || formData.resourceName || formData.equipmentName)}
                            >
                                <option value="">Select an available asset</option>
                                {availableAssets.map((asset) => (
                                    <option key={asset.id} value={asset.id}>
                                        {asset.name} ({asset.type}) - {asset.location}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Resource Type: *</label>
                            <select
                                name="resourceType"
                                value={formData.resourceType}
                                onChange={handleChange}
                                required={!formData.assetId}
                                disabled={Boolean(formData.assetId)}
                            >
                                <option value="">Select resource</option>
                                <option value="Lecture Hall">Lecture Hall</option>
                                <option value="Lab">Lab</option>
                                <option value="Meeting Room">Meeting Room</option>
                                <option value="Equipment">Equipment</option>
                            </select>
                        </div>

                        {resourceOptions[formData.resourceType] && (
                            <div className="form-group">
                                <label>Select {formData.resourceType}: *</label>
                                <select name="resourceName" value={formData.resourceName} onChange={handleChange} required>
                                    <option value="">Choose {formData.resourceType.toLowerCase()}</option>
                                    {resourceOptions[formData.resourceType].map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

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
                            <label>Date: *</label>
                            <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required />
                            {errors.dateError && <div className="field-error">{errors.dateError}</div>}
                        </div>

                        <div className="form-group">
                            <label>Start Time: *</label>
                            <input
                                type="time"
                                name="startTime"
                                value={formData.startTime}
                                onChange={handleChange}
                                required
                                min="06:00"
                                max="21:59"
                                step="60"
                            />
                        </div>

                        <div className="form-group">
                            <label>End Time: *</label>
                            <input
                                type="time"
                                name="endTime"
                                value={formData.endTime}
                                onChange={handleChange}
                                required
                                min={endMin}
                                max="22:00"
                                step="60"
                            />
                            {errors.timeError && <div className="field-error">{errors.timeError}</div>}
                        </div>
                    </div>

                    <div className="booking-check-panel">
                        <div>
                            <p className="booking-check-title">Availability Check</p>
                            <p className="booking-check-copy">
                                Confirm the selected resource is free before sending your booking request.
                            </p>
                        </div>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={checkTimeSlotAvailability}
                            disabled={
                                availabilityLoading ||
                                !formData.startDate ||
                                !formData.startTime ||
                                !formData.endTime ||
                                !selectedResource
                            }
                        >
                            {availabilityLoading ? 'Checking availability...' : 'Check Availability'}
                        </button>
                    </div>

                    <div className="form-group">
                        {timeSlotChecked && conflictInfo && (
                            <div className={conflictInfo.available ? 'availability-success' : 'availability-warning'}>
                                <p className="conflict-status">
                                    {conflictInfo.available
                                        ? 'Time slot is available'
                                        : `Conflicts found: ${conflictInfo.conflictCount} booking(s)`}
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
                        <label>{isEquipmentBooking ? 'Equipment Quantity:' : 'Expected Attendees:'}</label>
                        <input 
                            type="number" 
                            name="expectedAttendees" 
                            placeholder={isEquipmentBooking ? 'Quantity needed' : 'Number of attendees'} 
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
