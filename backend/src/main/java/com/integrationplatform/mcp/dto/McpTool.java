package com.integrationplatform.mcp.dto;

import com.fasterxml.jackson.databind.JsonNode;

public record McpTool(
    String name,
    String description,
    JsonNode inputSchema
) {}
