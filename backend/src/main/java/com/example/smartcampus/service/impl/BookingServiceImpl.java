package com.example.smartcampus.service.impl;

import com.example.smartcampus.dto.booking.BookingRequestDTO;
import com.example.smartcampus.dto.booking.BookingResponseDTO;
import com.example.smartcampus.dto.booking.BookingApprovalDTO;
import com.example.smartcampus.entity.Booking;
import com.example.smartcampus.enums.BookingStatus;
import com.example.smartcampus.exception.ResourceNotFoundException;
import com.example.smartcampus.repository.BookingRepository;
import com.example.smartcampus.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingServiceImpl implements BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Override
    public BookingResponseDTO createBooking(Long userId, BookingRequestDTO request) {
        // Check for conflicts
        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                request.getResource(), request.getStartTime(), request.getEndTime());
        if (!conflicts.isEmpty()) {
            throw new IllegalArgumentException("Booking conflict detected for the selected resource and time.");
        }

        Booking booking = new Booking();
        booking.setUserId(userId);
        booking.setResource(request.getResource());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose());
        booking.setExpectedAttendees(request.getExpectedAttendees());
        booking.setStatus(BookingStatus.PENDING);

        Booking saved = bookingRepository.save(booking);
        return mapToResponseDTO(saved);
    }

    @Override
    public BookingResponseDTO approveOrRejectBooking(Long bookingId, BookingApprovalDTO approval) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalArgumentException("Booking is not in PENDING status");
        }
        booking.setStatus(approval.getStatus());
        booking.setAdminReason(approval.getAdminReason());
        Booking saved = bookingRepository.save(booking);
        return mapToResponseDTO(saved);
    }

    @Override
    public BookingResponseDTO cancelBooking(Long bookingId, Long userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        if (!booking.getUserId().equals(userId)) {
            throw new IllegalArgumentException("You can only cancel your own bookings");
        }
        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new IllegalArgumentException("Only approved bookings can be cancelled");
        }
        booking.setStatus(BookingStatus.CANCELLED);
        Booking saved = bookingRepository.save(booking);
        return mapToResponseDTO(saved);
    }

    @Override
    public List<BookingResponseDTO> getUserBookings(Long userId) {
        return bookingRepository.findByUserId(userId).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<BookingResponseDTO> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public BookingResponseDTO getBookingById(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        return mapToResponseDTO(booking);
    }

    private BookingResponseDTO mapToResponseDTO(Booking booking) {
        BookingResponseDTO dto = new BookingResponseDTO();
        dto.setId(booking.getId());
        dto.setUserId(booking.getUserId());
        dto.setResource(booking.getResource());
        dto.setStartTime(booking.getStartTime());
        dto.setEndTime(booking.getEndTime());
        dto.setPurpose(booking.getPurpose());
        dto.setExpectedAttendees(booking.getExpectedAttendees());
        dto.setStatus(booking.getStatus());
        dto.setAdminReason(booking.getAdminReason());
        dto.setCreatedAt(booking.getCreatedAt());
        return dto;
    }
}