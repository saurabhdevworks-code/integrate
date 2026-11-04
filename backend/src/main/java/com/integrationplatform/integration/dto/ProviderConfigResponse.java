package com.integrationplatform.integration.dto;

import java.util.UUID;

public record ProviderConfigResponse(
    UUID id,
    UUID projectId,
    String integrationSlug,
    String clientId,
    String redirectUri,
    String scopes,
    boolean configured
) {}
