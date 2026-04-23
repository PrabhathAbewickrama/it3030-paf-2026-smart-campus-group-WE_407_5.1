# Conflict Checking Implementation Guide

## Overview

Conflict checking is a validation process that ensures a resource (classroom, lab, projector, etc.) is not booked for overlapping time periods. This prevents double-booking and scheduling conflicts.

## Features Implemented

### 1. **Backend Implementation**

#### Repository Method (`BookingRepository.java`)
- **`findActiveConflicts()`**: Queries the database for any PENDING or APPROVED bookings that overlap with a requested time slot
- Uses proper temporal overlap logic: `(startTime < requestedEndTime AND endTime > requestedStartTime)`

#### Utility Class (`ConflictChecker.java`)
Provides reusable methods for conflict detection:
- `hasConflict()`: Checks if conflicts exist
- `isTimeOverlapping()`: Validates temporal overlap between two periods
- `validateBookingTimes()`: Ensures time parameters are valid
- `getConflictingBookings()`: Returns list of conflicting bookings

#### Custom Exception (`BookingConflictException.java`)
- Provides structured error handling for conflict scenarios
- Returns conflict details including resource name
- Maps to HTTP 409 (Conflict) status code

#### Service Layer (`BookingServiceImpl.java`)
- **Booking Creation**: Checks for conflicts before creating new bookings
- **Booking Approval**: Validates conflicts when admin approves pending bookings
- **Time Slot Checking**: New methods to check availability and get conflicts

#### Controller Endpoints (`BookingController.java`)
New REST endpoints:
- `GET /api/bookings/check-availability`: Check if a time slot is available
  - Parameters: `resource`, `startTime`, `endTime`
  - Returns: `{available: boolean, conflictingBookings: [], conflictCount: number}`
  
- `GET /api/bookings/conflicts`: Get list of conflicting bookings
  - Parameters: `resource`, `startTime`, `endTime`
  - Returns: List of bookings that conflict with the requested time

#### Global Exception Handler (`GlobalExceptionHandler.java`)
- Centralized error handling for REST API
- Converts `BookingConflictException` to appropriate HTTP responses
- Provides consistent error response format

### 2. **Frontend Implementation**

#### Updated BookingForm Component
New State Variables:
- `conflictInfo`: Stores availability check results
- `availabilityLoading`: Loading state during availability check
- `timeSlotChecked`: Tracks if availability has been verified

New Methods:
- `checkTimeSlotAvailability()`: 
  - Validates time inputs
  - Calls backend availability endpoint
  - Displays conflict information if conflicts exist

Updated Form Submission:
- Requires availability check before booking can be submitted
- Prevents booking if conflicts are detected
- Shows user-friendly error messages

#### UI/UX Enhancements
- "Check Availability" button (disabled until times and resource are selected)
- Visual indicators for availability status:
  - ✓ Green success message for available slots
  - ✗ Yellow warning message for conflicts
- Displays conflicting booking details:
  - Purpose of conflicting bookings
  - Time ranges of conflicts
- Error messages guide users to resolve conflicts

#### Styling (BookingForm.css)
New CSS classes:
- `.availability-success`: Green styling for available slots
- `.availability-warning`: Yellow styling for conflicts
- `.conflicts-list`: Displays conflicting booking details
- `.booking-purpose` and `.booking-time`: Style conflict details

## How It Works

### Creating a Booking

1. User fills in booking form (resource, start time, end time, purpose, attendees)
2. User clicks "Check Availability" button
3. Frontend calls `/api/bookings/check-availability`
4. Backend queries for overlapping bookings with same resource
5. Response shows availability status and any conflicts
6. User sees:
   - ✓ Green "available" message if no conflicts
   - ✗ Yellow warning with list of conflicting bookings if conflicts exist
7. If available, user can submit the booking
8. Backend performs final conflict check before saving
9. If conflicts detected at submission, booking is rejected with error

### Approving a Pending Booking

1. Admin reviews pending booking
2. If approving, system checks for conflicts again
3. If conflicts found since creation, approval is rejected
4. Admin sees detailed conflict information
5. Admin can reject the booking or request user to modify times

## Temporal Overlap Logic

The system uses standard temporal overlap detection:
```
Two periods overlap if:
  Period1.start < Period2.end AND Period1.end > Period2.start
```

Example:
- Period 1: 10:00 AM - 12:00 PM
- Period 2: 11:00 AM - 1:00 PM
- Overlap: YES (10:00 < 1:00 PM AND 12:00 PM > 11:00 AM)

