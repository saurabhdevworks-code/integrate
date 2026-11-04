package com.integrationplatform.mcp.controller;

import com.integrationplatform.common.exception.UnauthorizedException;
import com.integrationplatform.common.security.ApiKeyPrincipal;
import com.integrationplatform.common.security.SecurityContextHelper;
import com.integrationplatform.mcp.dto.McpRequest;
import com.integrationplatform.mcp.dto.McpResponse;
import com.integrationplatform.mcp.service.McpServerService;
import com.integrationplatform.organization.dto.OrganizationResponse;
import com.integrationplatform.organization.service.OrganizationService;
import com.integrationplatform.project.dto.ProjectResponse;
import com.integrationplatform.project.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@Tag(name = "Model Context Protocol (MCP)", description = "JSON-RPC 2.0 MCP server for AI clients (Claude Desktop, Cursor, OpenAI)")
public class McpController {

    private final McpServerService mcpServerService;
    private final SecurityContextHelper securityContextHelper;
    private final OrganizationService organizationService;
    private final ProjectService projectService;

    public McpController(
        McpServerService mcpServerService,
        SecurityContextHelper securityContextHelper,
        OrganizationService organizationService,
        ProjectService projectService
    ) {
        this.mcpServerService = mcpServerService;
        this.securityContextHelper = securityContextHelper;
        this.organizationService = organizationService;
        this.projectService = projectService;
    }

    @PostMapping("/v1/mcp")
    @Operation(summary = "Model Context Protocol JSON-RPC 2.0 endpoint (Authenticated via Project API Key)")
    public ResponseEntity<McpResponse> handleMcpRequest(
        @RequestBody McpRequest request,
        @RequestHeader(value = "X-Project-User-Id", required = false) String headerUserId,
        @RequestHeader(value = "X-End-User-Id", required = false) String fallbackUserId
    ) {
        UUID projectId = resolveAuthenticatedProjectId();
        String effectiveUserId = headerUserId != null ? headerUserId : fallbackUserId;
        return ResponseEntity.ok(mcpServerService.handleMcpRequest(projectId, effectiveUserId, request));
    }

    @PostMapping("/api/projects/{projectId}/mcp")
    @Operation(summary = "Project-scoped MCP JSON-RPC 2.0 endpoint for dashboard tester")
    public ResponseEntity<McpResponse> handleProjectMcpRequest(
        @PathVariable UUID projectId,
        @RequestBody McpRequest request,
        @RequestParam(required = false) String projectUserId
    ) {
        projectService.validateProjectAccess(projectId);
        return ResponseEntity.ok(mcpServerService.handleMcpRequest(projectId, projectUserId, request));
    }

    private UUID resolveAuthenticatedProjectId() {
        ApiKeyPrincipal apiKey = securityContextHelper.getCurrentApiKey();
        if (apiKey != null) {
            return apiKey.getProjectId();
        }

        try {
            UUID userId = securityContextHelper.getCurrentUserId();
            List<OrganizationResponse> orgs = organizationService.listUserOrganizations(userId);
            if (!orgs.isEmpty()) {
                List<ProjectResponse> projs = projectService.listProjects(orgs.get(0).id(), userId);
                if (!projs.isEmpty()) {
                    return projs.get(0).id();
                }
            }
        } catch (Exception ignored) {}

        throw new UnauthorizedException("API Key or authenticated session required to access MCP endpoint");
    }
}
