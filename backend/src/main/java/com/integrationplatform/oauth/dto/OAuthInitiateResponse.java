package com.integrationplatform.oauth.dto;

import java.time.Instant;

public record OAuthInitiateResponse(
    String authorizationUrl,
    String stateToken,
    Instant expiresAt
) {}
