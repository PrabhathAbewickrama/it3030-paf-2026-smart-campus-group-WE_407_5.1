package com.sliit.nexus.controller;

import com.sliit.nexus.dto.request.TicketCreateRequest;
import com.sliit.nexus.dto.request.TicketRejectRequest;
import com.sliit.nexus.dto.request.TicketAssignRequest;
import com.sliit.nexus.dto.request.TicketStatusUpdateRequest;
import com.sliit.nexus.dto.response.TicketResponse;
import com.sliit.nexus.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {
    private final TicketService ticketService;

    @GetMapping
    public List<TicketResponse> getTickets() {
        return ticketService.getAllTickets().stream()
                .map(TicketResponse::fromEntity)
                .toList();
    }

    @PostMapping(value = "/user/{userId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public TicketResponse createTicket(@PathVariable Long userId, @Valid @ModelAttribute TicketCreateRequest request) {
        return TicketResponse.fromEntity(ticketService.createTicket(userId, request));
    }

    @PatchMapping("/{ticketId}/status")
    public TicketResponse updateStatus(@PathVariable Long ticketId, @Valid @RequestBody TicketStatusUpdateRequest request) {
        return TicketResponse.fromEntity(ticketService.updateStatus(ticketId, request.getStatus(), request.getNote()));
    }

    @PatchMapping("/{ticketId}/reject")
    public TicketResponse rejectTicket(@PathVariable Long ticketId, @Valid @RequestBody TicketRejectRequest request) {
        return TicketResponse.fromEntity(ticketService.rejectTicket(ticketId, request.getReason()));
    }

    @PatchMapping("/{ticketId}/assign")
    public TicketResponse assignTechnician(@PathVariable Long ticketId, @Valid @RequestBody TicketAssignRequest request) {
        return TicketResponse.fromEntity(ticketService.assignTechnician(ticketId, request.getTechnicianId()));
    }
}
