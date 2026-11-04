package com.integrationplatform.mcp.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record McpResponse(
    String jsonrpc,
    Object id,
    Object result,
    McpError error
) {
    public static McpResponse success(Object id, Object result) {
        return new McpResponse("2.0", id, result, null);
    }

    public static McpResponse error(Object id, int code, String message) {
        return new McpResponse("2.0", id, null, new McpError(code, message));
    }

    public record McpError(int code, String message) {}
}
