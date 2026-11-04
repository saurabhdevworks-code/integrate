package com.integrationplatform.connector;

import com.integrationplatform.oauth.model.ConnectedAccount;

import java.util.UUID;

public record ToolExecutionContext(
    UUID executionId,
    UUID projectId,
    String projectUserId,
    ConnectedAccount connectedAccount,
    String decryptedAccessToken,
    String idempotencyKey
) {}
