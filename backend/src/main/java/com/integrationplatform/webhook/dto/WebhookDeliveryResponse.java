package com.integrationplatform.webhook.dto;

import com.integrationplatform.webhook.model.WebhookDeliveryStatus;
import java.time.Instant;
import java.util.UUID;

public record WebhookDeliveryResponse(
    UUID id,
    UUID webhookId,
    UUID projectId,
    String eventType,
    String payload,
    WebhookDeliveryStatus status,
    Integer httpStatusCode,
    String responseBody,
    int attemptCount,
    Instant nextRetryAt,
    Instant createdAt,
    Instant deliveredAt
) {}
