package com.sliit.nexus.dto.response;

import com.sliit.nexus.entity.Asset;
import com.sliit.nexus.enums.AssetStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AssetResponse {
    private Long id;
    private String name;
    private String type;
    private String location;
    private String description;
    private AssetStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static AssetResponse fromEntity(Asset asset) {
        return AssetResponse.builder()
                .id(asset.getId())
                .name(asset.getName())
                .type(asset.getType())
                .location(asset.getLocation())
                .description(asset.getDescription())
                .status(asset.getStatus())
                .createdAt(asset.getCreatedAt())
                .updatedAt(asset.getUpdatedAt())
                .build();
    }
}
