package com.integrationplatform.execution.dto;

import com.fasterxml.jackson.databind.JsonNode;
import com.integrationplatform.execution.model.RiskLevel;
import java.util.UUID;

public record ToolDefinitionResponse(
    UUID id,
    String integrationSlug,
    String integrationName,
    String slug,
    String name,
    String description,
    JsonNode inputSchema,
    String requiredScopes,
    RiskLevel riskLevel,
    boolean requiresApproval,
    String version
) {}
