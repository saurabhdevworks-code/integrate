package com.integrationplatform.auth.dto;

import com.integrationplatform.auth.model.UserStatus;
import java.time.Instant;
import java.util.UUID;

public record UserProfileResponse(
    UUID id,
    String email,
    UserStatus status,
    Instant createdAt
) {}
