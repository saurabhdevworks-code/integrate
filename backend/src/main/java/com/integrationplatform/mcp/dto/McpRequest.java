package com.integrationplatform.mcp.dto;

import com.fasterxml.jackson.databind.JsonNode;

public record McpRequest(
    String jsonrpc,
    Object id,
    String method,
    JsonNode params
) {}
