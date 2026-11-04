package com.integrationplatform.organization.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateOrganizationRequest(
    @NotBlank(message = "Organization name is required")
    @Size(min = 1, max = 160, message = "Organization name must be between 1 and 160 characters")
    String name
) {}
