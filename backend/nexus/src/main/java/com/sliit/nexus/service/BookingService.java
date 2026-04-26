package com.sliit.nexus.service;

import com.sliit.nexus.dto.request.BookingApprovalRequest;
import com.sliit.nexus.dto.request.BookingRequest;
import com.sliit.nexus.dto.response.BookingResponse;
import com.sliit.nexus.enums.BookingStatus;

import java.time.LocalDateTime;
import java.util.List;

public interface BookingService {
    BookingResponse createBooking(Long userId, BookingRequest request);
    BookingResponse approveOrRejectBooking(Long bookingId, BookingApprovalRequest request);
    BookingResponse cancelBooking(Long bookingId, Long userId);
    List<BookingResponse> getUserBookings(Long userId);
    List<BookingResponse> getAllBookings(BookingStatus status, String resource, Long userId);
    boolean isTimeSlotAvailable(String resource, Long assetId, LocalDateTime startTime, LocalDateTime endTime);
    List<BookingResponse> getConflictingBookings(String resource, Long assetId, LocalDateTime startTime, LocalDateTime endTime);
}
