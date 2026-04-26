package com.sliit.nexus.service;

import com.sliit.nexus.dto.request.TicketCreateRequest;
import com.sliit.nexus.entity.Ticket;
import com.sliit.nexus.entity.User;
import com.sliit.nexus.enums.Role;
import com.sliit.nexus.enums.TicketStatus;
import com.sliit.nexus.repository.TicketRepository;
import com.sliit.nexus.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TicketService {
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    @Value("${app.file-upload-dir:uploads/tickets}")
    private String uploadDir;

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    public Ticket createTicket(Long userId, TicketCreateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        String resolvedTitle = StringUtils.hasText(request.getTitle())
                ? request.getTitle().trim()
                : request.getLocationOrResource().trim();

        Ticket ticket = Ticket.builder()
                .user(user)
                .title(resolvedTitle)
                .category(request.getCategory().trim())
                .description(request.getDescription().trim())
                .priority(request.getPriority())
                .status(TicketStatus.OPEN)
                .contactDetails(request.getContactDetails().trim())
                .locationOrResource(request.getLocationOrResource().trim())
                .attachmentUrls(storeEvidenceImages(request.getImages()))
                .build();

        return ticketRepository.save(ticket);
    }

    public Ticket updateStatus(Long ticketId, TicketStatus status, String note) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new EntityNotFoundException("Ticket not found"));
        if (ticket.getStatus() == TicketStatus.OPEN && status == TicketStatus.IN_PROGRESS && ticket.getTechnician() == null) {
            throw new IllegalArgumentException("Assign a technician before starting work");
        }
        validateStatusTransition(ticket.getStatus(), status);
        ticket.setRejectedReason(null);
        ticket.setStatus(status);
        appendResolutionNote(ticket, note);
        return ticketRepository.save(ticket);
    }

    public Ticket assignTechnician(Long ticketId, Long technicianId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new EntityNotFoundException("Ticket not found"));

        User technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new EntityNotFoundException("Technician not found"));

        if (technician.getRole() != Role.TECHNICIAN) {
            throw new IllegalArgumentException("Assigned user must have TECHNICIAN role");
        }

        if (ticket.getStatus() == TicketStatus.CLOSED || ticket.getStatus() == TicketStatus.REJECTED) {
            throw new IllegalArgumentException("Cannot assign technician to closed or rejected tickets");
        }

        ticket.setTechnician(technician);
        return ticketRepository.save(ticket);
    }

    public Ticket rejectTicket(Long ticketId, String reason) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new EntityNotFoundException("Ticket not found"));

        if (ticket.getStatus() == TicketStatus.CLOSED || ticket.getStatus() == TicketStatus.REJECTED) {
            throw new IllegalArgumentException("Only active tickets can be rejected");
        }

        if (!StringUtils.hasText(reason)) {
            throw new IllegalArgumentException("Rejection reason is required");
        }

        ticket.setStatus(TicketStatus.REJECTED);
        ticket.setRejectedReason(reason.trim());
        return ticketRepository.save(ticket);
    }

    private void validateStatusTransition(TicketStatus current, TicketStatus target) {
        if (target == TicketStatus.REJECTED) {
            throw new IllegalArgumentException("Use reject endpoint with a reason to reject tickets");
        }

        boolean validTransition =
                (current == TicketStatus.OPEN && target == TicketStatus.IN_PROGRESS) ||
                (current == TicketStatus.IN_PROGRESS && target == TicketStatus.RESOLVED) ||
                (current == TicketStatus.RESOLVED && target == TicketStatus.CLOSED);

        if (!validTransition) {
            throw new IllegalArgumentException("Invalid status transition from " + current + " to " + target);
        }
    }

    private void appendResolutionNote(Ticket ticket, String note) {
        if (!StringUtils.hasText(note)) {
            return;
        }

        String trimmed = note.trim();
        if (!StringUtils.hasText(ticket.getResolutionNotes())) {
            ticket.setResolutionNotes("- " + trimmed);
            return;
        }

        ticket.setResolutionNotes(ticket.getResolutionNotes() + System.lineSeparator() + "- " + trimmed);
    }

    private String storeEvidenceImages(List<MultipartFile> images) {
        if (images == null || images.isEmpty()) {
            return null;
        }

        if (images.size() > 3) {
            throw new IllegalArgumentException("You can upload up to 3 images only");
        }

        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);

            List<String> uploadedPaths = images.stream()
                    .filter(file -> file != null && !file.isEmpty())
                    .map(file -> saveSingleImage(file, uploadPath))
                    .toList();

            if (uploadedPaths.size() > 3) {
                throw new IllegalArgumentException("You can upload up to 3 images only");
            }

            return uploadedPaths.isEmpty() ? null : String.join(",", uploadedPaths);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to store uploaded image evidence", e);
        }
    }

    private String saveSingleImage(MultipartFile file, Path uploadPath) {
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed");
        }

        String originalName = file.getOriginalFilename();
        String extension = ".jpg";
        if (StringUtils.hasText(originalName) && originalName.contains(".")) {
            extension = originalName.substring(originalName.lastIndexOf('.'));
        }

        String fileName = UUID.randomUUID() + extension;
        Path targetPath = uploadPath.resolve(fileName).normalize();
        try {
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to save image evidence", e);
        }

        String baseDirName = Paths.get(uploadDir).getFileName().toString();
        return "/uploads/" + baseDirName + "/" + fileName;
    }
}
