package com.sliit.nexus.Controller;

public package com.sliit.nexus.controller;

import com.sliit.nexus.dto.request.TicketCommentRequest;
import com.sliit.nexus.dto.response.TicketCommentResponse;
import com.sliit.nexus.service.TicketCommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets/{ticketId}/comments")
@RequiredArgsConstructor
public class TicketCommentController {
    private final TicketCommentService ticketCommentService;

    @GetMapping
    public List<TicketCommentResponse> getComments(@PathVariable Long ticketId) {
        return ticketCommentService.getCommentsByTicket(ticketId).stream()
                .map(TicketCommentResponse::fromEntity)
                .toList();
    }

    @PostMapping("/user/{userId}")
    public TicketCommentResponse addComment(
            @PathVariable Long ticketId,
            @PathVariable Long userId,
            @Valid @RequestBody TicketCommentRequest request
    ) {
        return TicketCommentResponse.fromEntity(ticketCommentService.addComment(ticketId, userId, request.getComment()));
    }

    @PutMapping("/{commentId}/user/{userId}")
    public TicketCommentResponse updateComment(
            @PathVariable Long ticketId,
            @PathVariable Long commentId,
            @PathVariable Long userId,
            @Valid @RequestBody TicketCommentRequest request
    ) {
        return TicketCommentResponse.fromEntity(ticketCommentService.updateComment(ticketId, commentId, userId, request.getComment()));
    }

    @DeleteMapping("/{commentId}/user/{userId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long ticketId,
            @PathVariable Long commentId,
            @PathVariable Long userId
    ) {
        ticketCommentService.deleteComment(ticketId, commentId, userId);
        return ResponseEntity.noContent().build();
    }
}
 {
    
}
