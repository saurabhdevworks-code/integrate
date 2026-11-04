package com.integrationplatform.execution.repository;

import com.integrationplatform.execution.model.Approval;
import com.integrationplatform.execution.model.ApprovalStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ApprovalRepository extends JpaRepository<Approval, UUID> {

    @EntityGraph(attributePaths = {"execution", "project", "decidedByUser"})
    List<Approval> findByProjectIdAndStatusOrderByCreatedAtDesc(UUID projectId, ApprovalStatus status);

    @EntityGraph(attributePaths = {"execution", "project", "decidedByUser"})
    Optional<Approval> findByIdAndProjectId(UUID id, UUID projectId);

    Optional<Approval> findByExecutionId(UUID executionId);
}
