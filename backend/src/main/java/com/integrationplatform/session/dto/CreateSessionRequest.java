package com.integrationplatform.session.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateSessionRequest(
    @NotBlank(message = "integrationSlug is required (e.g. gmail, github)")
    String integrationSlug,

    @NotBlank(message = "projectUserId is required")
    @Size(max = 120, message = "projectUserId must not exceed 120 characters")
    String projectUserId,

    String returnUrl
) {}
