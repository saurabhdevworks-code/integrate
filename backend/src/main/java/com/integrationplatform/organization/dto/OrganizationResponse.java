package com.integrationplatform.organization.dto;

import com.integrationplatform.organization.model.MemberRole;
import java.time.Instant;
import java.util.UUID;

public record OrganizationResponse(
    UUID id,
    String name,
    String slug,
    MemberRole currentUserRole,
    Instant createdAt
) {}
