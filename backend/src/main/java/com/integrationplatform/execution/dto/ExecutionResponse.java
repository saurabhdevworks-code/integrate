package com.integrationplatform.execution.dto;

import com.fasterxml.jackson.databind.JsonNode;
import com.integrationplatform.execution.model.ExecutionStatus;
import java.time.Instant;
import java.util.UUID;

public record ExecutionResponse(
    UUID id,
    UUID projectId,
    String toolSlug,
    String projectUserId,
    ExecutionStatus status,
    JsonNode output,
    String errorMessage,
    Long durationMs,
    Instant startedAt,
    Instant completedAt,
    boolean requiresApproval,
    UUID approvalId
) {}
