package com.sliit.nexus.repository;

import com.sliit.nexus.entity.TicketComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketCommentRepository extends JpaRepository<TicketComment, Long> {
    List<TicketComment> findAllByTicketIdOrderByCreatedAtAsc(Long ticketId);
}
