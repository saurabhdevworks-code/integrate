package com.integrationplatform.integration.repository;

import com.integrationplatform.integration.model.ProjectIntegration;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProjectIntegrationRepository extends JpaRepository<ProjectIntegration, UUID> {

    @EntityGraph(attributePaths = {"integration"})
    List<ProjectIntegration> findByProjectId(UUID projectId);

    Optional<ProjectIntegration> findByProjectIdAndIntegrationId(UUID projectId, UUID integrationId);

    Optional<ProjectIntegration> findByProjectIdAndIntegrationSlug(UUID projectId, String slug);
}
