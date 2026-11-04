package com.integrationplatform.execution.repository;

import com.integrationplatform.execution.model.Execution;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ExecutionRepository extends JpaRepository<Execution, UUID> {

    @EntityGraph(attributePaths = {"connectedAccount", "project"})
    Optional<Execution> findByIdAndProjectId(UUID id, UUID projectId);

    @EntityGraph(attributePaths = {"connectedAccount", "project"})
    List<Execution> findByProjectIdOrderByCreatedAtDesc(UUID projectId);

    Page<Execution> findByProjectIdOrderByCreatedAtDesc(UUID projectId, Pageable pageable);

    Optional<Execution> findByProjectIdAndIdempotencyKey(UUID projectId, String idempotencyKey);
}
