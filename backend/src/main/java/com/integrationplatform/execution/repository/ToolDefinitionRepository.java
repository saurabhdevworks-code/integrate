package com.integrationplatform.execution.repository;

import com.integrationplatform.execution.model.ToolDefinition;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ToolDefinitionRepository extends JpaRepository<ToolDefinition, UUID> {

    @EntityGraph(attributePaths = {"integration"})
    Optional<ToolDefinition> findBySlug(String slug);

    @EntityGraph(attributePaths = {"integration"})
    List<ToolDefinition> findByIntegrationId(UUID integrationId);

    @EntityGraph(attributePaths = {"integration"})
    List<ToolDefinition> findByIntegrationSlug(String slug);
}
