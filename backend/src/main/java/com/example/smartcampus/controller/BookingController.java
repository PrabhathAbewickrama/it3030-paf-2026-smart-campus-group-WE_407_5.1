package com.example.smartcampus.controller;

import com.example.smartcampus.dto.booking.BookingApprovalDTO;
import com.example.smartcampus.dto.booking.BookingRequestDTO;
import com.example.smartcampus.dto.booking.BookingResponseDTO;
import com.example.smartcampus.enums.BookingStatus;
import com.example.smartcampus.security.AuthenticatedUser;
import com.example.smartcampus.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    private AuthenticatedUser getAuthenticatedUser(Authentication auth) {
        if (auth == null || !(auth.getPrincipal() instanceof AuthenticatedUser authenticatedUser)) {
            throw new IllegalArgumentException("Authentication is required");
        }

        return authenticatedUser;
    }

    private Long getCurrentUserId(Authentication auth) {
        return getAuthenticatedUser(auth).getUserId();
    }

    @PostMapping
    public ResponseEntity<BookingResponseDTO> createBooking(@RequestBody BookingRequestDTO request, Authentication auth) {
        Long userId = getCurrentUserId(auth);
        BookingResponseDTO response = bookingService.createBooking(userId, request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingResponseDTO> approveBooking(@PathVariable Long id, @RequestBody BookingApprovalDTO approval) {
        BookingResponseDTO response = bookingService.approveOrRejectBooking(id, approval);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<BookingResponseDTO> cancelBooking(@PathVariable Long id, Authentication auth) {
        Long userId = getCurrentUserId(auth);
        BookingResponseDTO response = bookingService.cancelBooking(id, userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my")
    public ResponseEntity<List<BookingResponseDTO>> getMyBookings(Authentication auth) {
        Long userId = getCurrentUserId(auth);
        List<BookingResponseDTO> bookings = bookingService.getUserBookings(userId);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BookingResponseDTO>> getAllBookings(
            @RequestParam(value = "status", required = false) BookingStatus status,
            @RequestParam(value = "resource", required = false) String resource,
            @RequestParam(value = "userId", required = false) Long userId) {
        List<BookingResponseDTO> bookings = bookingService.getAllBookings(status, resource, userId);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponseDTO> getBooking(@PathVariable Long id, Authentication auth) {
        AuthenticatedUser authenticatedUser = getAuthenticatedUser(auth);
        BookingResponseDTO booking = bookingService.getBookingById(
                id,
                authenticatedUser.getUserId(),
                authenticatedUser.isAdmin()
        );
        return ResponseEntity.ok(booking);
    }

    @GetMapping("/check-availability")
    public ResponseEntity<Map<String, Object>> checkAvailability(
            @RequestParam("resource") String resource,
            @RequestParam("startTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam("endTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {

        Map<String, Object> response = new HashMap<>();
        try {
            boolean available = bookingService.isTimeSlotAvailable(resource, startTime, endTime);
            response.put("available", available);
            response.put("resource", resource);
            response.put("startTime", startTime);
            response.put("endTime", endTime);

            if (!available) {
                List<BookingResponseDTO> conflicts = bookingService.getConflictingBookings(resource, startTime, endTime);
                response.put("conflictingBookings", conflicts);
                response.put("conflictCount", conflicts.size());
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("available", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/conflicts")
    public ResponseEntity<Map<String, Object>> getConflicts(
            @RequestParam("resource") String resource,
            @RequestParam("startTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam("endTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {

        Map<String, Object> response = new HashMap<>();
        try {
            List<BookingResponseDTO> conflicts = bookingService.getConflictingBookings(resource, startTime, endTime);
            response.put("resource", resource);
            response.put("requestedStartTime", startTime);
            response.put("requestedEndTime", endTime);
            response.put("conflictingBookings", conflicts);
            response.put("conflictCount", conflicts.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
