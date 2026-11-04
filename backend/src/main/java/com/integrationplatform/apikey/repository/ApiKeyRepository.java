package com.integrationplatform.apikey.repository;

import com.integrationplatform.apikey.model.ApiKey;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ApiKeyRepository extends JpaRepository<ApiKey, UUID> {

    List<ApiKey> findByProjectIdOrderByCreatedAtDesc(UUID projectId);

    Optional<ApiKey> findByIdAndProjectId(UUID id, UUID projectId);

    @EntityGraph(attributePaths = {"project", "project.organization"})
    List<ApiKey> findByKeyPrefixAndRevokedAtIsNull(String keyPrefix);
}
