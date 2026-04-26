package com.sliit.nexus.dto.request;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class BookingRequest {
    private String resource;
    private Long assetId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String purpose;
    private Integer expectedAttendees;
}
