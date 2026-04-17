package com.sliit.nexus.dto.request;

import com.sliit.nexus.enums.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Data
public class TicketCreateRequest {
    private String title;

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Priority is required")
    private TicketPriority priority;

    @NotBlank(message = "Contact details are required")
    private String contactDetails;

    @NotBlank(message = "Location/resource is required")
    private String locationOrResource;

    private List<MultipartFile> images;
}
