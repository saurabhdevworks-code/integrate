package com.integrationplatform.execution.dto;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record ExecuteToolRequest(
    @NotBlank(message = "projectUserId is required")
    String projectUserId,

    UUID connectedAccountId,

    @NotBlank(message = "tool slug is required")
    String tool,

    @NotNull(message = "input payload is required")
    JsonNode input,

    String idempotencyKey
) {}
