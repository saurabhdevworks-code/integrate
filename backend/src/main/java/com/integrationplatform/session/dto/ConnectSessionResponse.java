package com.integrationplatform.session.dto;

import com.integrationplatform.session.model.ConnectSessionStatus;
import java.time.Instant;
import java.util.UUID;

public record ConnectSessionResponse(
    UUID sessionId,
    String integrationSlug,
    String projectUserId,
    String connectUrl,
    ConnectSessionStatus status,
    String returnUrl,
    UUID connectedAccountId,
    Instant expiresAt,
    Instant createdAt
) {}
