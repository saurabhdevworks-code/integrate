package com.integrationplatform.mcp.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.integrationplatform.execution.dto.ExecuteToolRequest;
import com.integrationplatform.execution.dto.ExecutionResponse;
import com.integrationplatform.execution.dto.ToolDefinitionResponse;
import com.integrationplatform.execution.service.ExecutionEngineService;
import com.integrationplatform.execution.service.ToolRegistryService;
import com.integrationplatform.mcp.dto.McpRequest;
import com.integrationplatform.mcp.dto.McpResponse;
import com.integrationplatform.mcp.dto.McpTool;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class McpServerService {

    private static final Logger log = LoggerFactory.getLogger(McpServerService.class);

    private final ToolRegistryService toolRegistryService;
    private final ExecutionEngineService executionEngineService;
    private final ObjectMapper objectMapper;

    public McpServerService(
        ToolRegistryService toolRegistryService,
        ExecutionEngineService executionEngineService,
        ObjectMapper objectMapper
    ) {
        this.toolRegistryService = toolRegistryService;
        this.executionEngineService = executionEngineService;
        this.objectMapper = objectMapper;
    }

    /**
     * Processes an incoming JSON-RPC 2.0 MCP request for the given project.
     */
    public McpResponse handleMcpRequest(UUID projectId, String defaultUserId, McpRequest request) {
        if (request == null || request.method() == null) {
            return McpResponse.error(request != null ? request.id() : null, -32600, "Invalid Request");
        }

        Object id = request.id();
        String method = request.method();
        JsonNode params = request.params();

        try {
            return switch (method) {
                case "initialize" -> handleInitialize(id);
                case "notifications/initialized" -> McpResponse.success(id, Map.of());
                case "tools/list" -> handleToolsList(projectId, id);
                case "tools/call" -> handleToolsCall(projectId, defaultUserId, id, params);
                case "ping" -> McpResponse.success(id, Map.of("status", "pong"));
                default -> McpResponse.error(id, -32601, "Method not found: " + method);
            };
        } catch (Exception ex) {
            log.error("Error processing MCP method {}", method, ex);
            return McpResponse.error(id, -32603, "Internal server error: " + ex.getMessage());
        }
    }

    private McpResponse handleInitialize(Object id) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("protocolVersion", "2024-11-05");
        result.put("capabilities", Map.of(
            "tools", Map.of("listChanged", false)
        ));
        result.put("serverInfo", Map.of(
            "name", "integration-platform-mcp",
            "version", "1.0.0"
        ));
        return McpResponse.success(id, result);
    }

    private McpResponse handleToolsList(UUID projectId, Object id) {
        List<ToolDefinitionResponse> toolDefs = toolRegistryService.listToolsForProject(projectId, null);
        List<McpTool> mcpTools = new ArrayList<>();

        for (ToolDefinitionResponse def : toolDefs) {
            JsonNode schemaNode = def.inputSchema();
            if (schemaNode == null || schemaNode.isNull()) {
                schemaNode = objectMapper.createObjectNode().put("type", "object");
            }
            mcpTools.add(new McpTool(def.slug(), def.description(), schemaNode));
        }

        return McpResponse.success(id, Map.of("tools", mcpTools));
    }

    private McpResponse handleToolsCall(UUID projectId, String defaultUserId, Object id, JsonNode params) {
        if (params == null || !params.has("name")) {
            return McpResponse.error(id, -32602, "Invalid params: 'name' is required");
        }

        String toolSlug = params.get("name").asText();
        JsonNode arguments = params.has("arguments") ? params.get("arguments") : objectMapper.createObjectNode();

        // Resolve end-user identity: from arguments -> params -> request header fallback
        String projectUserId = defaultUserId;
        if (arguments.has("projectUserId")) {
            projectUserId = arguments.get("projectUserId").asText();
        } else if (params.has("projectUserId")) {
            projectUserId = params.get("projectUserId").asText();
        }

        if (projectUserId == null || projectUserId.isBlank()) {
            return McpResponse.error(id, -32602, "Missing projectUserId context. Pass 'projectUserId' in tool arguments or request headers.");
        }

        UUID connectedAccountId = (arguments.has("connectedAccountId") && !arguments.get("connectedAccountId").isNull() && !arguments.get("connectedAccountId").asText().isBlank())
            ? UUID.fromString(arguments.get("connectedAccountId").asText())
            : null;

        String idempotencyKey = arguments.has("idempotencyKey")
            ? arguments.get("idempotencyKey").asText()
            : UUID.randomUUID().toString();

        ExecuteToolRequest execReq = new ExecuteToolRequest(
            projectUserId,
            connectedAccountId,
            toolSlug,
            arguments,
            idempotencyKey
        );

        ExecutionResponse response = executionEngineService.execute(projectId, null, execReq);

        boolean isError = "FAILED".equals(response.status().name()) || "REJECTED".equals(response.status().name());
        String contentText;

        if (response.output() != null) {
            contentText = response.output().toString();
        } else if (response.errorMessage() != null) {
            contentText = response.errorMessage();
        } else if (response.requiresApproval()) {
            contentText = "Action paused: High-risk tool requires manual authorization in dashboard approvals queue. Approval ID: " + response.approvalId();
        } else {
            contentText = "Status: " + response.status();
        }

        Map<String, Object> contentItem = Map.of(
            "type", "text",
            "text", contentText
        );

        Map<String, Object> result = Map.of(
            "content", List.of(contentItem),
            "isError", isError
        );

        return McpResponse.success(id, result);
    }
}
