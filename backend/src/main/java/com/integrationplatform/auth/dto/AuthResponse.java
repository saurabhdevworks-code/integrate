package com.integrationplatform.auth.dto;

import com.integrationplatform.organization.dto.OrganizationResponse;
import java.util.UUID;

public record AuthResponse(
    String token,
    UUID userId,
    String email,
    OrganizationResponse defaultOrganization
) {}
