package com.sliit.nexus.dto.response;

import com.sliit.nexus.entity.Ticket;
import com.sliit.nexus.enums.TicketPriority;
import com.sliit.nexus.enums.TicketStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class TicketResponse {
    private Long id;
    private Long userId;
    private Long technicianId;
    private String technicianName;
    private String title;
    private String category;
    private String description;
    private TicketPriority priority;
    private TicketStatus status;
    private String contactDetails;
    private String locationOrResource;
    private String attachmentUrls;
    private String rejectedReason;
    private String resolutionNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static TicketResponse fromEntity(Ticket ticket) {
        return TicketResponse.builder()
                .id(ticket.getId())
                .userId(ticket.getUser() != null ? ticket.getUser().getId() : null)
                .technicianId(ticket.getTechnician() != null ? ticket.getTechnician().getId() : null)
                .technicianName(ticket.getTechnician() != null ? ticket.getTechnician().getName() : null)
                .title(ticket.getTitle())
                .category(ticket.getCategory())
                .description(ticket.getDescription())
                .priority(ticket.getPriority())
                .status(ticket.getStatus())
                .contactDetails(ticket.getContactDetails())
                .locationOrResource(ticket.getLocationOrResource())
                .attachmentUrls(ticket.getAttachmentUrls())
                .rejectedReason(ticket.getRejectedReason())
                .resolutionNotes(ticket.getResolutionNotes())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .build();
    }
}
