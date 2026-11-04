package com.integrationplatform.connector;

import com.fasterxml.jackson.databind.JsonNode;

public interface IntegrationConnector {
    String getIntegrationSlug();
    boolean supportsTool(String toolName);
    JsonNode execute(String toolName, JsonNode input, ToolExecutionContext context);
}
