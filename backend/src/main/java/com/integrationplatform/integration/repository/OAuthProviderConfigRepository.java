package com.integrationplatform.integration.repository;

import com.integrationplatform.integration.model.OAuthProviderConfig;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OAuthProviderConfigRepository extends JpaRepository<OAuthProviderConfig, UUID> {

    @EntityGraph(attributePaths = {"integration", "project"})
    Optional<OAuthProviderConfig> findByProjectIdAndIntegrationId(UUID projectId, UUID integrationId);

    @EntityGraph(attributePaths = {"integration", "project"})
    Optional<OAuthProviderConfig> findByProjectIdAndIntegrationSlug(UUID projectId, String slug);
}
