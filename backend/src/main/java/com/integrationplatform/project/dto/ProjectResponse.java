package com.integrationplatform.project.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ProjectResponse(
    UUID id,
    UUID organizationId,
    String name,
    String slug,
    List<String> environments,
    Instant createdAt
) {}
