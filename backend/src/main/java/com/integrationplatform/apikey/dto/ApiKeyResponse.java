package com.integrationplatform.apikey.dto;

import java.time.Instant;
import java.util.UUID;

public record ApiKeyResponse(
    UUID id,
    UUID projectId,
    String name,
    String keyPrefix,
    String environment,
    Instant expiresAt,
    Instant revokedAt,
    boolean active,
    Instant createdAt
) {}
