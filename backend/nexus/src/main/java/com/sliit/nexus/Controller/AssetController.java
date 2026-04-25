package com.sliit.nexus.controller;

import com.sliit.nexus.dto.request.AssetRequest;
import com.sliit.nexus.dto.request.AssetStatusRequest;
import com.sliit.nexus.dto.response.AssetResponse;
import com.sliit.nexus.service.AssetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assets")
@RequiredArgsConstructor
public class AssetController {
    private final AssetService assetService;

    @GetMapping
    public List<AssetResponse> getAssets() {
        return assetService.getAllAssets().stream()
                .map(AssetResponse::fromEntity)
                .toList();
    }

    @GetMapping("/{id}")
    public AssetResponse getAsset(@PathVariable Long id) {
        return AssetResponse.fromEntity(assetService.getAsset(id));
    }

    @PostMapping
    public AssetResponse createAsset(
            @RequestHeader(value = "X-User-Role", required = false) String role,
            @Valid @RequestBody AssetRequest request
    ) {
        requireAdmin(role);
        return AssetResponse.fromEntity(assetService.createAsset(request));
    }

    @PutMapping("/{id}")
    public AssetResponse updateAsset(
            @RequestHeader(value = "X-User-Role", required = false) String role,
            @PathVariable Long id,
            @Valid @RequestBody AssetRequest request
    ) {
        requireAdmin(role);
        return AssetResponse.fromEntity(assetService.updateAsset(id, request));
    }

    @PatchMapping("/{id}/status")
    public AssetResponse updateStatus(
            @RequestHeader(value = "X-User-Role", required = false) String role,
            @PathVariable Long id,
            @Valid @RequestBody AssetStatusRequest request
    ) {
        requireAdmin(role);
        return AssetResponse.fromEntity(assetService.updateStatus(id, request.getStatus()));
    }

    @DeleteMapping("/{id}")
    public void deleteAsset(
            @RequestHeader(value = "X-User-Role", required = false) String role,
            @PathVariable Long id
    ) {
        requireAdmin(role);
        assetService.deleteAsset(id);
    }

    private void requireAdmin(String role) {
        if (role == null || !"ADMIN".equals(role.replace("ROLE_", ""))) {
            throw new IllegalArgumentException("Admin role is required for this action");
        }
    }
}
