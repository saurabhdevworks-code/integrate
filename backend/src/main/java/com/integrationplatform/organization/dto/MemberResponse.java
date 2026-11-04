package com.integrationplatform.organization.dto;

import com.integrationplatform.organization.model.MemberRole;
import java.time.Instant;
import java.util.UUID;

public record MemberResponse(
    UUID id,
    UUID userId,
    String email,
    MemberRole role,
    Instant createdAt
) {}
