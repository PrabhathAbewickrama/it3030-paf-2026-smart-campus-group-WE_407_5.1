package com.sliit.nexus.dto.request;

import com.sliit.nexus.enums.AssetStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AssetStatusRequest {
    @NotNull(message = "Asset status is required")
    private AssetStatus status;
}
