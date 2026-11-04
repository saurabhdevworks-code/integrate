package com.integrationplatform.oauth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record InitiateOAuthRequest(
    @NotBlank(message = "Integration slug is required (e.g. gmail, github)")
    String integrationSlug,

    @NotBlank(message = "Project user ID is required (identifier of your end user)")
    @Size(max = 120, message = "Project user ID must not exceed 120 characters")
    String projectUserId,

    String redirectUri
) {}
