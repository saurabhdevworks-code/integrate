package com.integrationplatform.integration.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ConfigureProviderRequest(
    @NotBlank(message = "Client ID is required")
    @Size(max = 255, message = "Client ID must not exceed 255 characters")
    String clientId,

    @NotBlank(message = "Client Secret is required")
    String clientSecret,

    @NotBlank(message = "Redirect URI is required")
    String redirectUri,

    String scopes
) {}
