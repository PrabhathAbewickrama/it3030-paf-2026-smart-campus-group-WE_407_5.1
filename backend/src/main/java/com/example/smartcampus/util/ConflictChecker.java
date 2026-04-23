package com.example.smartcampus.util;

import com.example.smartcampus.entity.Booking;
import com.example.smartcampus.enums.BookingStatus;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Utility class for checking booking conflicts
 */
public class ConflictChecker {

    /**
     * Check if there are any active booking conflicts for a resource during the given time period
     * @param bookings List of active bookings for the resource
     * @param startTime Start time of the new booking
     * @param endTime End time of the new booking
     * @param excludeBookingId Optional booking ID to exclude from conflict check (for updates)
     * @return true if there are conflicts, false otherwise
     */
    public static boolean hasConflict(List<Booking> bookings, LocalDateTime startTime, 
                                     LocalDateTime endTime, Long excludeBookingId) {
        return bookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.PENDING || b.getStatus() == BookingStatus.APPROVED)
                .filter(b -> excludeBookingId == null || !b.getId().equals(excludeBookingId))
                .anyMatch(b -> isTimeOverlapping(b.getStartTime(), b.getEndTime(), startTime, endTime));
    }

    /**
     * Check if there are any active booking conflicts without excluding any booking
     */
    public static boolean hasConflict(List<Booking> bookings, LocalDateTime startTime, LocalDateTime endTime) {
        return hasConflict(bookings, startTime, endTime, null);
    }

    /**
     * Get conflicting bookings
     */
    public static List<Booking> getConflictingBookings(List<Booking> bookings, LocalDateTime startTime, 
                                                       LocalDateTime endTime, Long excludeBookingId) {
        return bookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.PENDING || b.getStatus() == BookingStatus.APPROVED)
                .filter(b -> excludeBookingId == null || !b.getId().equals(excludeBookingId))
                .filter(b -> isTimeOverlapping(b.getStartTime(), b.getEndTime(), startTime, endTime))
                .toList();
    }

    /**
     * Check if two time periods overlap
     * Two periods overlap if: start1 < end2 AND end1 > start2
     */
    public static boolean isTimeOverlapping(LocalDateTime start1, LocalDateTime end1,
                                           LocalDateTime start2, LocalDateTime end2) {
        return start1.isBefore(end2) && end1.isAfter(start2);
    }

    /**
     * Validate booking time parameters
     */
    public static void validateBookingTimes(LocalDateTime startTime, LocalDateTime endTime) {
        if (startTime == null || endTime == null) {
            throw new IllegalArgumentException("Start time and end time are required");
        }
        if (!startTime.isBefore(endTime)) {
            throw new IllegalArgumentException("Start time must be before end time");
        }
        if (startTime.isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Start time cannot be in the past");
        }
    }

    /**
     * Get available time slots for a resource (basic helper)
     */
    public static boolean isTimeSlotAvailable(List<Booking> bookings, LocalDateTime startTime, 
                                             LocalDateTime endTime) {
        return !hasConflict(bookings, startTime, endTime);
    }
}
