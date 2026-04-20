package com.sliit.nexus.service;

import com.sliit.nexus.entity.Ticket;
import com.sliit.nexus.entity.TicketComment;
import com.sliit.nexus.entity.User;
import com.sliit.nexus.repository.TicketCommentRepository;
import com.sliit.nexus.repository.TicketRepository;
import com.sliit.nexus.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketCommentService {
    private final TicketCommentRepository ticketCommentRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    public List<TicketComment> getCommentsByTicket(Long ticketId) {
        ensureTicketExists(ticketId);
        return ticketCommentRepository.findAllByTicketIdOrderByCreatedAtAsc(ticketId);
    }

    public TicketComment addComment(Long ticketId, Long userId, String commentText) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new EntityNotFoundException("Ticket not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        TicketComment comment = TicketComment.builder()
                .ticket(ticket)
                .user(user)
                .comment(commentText.trim())
                .build();

        return ticketCommentRepository.save(comment);
    }

    public TicketComment updateComment(Long ticketId, Long commentId, Long userId, String commentText) {
        TicketComment comment = getOwnedComment(ticketId, commentId, userId);
        comment.setComment(commentText.trim());
        return ticketCommentRepository.save(comment);
    }

    public void deleteComment(Long ticketId, Long commentId, Long userId) {
        TicketComment comment = getOwnedComment(ticketId, commentId, userId);
        ticketCommentRepository.delete(comment);
    }

    private TicketComment getOwnedComment(Long ticketId, Long commentId, Long userId) {
        TicketComment comment = ticketCommentRepository.findById(commentId)
                .orElseThrow(() -> new EntityNotFoundException("Comment not found"));

        if (!comment.getTicket().getId().equals(ticketId)) {
            throw new IllegalArgumentException("Comment does not belong to this ticket");
        }

        if (!comment.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Only comment owner can edit or delete this comment");
        }
        return comment;
    }

    private void ensureTicketExists(Long ticketId) {
        if (!ticketRepository.existsById(ticketId)) {
            throw new EntityNotFoundException("Ticket not found");
        }
    }
}
