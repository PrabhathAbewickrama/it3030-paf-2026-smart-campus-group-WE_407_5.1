package com.sliit.nexus.repository;

import com.sliit.nexus.entity.Asset;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssetRepository extends JpaRepository<Asset, Long> {
    List<Asset> findAllByOrderByCreatedAtDesc();
}
