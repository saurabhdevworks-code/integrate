package com.integrationplatform.oauth.dto;

import com.integrationplatform.oauth.model.ConnectedAccountStatus;
import java.time.Instant;
import java.util.UUID;

public record ConnectedAccountResponse(
    UUID id,
    UUID projectId,
    String integrationSlug,
    String integrationName,
    String projectUserId,
    String providerAccountId,
    String accountEmail,
    String accountName,
    ConnectedAccountStatus status,
    String grantedScopes,
    Instant tokenExpiresAt,
    Instant createdAt
) {}
