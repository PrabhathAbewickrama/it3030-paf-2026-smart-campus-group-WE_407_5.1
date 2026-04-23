package com.example.smartcampus.service.impl;

import com.example.smartcampus.dto.booking.BookingRequestDTO;
import com.example.smartcampus.dto.booking.BookingResponseDTO;
import com.example.smartcampus.dto.booking.BookingApprovalDTO;
import com.example.smartcampus.entity.Booking;
import com.example.smartcampus.enums.BookingStatus;
import com.example.smartcampus.exception.ResourceNotFoundException;
import com.example.smartcampus.exception.BookingConflictException;
import com.example.smartcampus.repository.BookingRepository;
import com.example.smartcampus.service.BookingService;
import com.example.smartcampus.util.ConflictChecker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingServiceImpl implements BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Override
    public BookingResponseDTO createBooking(Long userId, BookingRequestDTO request) {
        // Validate input
        if (request.getResource() == null || request.getResource().trim().isEmpty()) {
            throw new IllegalArgumentException("Resource is required");
        }
        
        ConflictChecker.validateBookingTimes(request.getStartTime(), request.getEndTime());

        // Check for conflicts
        List<Booking> conflicts = bookingRepository.findActiveConflicts(
                request.getResource(), request.getStartTime(), request.getEndTime());
        if (!conflicts.isEmpty()) {
            throw new BookingConflictException(
                    "Booking conflict detected for resource '" + request.getResource() + 
                    "' during the requested time period. Found " + conflicts.size() + " conflicting booking(s).",
                    request.getResource());
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
        
        // If approving, check for conflicts again to ensure no other approved bookings conflict
        if (approval.getStatus() == BookingStatus.APPROVED) {
            List<Booking> approvedConflicts = bookingRepository.findActiveConflicts(
                    booking.getResource(), booking.getStartTime(), booking.getEndTime());
            
            // Remove the current booking from conflict list if it exists
            approvedConflicts.removeIf(b -> b.getId().equals(bookingId));
            
            if (!approvedConflicts.isEmpty()) {
                throw new BookingConflictException(
                        "Cannot approve booking: Conflict detected with " + approvedConflicts.size() + 
                        " other booking(s) for resource '" + booking.getResource() + "'.",
                        booking.getResource());
            }
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

    @Override
    public boolean isTimeSlotAvailable(String resource, LocalDateTime startTime, LocalDateTime endTime) {
        List<Booking> conflicts = bookingRepository.findActiveConflicts(resource, startTime, endTime);
        return conflicts.isEmpty();
    }

    @Override
    public List<BookingResponseDTO> getConflictingBookings(String resource, LocalDateTime startTime, LocalDateTime endTime) {
        List<Booking> conflicts = bookingRepository.findActiveConflicts(resource, startTime, endTime);
        return conflicts.stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }
}