package com.sliit.nexus.dto.response;

import com.sliit.nexus.entity.TicketComment;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class TicketCommentResponse {
    private Long id;
    private Long ticketId;
    private Long userId;
    private String userName;
    private String comment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static TicketCommentResponse fromEntity(TicketComment commentEntity) {
        return TicketCommentResponse.builder()
                .id(commentEntity.getId())
                .ticketId(commentEntity.getTicket().getId())
                .userId(commentEntity.getUser().getId())
                .userName(commentEntity.getUser().getName())
                .comment(commentEntity.getComment())
                .createdAt(commentEntity.getCreatedAt())
                .updatedAt(commentEntity.getUpdatedAt())
                .build();
    }
}
