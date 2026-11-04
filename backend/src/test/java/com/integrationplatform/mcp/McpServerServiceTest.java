package com.integrationplatform.mcp;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.integrationplatform.execution.dto.ExecuteToolRequest;
import com.integrationplatform.execution.dto.ExecutionResponse;
import com.integrationplatform.execution.dto.ToolDefinitionResponse;
import com.integrationplatform.execution.model.ExecutionStatus;
import com.integrationplatform.execution.model.RiskLevel;
import com.integrationplatform.execution.service.ExecutionEngineService;
import com.integrationplatform.execution.service.ToolRegistryService;
import com.integrationplatform.mcp.dto.McpRequest;
import com.integrationplatform.mcp.dto.McpResponse;
import com.integrationplatform.mcp.service.McpServerService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class McpServerServiceTest {

    @Mock
    private ToolRegistryService toolRegistryService;

    @Mock
    private ExecutionEngineService executionEngineService;

    private McpServerService mcpServerService;
    private ObjectMapper objectMapper;
    private UUID projectId;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        mcpServerService = new McpServerService(toolRegistryService, executionEngineService, objectMapper);
        projectId = UUID.randomUUID();
    }

    @Test
    void testInitialize_ReturnsCapabilitiesAndProtocol() {
        McpRequest req = new McpRequest("2.0", 1, "initialize", null);
        McpResponse response = mcpServerService.handleMcpRequest(projectId, null, req);

        assertNotNull(response);
        assertEquals("2.0", response.jsonrpc());
        assertEquals(1, response.id());
        assertNull(response.error());

        Map<?, ?> result = (Map<?, ?>) response.result();
        assertEquals("2024-11-05", result.get("protocolVersion"));
        assertTrue(result.containsKey("serverInfo"));
    }

    @Test
    void testToolsList_ReturnsMcpFormattedTools() {
        ObjectNode schema = objectMapper.createObjectNode();
        schema.put("type", "object");

        ToolDefinitionResponse tool = new ToolDefinitionResponse(
            UUID.randomUUID(), "gmail", "Gmail", "gmail.search_emails", "Search Emails",
            "Search user messages", schema, "https://mail.google.com/", RiskLevel.LOW, false, "1.0.0"
        );

        when(toolRegistryService.listToolsForProject(projectId, null)).thenReturn(List.of(tool));

        McpRequest req = new McpRequest("2.0", "req-2", "tools/list", null);
        McpResponse response = mcpServerService.handleMcpRequest(projectId, null, req);

        assertNotNull(response);
        assertNull(response.error());

        Map<?, ?> result = (Map<?, ?>) response.result();
        List<?> tools = (List<?>) result.get("tools");
        assertEquals(1, tools.size());
    }

    @Test
    void testToolsCall_ExecutesToolAndReturnsContent() {
        ObjectNode params = objectMapper.createObjectNode();
        params.put("name", "gmail.search_emails");

        ObjectNode args = objectMapper.createObjectNode();
        args.put("query", "is:unread");
        args.put("projectUserId", "user_abc");
        params.set("arguments", args);

        ObjectNode outputJson = objectMapper.createObjectNode();
        outputJson.put("count", 3);

        ExecutionResponse execRes = new ExecutionResponse(
            UUID.randomUUID(), projectId, "gmail.search_emails", "user_abc",
            ExecutionStatus.SUCCEEDED, outputJson, null, 150L,
            Instant.now(), Instant.now(), false, null
        );

        when(executionEngineService.execute(eq(projectId), eq(null), any(ExecuteToolRequest.class)))
            .thenReturn(execRes);

        McpRequest req = new McpRequest("2.0", 42, "tools/call", params);
        McpResponse response = mcpServerService.handleMcpRequest(projectId, null, req);

        assertNotNull(response);
        assertNull(response.error());

        Map<?, ?> result = (Map<?, ?>) response.result();
        assertFalse((Boolean) result.get("isError"));
        List<?> content = (List<?>) result.get("content");
        assertEquals(1, content.size());
    }

    @Test
    void testToolsCall_RejectsMissingName() {
        ObjectNode params = objectMapper.createObjectNode();
        McpRequest req = new McpRequest("2.0", 99, "tools/call", params);

        McpResponse response = mcpServerService.handleMcpRequest(projectId, "user_1", req);

        assertNotNull(response);
        assertNotNull(response.error());
        assertEquals(-32602, response.error().code());
    }
}
