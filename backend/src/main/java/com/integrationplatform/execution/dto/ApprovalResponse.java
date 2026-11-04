package com.integrationplatform.execution.dto;

import com.integrationplatform.execution.model.ApprovalStatus;
import java.time.Instant;
import java.util.UUID;

public record ApprovalResponse(
    UUID id,
    UUID executionId,
    UUID projectId,
    String toolSlug,
    ApprovalStatus status,
    String reason,
    Instant createdAt,
    Instant decidedAt
) {}
