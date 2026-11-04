package com.integrationplatform.project.repository;

import com.integrationplatform.project.model.ProjectEnvironment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProjectEnvironmentRepository extends JpaRepository<ProjectEnvironment, UUID> {
    List<ProjectEnvironment> findByProjectId(UUID projectId);
    Optional<ProjectEnvironment> findByProjectIdAndName(UUID projectId, String name);
}
