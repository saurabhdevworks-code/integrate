package com.integrationplatform.oauth.repository;

import com.integrationplatform.oauth.model.ConnectedAccount;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConnectedAccountRepository extends JpaRepository<ConnectedAccount, UUID> {

    @EntityGraph(attributePaths = {"integration", "project"})
    List<ConnectedAccount> findByProjectIdOrderByCreatedAtDesc(UUID projectId);

    @EntityGraph(attributePaths = {"integration", "project"})
    Optional<ConnectedAccount> findByIdAndProjectId(UUID id, UUID projectId);

    @EntityGraph(attributePaths = {"integration", "project", "credential"})
    Optional<ConnectedAccount> findByProjectIdAndIntegrationIdAndProjectUserId(UUID projectId, UUID integrationId, String projectUserId);

    @EntityGraph(attributePaths = {"integration", "project", "credential"})
    Optional<ConnectedAccount> findByProjectIdAndIntegrationSlugAndProjectUserId(UUID projectId, String slug, String projectUserId);
}
