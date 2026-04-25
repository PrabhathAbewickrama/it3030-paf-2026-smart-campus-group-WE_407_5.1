package com.sliit.nexus.repository;

import com.sliit.nexus.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("""
        SELECT b FROM Booking b
        WHERE (
              (:assetId IS NOT NULL AND b.assetId = :assetId)
              OR (:assetId IS NULL AND b.resource = :resource)
          )
          AND b.status <> com.sliit.nexus.enums.BookingStatus.REJECTED
          AND b.status <> com.sliit.nexus.enums.BookingStatus.CANCELLED
          AND b.startTime < :endTime
          AND b.endTime > :startTime
        ORDER BY b.startTime ASC
        """)
    List<Booking> findActiveConflicts(
            @Param("resource") String resource,
            @Param("assetId") Long assetId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );
}
