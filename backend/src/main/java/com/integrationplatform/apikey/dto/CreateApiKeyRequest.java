package com.integrationplatform.apikey.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.Instant;

public record CreateApiKeyRequest(
    @NotBlank(message = "API key name is required")
    @Size(max = 120, message = "API key name must not exceed 120 characters")
    String name,

    @NotBlank(message = "Environment is required")
    @Pattern(regexp = "^(TEST|LIVE)$", message = "Environment must be TEST or LIVE")
    String environment,

    Instant expiresAt
) {}
