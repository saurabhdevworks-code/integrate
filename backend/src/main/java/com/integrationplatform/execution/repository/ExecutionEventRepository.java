package com.integrationplatform.execution.repository;

import com.integrationplatform.execution.model.ExecutionEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ExecutionEventRepository extends JpaRepository<ExecutionEvent, UUID> {
    List<ExecutionEvent> findByExecutionIdOrderByCreatedAtAsc(UUID executionId);
}
