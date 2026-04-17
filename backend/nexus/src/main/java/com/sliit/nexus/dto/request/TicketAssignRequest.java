package com.sliit.nexus.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TicketAssignRequest {
    @NotNull(message = "Technician ID is required")
    private Long technicianId;
}
