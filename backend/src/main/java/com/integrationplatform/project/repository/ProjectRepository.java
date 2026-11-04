package com.integrationplatform.project.repository;

import com.integrationplatform.project.model.Project;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProjectRepository extends JpaRepository<Project, UUID> {

    @EntityGraph(attributePaths = {"environments"})
    List<Project> findByOrganizationId(UUID organizationId);

    @EntityGraph(attributePaths = {"environments"})
    Optional<Project> findByIdAndOrganizationId(UUID id, UUID organizationId);

    boolean existsByOrganizationIdAndSlug(UUID organizationId, String slug);
}