## API Endpoints

### Check Availability
```
GET /api/bookings/check-availability
?resource=Lab&startTime=2026-04-25T10:00:00&endTime=2026-04-25T12:00:00

Response (Available):
{
  "available": true,
  "resource": "Lab",
  "startTime": "2026-04-25T10:00:00",
  "endTime": "2026-04-25T12:00:00"
}

Response (Conflict):
{
  "available": false,
  "resource": "Lab",
  "startTime": "2026-04-25T10:00:00",
  "endTime": "2026-04-25T12:00:00",
  "conflictCount": 1,
  "conflictingBookings": [
    {
      "id": 5,
      "resource": "Lab",
      "startTime": "2026-04-25T11:00:00",
      "endTime": "2026-04-25T13:00:00",
      "purpose": "Chemistry Practical",
      "status": "APPROVED"
    }
  ]
}
```

### Get Conflicts
```
GET /api/bookings/conflicts
?resource=Meeting%20Room&startTime=2026-04-25T14:00:00&endTime=2026-04-25T15:00:00

Response:
{
  "resource": "Meeting Room",
  "requestedStartTime": "2026-04-25T14:00:00",
  "requestedEndTime": "2026-04-25T15:00:00",
  "conflictCount": 0,
  "conflictingBookings": []
}
```

## Error Handling

### Conflict Detection Errors

1. **During Creation**
   - HTTP 409 Conflict
   - Message: "Booking conflict detected for resource 'Lab' during the requested time period. Found X conflicting booking(s)."

2. **During Approval**
   - HTTP 409 Conflict
   - Message: "Cannot approve booking: Conflict detected with X other booking(s) for resource 'Lab'."

3. **Invalid Times**
   - HTTP 400 Bad Request
   - Message: "Start time must be before end time" or "Start time cannot be in the past"

### Frontend Validation

- Availability check required before booking submission
- Clear error messages if availability check fails
- Display of conflicting bookings to help users choose alternate times

## Database Considerations

The conflict check queries:
- Only PENDING and APPROVED bookings (ignores REJECTED and CANCELLED)
- Uses indexed fields: `resource`, `startTime`, `endTime`, `status`
- Efficient temporal overlap check using database comparison operators

## Future Enhancements

1. **Time Slot Suggestions**: Suggest available time slots based on user preferences
2. **Resource Availability Calendar**: Show availability calendar for each resource
3. **Recurring Bookings**: Support for repeating bookings with conflict detection
4. **Priority Booking**: Admin override for high-priority bookings
5. **Notification System**: Notify users of conflicts before final submission
6. **Booking Waitlist**: Allow users to join waitlist if resource is unavailable

## Testing the Feature

### Manual Testing

1. **Test 1: Create Non-Conflicting Booking**
   - Create booking for Lab on 2026-04-25 10:00-12:00
   - Should show "Available" status
   - Booking should be created successfully

2. **Test 2: Detect Conflict**
   - Create first booking for Lab on 2026-04-25 10:00-12:00
   - Try to create second booking for same resource 11:00-13:00
   - Should show conflict warning with first booking details
   - Second booking should be rejected

3. **Test 3: Conflict on Approval**
   - Create pending booking A
   - Create approved booking B that overlaps with A
   - Try to approve booking A
   - Should reject with conflict error

### Using cURL

```bash
# Check availability
curl "http://localhost:8081/api/bookings/check-availability?resource=Lab&startTime=2026-04-25T10:00:00&endTime=2026-04-25T12:00:00"

# Get conflicts
curl "http://localhost:8081/api/bookings/conflicts?resource=Lab&startTime=2026-04-25T10:00:00&endTime=2026-04-25T12:00:00"
```

## File Changes Summary

### Backend Files
- `BookingRepository.java`: Added `findActiveConflicts()` method
- `BookingServiceImpl.java`: Enhanced conflict checking in create/approve methods
- `BookingService.java`: Added new interface methods
- `BookingController.java`: Added new REST endpoints
- `ConflictChecker.java`: New utility class (created)
- `BookingConflictException.java`: New exception class (created)
- `GlobalExceptionHandler.java`: New exception handler (created)

### Frontend Files
- `BookingForm.js`: Added availability check functionality
- `BookingForm.css`: Added styling for conflict display

## Deployment Notes

1. Ensure database migrations complete successfully
2. Verify all new classes compile without errors
3. Test API endpoints before deploying to production
4. Consider adding database indexes on `(resource, startTime, endTime, status)` for performance
5. Monitor conflict rejection rates to identify scheduling issues
