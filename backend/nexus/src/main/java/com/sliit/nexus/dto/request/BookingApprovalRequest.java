package com.sliit.nexus.dto.request;

import com.sliit.nexus.enums.BookingStatus;
import lombok.Data;

@Data
public class BookingApprovalRequest {
    private BookingStatus status;
    private String adminReason;
}
