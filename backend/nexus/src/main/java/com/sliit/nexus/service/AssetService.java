package com.sliit.nexus.service;

import com.sliit.nexus.dto.request.AssetRequest;
import com.sliit.nexus.entity.Asset;
import com.sliit.nexus.enums.AssetStatus;
import com.sliit.nexus.repository.AssetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AssetService {
    private final AssetRepository assetRepository;

    public List<Asset> getAllAssets() {
        return assetRepository.findAllByOrderByCreatedAtDesc();
    }

    public Asset getAsset(Long id) {
        return assetRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Asset not found"));
    }

    public Asset createAsset(AssetRequest request) {
        Asset asset = Asset.builder()
                .name(request.getName().trim())
                .type(request.getType().trim())
                .location(request.getLocation().trim())
                .description(cleanDescription(request.getDescription()))
                .status(request.getStatus() == null ? AssetStatus.AVAILABLE : request.getStatus())
                .build();

        return assetRepository.save(asset);
    }

    public Asset updateAsset(Long id, AssetRequest request) {
        Asset asset = getAsset(id);
        asset.setName(request.getName().trim());
        asset.setType(request.getType().trim());
        asset.setLocation(request.getLocation().trim());
        asset.setDescription(cleanDescription(request.getDescription()));
        asset.setStatus(request.getStatus() == null ? AssetStatus.AVAILABLE : request.getStatus());
        return assetRepository.save(asset);
    }

    public Asset updateStatus(Long id, AssetStatus status) {
        Asset asset = getAsset(id);
        asset.setStatus(status);
        return assetRepository.save(asset);
    }

    public void deleteAsset(Long id) {
        Asset asset = getAsset(id);
        assetRepository.delete(asset);
    }

    private String cleanDescription(String description) {
        if (description == null || description.trim().isEmpty()) {
            return null;
        }

        return description.trim();
    }
}
