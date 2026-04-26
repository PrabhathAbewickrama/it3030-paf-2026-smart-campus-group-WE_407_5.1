package com.sliit.nexus.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TicketRejectRequest {
    @NotBlank(message = "Rejection reason is required")
    private String reason;
}
