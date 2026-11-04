package com.integrationplatform.execution.controller;

import com.integrationplatform.common.exception.ForbiddenException;
import com.integrationplatform.common.security.ApiKeyPrincipal;
import com.integrationplatform.common.security.SecurityContextHelper;
import com.integrationplatform.execution.dto.ApprovalDecisionRequest;
import com.integrationplatform.execution.dto.ApprovalResponse;
import com.integrationplatform.execution.dto.ExecuteToolRequest;
import com.integrationplatform.execution.dto.ExecutionResponse;
import com.integrationplatform.execution.service.ExecutionEngineService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/projects/{projectId}")
@Tag(name = "Execution Engine", description = "Execute integration actions and inspect logs")
public class ExecutionController {

    private final ExecutionEngineService executionEngineService;
    private final SecurityContextHelper securityContextHelper;

    public ExecutionController(ExecutionEngineService executionEngineService, SecurityContextHelper securityContextHelper) {
        this.executionEngineService = executionEngineService;
        this.securityContextHelper = securityContextHelper;
    }

    @PostMapping("/tools/execute")
    @Operation(summary = "Execute a tool through the central execution engine (supports API key or Console JWT)")
    public ResponseEntity<ExecutionResponse> executeTool(
        @PathVariable UUID projectId,
        @Valid @RequestBody ExecuteToolRequest request
    ) {
        ApiKeyPrincipal apiKey = securityContextHelper.getCurrentApiKey();
        UUID userId = null;

        if (apiKey != null) {
            // API key must belong to requested project
            if (!apiKey.getProjectId().equals(projectId)) {
                throw new ForbiddenException("API key is not authorized for project: " + projectId);
            }
        } else {
            userId = securityContextHelper.getCurrentUserId();
        }

        ExecutionResponse response = executionEngineService.execute(projectId, userId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/executions")
    @Operation(summary = "List execution history and logs for a project")
    public ResponseEntity<List<ExecutionResponse>> listExecutions(@PathVariable UUID projectId) {
        UUID userId = securityContextHelper.getCurrentUserId();
        return ResponseEntity.ok(executionEngineService.listExecutions(projectId, userId));
    }

    @GetMapping("/approvals")
    @Operation(summary = "List pending tool execution approval requests")
    public ResponseEntity<List<ApprovalResponse>> listApprovals(@PathVariable UUID projectId) {
        UUID userId = securityContextHelper.getCurrentUserId();
        return ResponseEntity.ok(executionEngineService.listPendingApprovals(projectId, userId));
    }

    @PostMapping("/approvals/{approvalId}/decide")
    @Operation(summary = "Approve or reject a pending tool execution")
    public ResponseEntity<ApprovalResponse> decideApproval(
        @PathVariable UUID projectId,
        @PathVariable UUID approvalId,
        @Valid @RequestBody ApprovalDecisionRequest request
    ) {
        UUID userId = securityContextHelper.getCurrentUserId();
        return ResponseEntity.ok(executionEngineService.decideApproval(projectId, approvalId, userId, request));
    }
}
