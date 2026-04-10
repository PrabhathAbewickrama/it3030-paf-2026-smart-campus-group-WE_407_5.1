package com.example.smartcampus.service;

import com.example.smartcampus.dto.booking.BookingRequestDTO;
import com.example.smartcampus.dto.booking.BookingResponseDTO;
import com.example.smartcampus.dto.booking.BookingApprovalDTO;

import java.util.List;

public interface BookingService {

    BookingResponseDTO createBooking(Long userId, BookingRequestDTO request);

    BookingResponseDTO approveOrRejectBooking(Long bookingId, BookingApprovalDTO approval);

    BookingResponseDTO cancelBooking(Long bookingId, Long userId);

    List<BookingResponseDTO> getUserBookings(Long userId);

    List<BookingResponseDTO> getAllBookings();

    BookingResponseDTO getBookingById(Long bookingId);
}