package com.integrationplatform.apikey.dto;

import java.time.Instant;
import java.util.UUID;

public record ApiKeyCreatedResponse(
    UUID id,
    UUID projectId,
    String name,
    String keyPrefix,
    String rawKey, // Displayed ONLY ONCE at creation
    String environment,
    Instant expiresAt,
    Instant createdAt
) {}
