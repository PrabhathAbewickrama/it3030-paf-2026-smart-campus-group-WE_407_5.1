package com.sliit.nexus.dto.request;

import com.sliit.nexus.enums.AssetStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AssetRequest {
    @NotBlank(message = "Asset name is required")
    private String name;

    @NotBlank(message = "Asset type is required")
    private String type;

    @NotBlank(message = "Location is required")
    private String location;

    private String description;

    private AssetStatus status = AssetStatus.AVAILABLE;
}
