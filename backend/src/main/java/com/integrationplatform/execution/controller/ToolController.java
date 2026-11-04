package com.integrationplatform.execution.controller;

import com.integrationplatform.common.security.SecurityContextHelper;
import com.integrationplatform.execution.dto.ToolDefinitionResponse;
import com.integrationplatform.execution.service.ToolRegistryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@Tag(name = "Tool Registry", description = "Discovery of integration tools, actions, and JSON schemas")
public class ToolController {

    private final ToolRegistryService toolRegistryService;
    private final SecurityContextHelper securityContextHelper;

    public ToolController(ToolRegistryService toolRegistryService, SecurityContextHelper securityContextHelper) {
        this.toolRegistryService = toolRegistryService;
        this.securityContextHelper = securityContextHelper;
    }

    @GetMapping("/projects/{projectId}/tools")
    @Operation(summary = "List all tools supported by enabled project integrations")
    public ResponseEntity<List<ToolDefinitionResponse>> listTools(@PathVariable UUID projectId) {
        UUID userId = null;
        try {
            userId = securityContextHelper.getCurrentUserId();
        } catch (Exception ignored) {}

        return ResponseEntity.ok(toolRegistryService.listToolsForProject(projectId, userId));
    }

    @GetMapping("/tools/{slug}")
    @Operation(summary = "Get specific tool definition and input schema")
    public ResponseEntity<ToolDefinitionResponse> getTool(@PathVariable String slug) {
        return ResponseEntity.ok(toolRegistryService.getToolBySlug(slug));
    }
}
