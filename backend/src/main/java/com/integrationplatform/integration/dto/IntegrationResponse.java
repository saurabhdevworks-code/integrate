package com.integrationplatform.integration.dto;

import java.util.UUID;

public record IntegrationResponse(
    UUID id,
    String slug,
    String name,
    String category,
    String authType,
    String defaultScopes,
    String iconUrl,
    String documentationUrl,
    boolean enabled,
    boolean configured
) {}
