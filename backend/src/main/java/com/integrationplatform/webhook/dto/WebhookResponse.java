package com.integrationplatform.webhook.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record WebhookResponse(
    UUID id,
    UUID projectId,
    String url,
    String secret,
    List<String> events,
    boolean isActive,
    Instant createdAt,
    Instant updatedAt
) {}
