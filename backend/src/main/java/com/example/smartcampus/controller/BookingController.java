package com.example.smartcampus.controller;

import com.example.smartcampus.dto.booking.BookingRequestDTO;
import com.example.smartcampus.dto.booking.BookingResponseDTO;
import com.example.smartcampus.dto.booking.BookingApprovalDTO;
import com.example.smartcampus.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
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

    // Assume userId from authentication
    private Long getCurrentUserId(Authentication auth) {
        // Placeholder: implement based on your auth system
        return 1L; // Replace with actual user extraction
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
    public ResponseEntity<List<BookingResponseDTO>> getAllBookings() {
        List<BookingResponseDTO> bookings = bookingService.getAllBookings();
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponseDTO> getBooking(@PathVariable Long id) {
        BookingResponseDTO booking = bookingService.getBookingById(id);
        return ResponseEntity.ok(booking);
    }

    /**
     * Check if a time slot is available for a resource
     * @param resource The resource to check
     * @param startTime Start time (format: yyyy-MM-dd'T'HH:mm:ss)
     * @param endTime End time (format: yyyy-MM-dd'T'HH:mm:ss)
     * @return Response with availability status
     */
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

    /**
     * Get conflicting bookings for a resource during a time period
     * @param resource The resource to check
     * @param startTime Start time (format: yyyy-MM-dd'T'HH:mm:ss)
     * @param endTime End time (format: yyyy-MM-dd'T'HH:mm:ss)
     * @return List of conflicting bookings
     */
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