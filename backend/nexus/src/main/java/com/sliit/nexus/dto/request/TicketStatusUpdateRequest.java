package com.sliit.nexus.dto.request;

import com.sliit.nexus.enums.TicketStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TicketStatusUpdateRequest {
    @NotNull(message = "Status is required")
    private TicketStatus status;
    private String note;
}
