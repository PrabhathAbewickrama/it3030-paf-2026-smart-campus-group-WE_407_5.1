package com.example.smartcampus.service;

import com.example.smartcampus.dto.booking.BookingRequestDTO;
import com.example.smartcampus.dto.booking.BookingResponseDTO;
import com.example.smartcampus.dto.booking.BookingApprovalDTO;
import com.example.smartcampus.enums.BookingStatus;

import java.time.LocalDateTime;
import java.util.List;

public interface BookingService {

    BookingResponseDTO createBooking(Long userId, BookingRequestDTO request);

    BookingResponseDTO approveOrRejectBooking(Long bookingId, BookingApprovalDTO approval);

    BookingResponseDTO cancelBooking(Long bookingId, Long userId);

    List<BookingResponseDTO> getUserBookings(Long userId);

    List<BookingResponseDTO> getAllBookings(BookingStatus status, String resource, Long userId);

    BookingResponseDTO getBookingById(Long bookingId, Long requesterUserId, boolean isAdmin);
    
    /**
     * Check if a time slot is available for a resource
     * @param resource The resource to check
     * @param startTime Start time of the requested slot
     * @param endTime End time of the requested slot
     * @return true if the slot is available, false if there are conflicts
     */
    boolean isTimeSlotAvailable(String resource, LocalDateTime startTime, LocalDateTime endTime);
    
    /**
     * Get list of bookings that conflict with the given time slot
     * @param resource The resource to check
     * @param startTime Start time of the requested slot
     * @param endTime End time of the requested slot
     * @return List of conflicting bookings
     */
    List<BookingResponseDTO> getConflictingBookings(String resource, LocalDateTime startTime, LocalDateTime endTime);
}
