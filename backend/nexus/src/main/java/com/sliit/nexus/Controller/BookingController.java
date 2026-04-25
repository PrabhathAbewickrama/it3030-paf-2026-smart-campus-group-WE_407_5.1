package com.sliit.nexus.Controller;

import com.sliit.nexus.dto.request.BookingApprovalRequest;
import com.sliit.nexus.dto.request.BookingRequest;
import com.sliit.nexus.dto.response.BookingResponse;
import com.sliit.nexus.enums.BookingStatus;
import com.sliit.nexus.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody BookingRequest request
    ) {
        return ResponseEntity.ok(bookingService.createBooking(userId, request));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<BookingResponse> approveBooking(
            @RequestHeader("X-User-Role") String role,
            @PathVariable Long id,
            @RequestBody BookingApprovalRequest request
    ) {
        requireAdmin(role);
        return ResponseEntity.ok(bookingService.approveOrRejectBooking(id, request));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<BookingResponse> cancelBooking(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(bookingService.cancelBooking(id, userId));
    }

    @GetMapping("/my")
    public ResponseEntity<List<BookingResponse>> getMyBookings(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(bookingService.getUserBookings(userId));
    }

    @GetMapping
    public ResponseEntity<List<BookingResponse>> getAllBookings(
            @RequestHeader("X-User-Role") String role,
            @RequestParam(value = "status", required = false) BookingStatus status,
            @RequestParam(value = "resource", required = false) String resource,
            @RequestParam(value = "userId", required = false) Long userId
    ) {
        requireAdmin(role);
        return ResponseEntity.ok(bookingService.getAllBookings(status, resource, userId));
    }

    @GetMapping("/check-availability")
    public ResponseEntity<Map<String, Object>> checkAvailability(
            @RequestParam("resource") String resource,
            @RequestParam(value = "assetId", required = false) Long assetId,
            @RequestParam("startTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam("endTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime
    ) {
        Map<String, Object> response = new HashMap<>();
        boolean available = bookingService.isTimeSlotAvailable(resource, assetId, startTime, endTime);
        response.put("available", available);
        response.put("resource", resource);
        response.put("assetId", assetId);
        response.put("startTime", startTime);
        response.put("endTime", endTime);

        if (!available) {
            List<BookingResponse> conflicts = bookingService.getConflictingBookings(resource, assetId, startTime, endTime);
            response.put("conflictingBookings", conflicts);
            response.put("conflictCount", conflicts.size());
        }

        return ResponseEntity.ok(response);
    }

    private void requireAdmin(String role) {
        if (role == null || !"ADMIN".equals(role.replace("ROLE_", ""))) {
            throw new IllegalArgumentException("Admin role is required for this action");
        }
    }
}
