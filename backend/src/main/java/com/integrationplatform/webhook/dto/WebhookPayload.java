package com.integrationplatform.webhook.dto;

import java.time.Instant;
import java.util.UUID;

public record WebhookPayload(
    UUID id,
    String event,
    Instant timestamp,
    Object data
) {}
