package com.sliit.nexus.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TicketCommentRequest {
    @NotBlank(message = "Comment text is required")
    private String comment;
}
