package com.sliit.nexus.service;

import com.sliit.nexus.dto.request.BookingApprovalRequest;
import com.sliit.nexus.dto.request.BookingRequest;
import com.sliit.nexus.dto.response.BookingResponse;
import com.sliit.nexus.entity.Asset;
import com.sliit.nexus.entity.Booking;
import com.sliit.nexus.enums.AssetStatus;
import com.sliit.nexus.enums.BookingStatus;
import com.sliit.nexus.repository.AssetRepository;
import com.sliit.nexus.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final AssetRepository assetRepository;

    @Override
    public BookingResponse createBooking(Long userId, BookingRequest request) {
        validateRequest(request);
        String resource = resolveResource(request);

        if (!bookingRepository.findActiveConflicts(resource, request.getAssetId(), request.getStartTime(), request.getEndTime()).isEmpty()) {
            throw new IllegalArgumentException("Selected time slot is not available for this resource");
        }

        Booking booking = Booking.builder()
                .userId(userId)
                .resource(resource)
                .assetId(request.getAssetId())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .purpose(request.getPurpose().trim())
                .expectedAttendees(request.getExpectedAttendees())
                .status(BookingStatus.PENDING)
                .build();

        return map(bookingRepository.save(booking));
    }

    @Override
    public BookingResponse approveOrRejectBooking(Long bookingId, BookingApprovalRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalArgumentException("Only pending bookings can be reviewed");
        }

        if (request.getStatus() == null || (request.getStatus() != BookingStatus.APPROVED && request.getStatus() != BookingStatus.REJECTED)) {
            throw new IllegalArgumentException("Review status must be APPROVED or REJECTED");
        }

        Asset approvedAsset = null;
        if (request.getStatus() == BookingStatus.APPROVED) {
            approvedAsset = getAvailableAssetForApproval(booking.getAssetId());
            List<Booking> conflicts = bookingRepository.findActiveConflicts(booking.getResource(), booking.getAssetId(), booking.getStartTime(), booking.getEndTime());
            conflicts.removeIf(item -> item.getId().equals(bookingId));
            if (!conflicts.isEmpty()) {
                throw new IllegalArgumentException("Cannot approve booking because the slot is already taken");
            }
        }

        booking.setStatus(request.getStatus());
        booking.setAdminReason(request.getAdminReason());
        if (approvedAsset != null) {
            approvedAsset.setStatus(AssetStatus.IN_USE);
            assetRepository.save(approvedAsset);
        }
        return map(bookingRepository.save(booking));
    }

    @Override
    public BookingResponse cancelBooking(Long bookingId, Long userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        if (!booking.getUserId().equals(userId)) {
            throw new IllegalArgumentException("You can only cancel your own bookings");
        }

        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new IllegalArgumentException("Only approved bookings can be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        markAssetAvailableIfInUse(booking.getAssetId());
        return map(bookingRepository.save(booking));
    }

    @Override
    public List<BookingResponse> getUserBookings(Long userId) {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::map)
                .toList();
    }

    @Override
    public List<BookingResponse> getAllBookings(BookingStatus status, String resource, Long userId) {
        return bookingRepository.findAll().stream()
                .filter(item -> status == null || item.getStatus() == status)
                .filter(item -> resource == null || resource.isBlank() || item.getResource().toLowerCase().contains(resource.trim().toLowerCase()))
                .filter(item -> userId == null || item.getUserId().equals(userId))
                .sorted(Comparator.comparing(Booking::getCreatedAt).reversed())
                .map(this::map)
                .toList();
    }

    @Override
    public boolean isTimeSlotAvailable(String resource, Long assetId, LocalDateTime startTime, LocalDateTime endTime) {
        validateTimes(startTime, endTime);
        String bookingResource = resolveAvailabilityResource(resource, assetId);
        return bookingRepository.findActiveConflicts(bookingResource, assetId, startTime, endTime).isEmpty();
    }

    @Override
    public List<BookingResponse> getConflictingBookings(String resource, Long assetId, LocalDateTime startTime, LocalDateTime endTime) {
        validateTimes(startTime, endTime);
        String bookingResource = resolveAvailabilityResource(resource, assetId);
        return bookingRepository.findActiveConflicts(bookingResource, assetId, startTime, endTime).stream()
                .sorted(Comparator.comparing(Booking::getStartTime))
                .map(this::map)
                .toList();
    }

    private void validateRequest(BookingRequest request) {
        if (request.getPurpose() == null || request.getPurpose().trim().isEmpty()) {
            throw new IllegalArgumentException("Purpose is required");
        }

        validateTimes(request.getStartTime(), request.getEndTime());
    }

    private String resolveResource(BookingRequest request) {
        if (request.getAssetId() != null) {
            Asset asset = assetRepository.findById(request.getAssetId())
                    .orElseThrow(() -> new IllegalArgumentException("Selected asset was not found"));
            if (asset.getStatus() != AssetStatus.AVAILABLE) {
                throw new IllegalArgumentException("Selected asset is not available for booking");
            }
            return formatAssetResource(asset);
        }

        if (request.getResource() == null || request.getResource().trim().isEmpty()) {
            throw new IllegalArgumentException("Resource is required");
        }

        return request.getResource().trim();
    }

    private String resolveAvailabilityResource(String resource, Long assetId) {
        if (assetId != null) {
            Asset asset = assetRepository.findById(assetId)
                    .orElseThrow(() -> new IllegalArgumentException("Selected asset was not found"));
            if (asset.getStatus() != AssetStatus.AVAILABLE) {
                throw new IllegalArgumentException("Selected asset is not available for booking");
            }
            return formatAssetResource(asset);
        }

        if (resource == null || resource.trim().isEmpty()) {
            throw new IllegalArgumentException("Resource is required");
        }

        return resource.trim();
    }

    private Asset getAvailableAssetForApproval(Long assetId) {
        if (assetId == null) {
            return null;
        }

        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new IllegalArgumentException("Selected asset was not found"));
        if (asset.getStatus() != AssetStatus.AVAILABLE) {
            throw new IllegalArgumentException("Selected asset is not available for approval");
        }

        return asset;
    }

    private void markAssetAvailableIfInUse(Long assetId) {
        if (assetId == null) {
            return;
        }

        assetRepository.findById(assetId).ifPresent(asset -> {
            if (asset.getStatus() == AssetStatus.IN_USE) {
                asset.setStatus(AssetStatus.AVAILABLE);
                assetRepository.save(asset);
            }
        });
    }

    private String formatAssetResource(Asset asset) {
        return String.format("%s (%s)", asset.getName().trim(), asset.getLocation().trim());
    }

    private void validateTimes(LocalDateTime startTime, LocalDateTime endTime) {
        if (startTime == null || endTime == null) {
            throw new IllegalArgumentException("Start time and end time are required");
        }

        if (!startTime.isBefore(endTime)) {
            throw new IllegalArgumentException("Start time must be before end time");
        }
    }

    private BookingResponse map(Booking booking) {
        return BookingResponse.builder()
                .id(booking.getId())
                .userId(booking.getUserId())
                .resource(booking.getResource())
                .assetId(booking.getAssetId())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .purpose(booking.getPurpose())
                .expectedAttendees(booking.getExpectedAttendees())
                .status(booking.getStatus())
                .adminReason(booking.getAdminReason())
                .createdAt(booking.getCreatedAt())
                .build();
    }
}
