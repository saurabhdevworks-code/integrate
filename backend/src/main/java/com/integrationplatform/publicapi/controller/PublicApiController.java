package com.integrationplatform.publicapi.controller;

import com.integrationplatform.common.exception.ForbiddenException;
import com.integrationplatform.common.exception.ResourceNotFoundException;
import com.integrationplatform.common.exception.UnauthorizedException;
import com.integrationplatform.common.security.ApiKeyPrincipal;
import com.integrationplatform.common.security.SecurityContextHelper;
import com.integrationplatform.execution.dto.*;
import com.integrationplatform.execution.model.Execution;
import com.integrationplatform.execution.repository.ExecutionRepository;
import com.integrationplatform.execution.service.ExecutionEngineService;
import com.integrationplatform.execution.service.ToolRegistryService;
import com.integrationplatform.integration.dto.IntegrationResponse;
import com.integrationplatform.integration.service.IntegrationRegistryService;
import com.integrationplatform.oauth.dto.ConnectedAccountResponse;
import com.integrationplatform.oauth.model.ConnectedAccount;
import com.integrationplatform.oauth.repository.ConnectedAccountRepository;
import com.integrationplatform.oauth.service.OAuthEngineService;
import com.integrationplatform.organization.dto.OrganizationResponse;
import com.integrationplatform.organization.service.OrganizationService;
import com.integrationplatform.project.dto.ProjectResponse;
import com.integrationplatform.project.service.ProjectService;
import com.integrationplatform.session.dto.ConnectSessionResponse;
import com.integrationplatform.session.dto.CreateSessionRequest;
import com.integrationplatform.session.model.ConnectSession;
import com.integrationplatform.session.service.ConnectSessionService;
import com.integrationplatform.webhook.dto.*;
import com.integrationplatform.webhook.service.WebhookDispatcherService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/v1")
@Tag(name = "Public REST API v1", description = "Unified programmatic developer API (Authenticate with Project API Key)")
public class PublicApiController {

    private final SecurityContextHelper securityContextHelper;
    private final IntegrationRegistryService integrationRegistryService;
    private final ToolRegistryService toolRegistryService;
    private final ExecutionEngineService executionEngineService;
    private final ExecutionRepository executionRepository;
    private final OAuthEngineService oauthEngineService;
    private final ConnectedAccountRepository connectedAccountRepository;
    private final ConnectSessionService connectSessionService;
    private final OrganizationService organizationService;
    private final ProjectService projectService;
    private final WebhookDispatcherService webhookDispatcherService;

    public PublicApiController(
        SecurityContextHelper securityContextHelper,
        IntegrationRegistryService integrationRegistryService,
        ToolRegistryService toolRegistryService,
        ExecutionEngineService executionEngineService,
        ExecutionRepository executionRepository,
        OAuthEngineService oauthEngineService,
        ConnectedAccountRepository connectedAccountRepository,
        ConnectSessionService connectSessionService,
        OrganizationService organizationService,
        ProjectService projectService,
        WebhookDispatcherService webhookDispatcherService
    ) {
        this.securityContextHelper = securityContextHelper;
        this.integrationRegistryService = integrationRegistryService;
        this.toolRegistryService = toolRegistryService;
        this.executionEngineService = executionEngineService;
        this.executionRepository = executionRepository;
        this.oauthEngineService = oauthEngineService;
        this.connectedAccountRepository = connectedAccountRepository;
        this.connectSessionService = connectSessionService;
        this.organizationService = organizationService;
        this.projectService = projectService;
        this.webhookDispatcherService = webhookDispatcherService;
    }

    // --- 1. INTEGRATIONS ---
    @GetMapping("/integrations")
    @Operation(summary = "List all supported integrations and configuration status")
    public ResponseEntity<List<IntegrationResponse>> listIntegrations() {
        UUID projectId = resolveAuthenticatedProjectId();
        return ResponseEntity.ok(integrationRegistryService.listIntegrationsForProject(projectId, null));
    }

    @GetMapping("/integrations/{slug}")
    @Operation(summary = "Get integration details by slug")
    public ResponseEntity<IntegrationResponse> getIntegration(@PathVariable String slug) {
        UUID projectId = resolveAuthenticatedProjectId();
        List<IntegrationResponse> list = integrationRegistryService.listIntegrationsForProject(projectId, null);
        return list.stream()
            .filter(i -> i.slug().equalsIgnoreCase(slug))
            .findFirst()
            .map(ResponseEntity::ok)
            .orElseThrow(() -> new ResourceNotFoundException("Integration not found: " + slug));
    }

    // --- 2. CONNECT SESSIONS ---
    @PostMapping("/connect/sessions")
    @Operation(summary = "Initiate an end-user connection session")
    public ResponseEntity<ConnectSessionResponse> createConnectSession(@Valid @RequestBody CreateSessionRequest request) {
        UUID projectId = resolveAuthenticatedProjectId();
        return ResponseEntity.ok(connectSessionService.createSession(projectId, request));
    }

    @GetMapping("/connect/sessions/{sessionId}")
    @Operation(summary = "Get connection session status")
    public ResponseEntity<ConnectSessionResponse> getConnectSession(@PathVariable UUID sessionId) {
        UUID projectId = resolveAuthenticatedProjectId();
        return ResponseEntity.ok(connectSessionService.getSession(sessionId, projectId));
    }

    @GetMapping("/connect/sessions/{sessionId}/public")
    @Operation(summary = "Public endpoint for end-user hosted connect landing page")
    public ResponseEntity<ConnectSessionResponse> getPublicConnectSession(@PathVariable UUID sessionId) {
        ConnectSession session = connectSessionService.getPublicSession(sessionId);
        return ResponseEntity.ok(new ConnectSessionResponse(
            session.getId(),
            session.getIntegration().getSlug(),
            session.getProjectUserId(),
            session.getAuthUrl(),
            session.getStatus(),
            session.getReturnUrl(),
            session.getConnectedAccount() != null ? session.getConnectedAccount().getId() : null,
            session.getExpiresAt(),
            session.getCreatedAt()
        ));
    }

    // --- 3. CONNECTIONS (Connected Accounts) ---
    @GetMapping("/connections")
    @Operation(summary = "List all external connected accounts for this project")
    public ResponseEntity<List<ConnectedAccountResponse>> listConnections() {
        UUID projectId = resolveAuthenticatedProjectId();
        return ResponseEntity.ok(oauthEngineService.listConnectedAccounts(projectId, null));
    }

    @GetMapping("/connections/{connectionId}")
    @Operation(summary = "Get details of a specific connected account")
    public ResponseEntity<ConnectedAccountResponse> getConnection(@PathVariable UUID connectionId) {
        UUID projectId = resolveAuthenticatedProjectId();
        ConnectedAccount account = connectedAccountRepository.findByIdAndProjectId(connectionId, projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Connected account not found: " + connectionId));

        return ResponseEntity.ok(new ConnectedAccountResponse(
            account.getId(),
            account.getProject().getId(),
            account.getIntegration().getSlug(),
            account.getIntegration().getName(),
            account.getProjectUserId(),
            account.getProviderAccountId(),
            account.getAccountEmail(),
            account.getAccountName(),
            account.getStatus(),
            account.getGrantedScopes(),
            account.getTokenExpiresAt(),
            account.getCreatedAt()
        ));
    }

    @DeleteMapping("/connections/{connectionId}")
    @Operation(summary = "Disconnect and revoke a connected account")
    public ResponseEntity<Void> deleteConnection(@PathVariable UUID connectionId) {
        UUID projectId = resolveAuthenticatedProjectId();
        oauthEngineService.disconnectAccount(projectId, connectionId, null);
        return ResponseEntity.noContent().build();
    }

    // --- 4. TOOLS ---
    @GetMapping("/tools")
    @Operation(summary = "List all tools available in enabled integrations")
    public ResponseEntity<List<ToolDefinitionResponse>> listTools() {
        UUID projectId = resolveAuthenticatedProjectId();
        return ResponseEntity.ok(toolRegistryService.listToolsForProject(projectId, null));
    }

    @GetMapping("/tools/{toolSlug}")
    @Operation(summary = "Get tool definition and input JSON schema")
    public ResponseEntity<ToolDefinitionResponse> getTool(@PathVariable String toolSlug) {
        return ResponseEntity.ok(toolRegistryService.getToolBySlug(toolSlug));
    }

    @PostMapping("/tools/execute")
    @Operation(summary = "Execute a tool through the unified execution engine")
    public ResponseEntity<ExecutionResponse> executeTool(@Valid @RequestBody ExecuteToolRequest request) {
        UUID projectId = resolveAuthenticatedProjectId();
        return ResponseEntity.ok(executionEngineService.execute(projectId, null, request));
    }

    // --- 5. EXECUTIONS ---
    @GetMapping("/executions")
    @Operation(summary = "List execution history for this project")
    public ResponseEntity<List<ExecutionResponse>> listExecutions() {
        UUID projectId = resolveAuthenticatedProjectId();
        return ResponseEntity.ok(executionEngineService.listExecutions(projectId, null));
    }

    @GetMapping("/executions/{executionId}")
    @Operation(summary = "Get status and output of a specific execution")
    public ResponseEntity<ExecutionResponse> getExecution(@PathVariable UUID executionId) {
        UUID projectId = resolveAuthenticatedProjectId();
        Execution e = executionRepository.findByIdAndProjectId(executionId, projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Execution not found: " + executionId));

        return ResponseEntity.ok(new ExecutionResponse(
            e.getId(),
            e.getProject().getId(),
            e.getToolSlug(),
            e.getProjectUserId(),
            e.getStatus(),
            null,
            e.getErrorMessage(),
            e.getDurationMs(),
            e.getStartedAt(),
            e.getCompletedAt(),
            false,
            null
        ));
    }

    // --- 6. APPROVALS ---
    @GetMapping("/approvals")
    @Operation(summary = "List pending tool execution approval requests")
    public ResponseEntity<List<ApprovalResponse>> listApprovals() {
        UUID projectId = resolveAuthenticatedProjectId();
        return ResponseEntity.ok(executionEngineService.listPendingApprovals(projectId, null));
    }

    @PostMapping("/approvals/{approvalId}")
    @Operation(summary = "Authorize or reject a pending tool execution")
    public ResponseEntity<ApprovalResponse> decideApproval(
        @PathVariable UUID approvalId,
        @Valid @RequestBody ApprovalDecisionRequest request
    ) {
        UUID projectId = resolveAuthenticatedProjectId();
        return ResponseEntity.ok(executionEngineService.decideApproval(projectId, approvalId, null, request));
    }

    // --- 7. WEBHOOKS ---
    @PostMapping("/webhooks")
    @Operation(summary = "Register a new webhook subscription")
    public ResponseEntity<WebhookResponse> createWebhook(@Valid @RequestBody CreateWebhookRequest request) {
        UUID projectId = resolveAuthenticatedProjectId();
        return ResponseEntity.ok(webhookDispatcherService.createWebhook(projectId, request));
    }

    @GetMapping("/webhooks")
    @Operation(summary = "List all webhooks configured for this project")
    public ResponseEntity<List<WebhookResponse>> listWebhooks() {
        UUID projectId = resolveAuthenticatedProjectId();
        return ResponseEntity.ok(webhookDispatcherService.listWebhooks(projectId));
    }

    @GetMapping("/webhooks/{webhookId}")
    @Operation(summary = "Get webhook details")
    public ResponseEntity<WebhookResponse> getWebhook(@PathVariable UUID webhookId) {
        UUID projectId = resolveAuthenticatedProjectId();
        return ResponseEntity.ok(webhookDispatcherService.getWebhook(webhookId, projectId));
    }

    @DeleteMapping("/webhooks/{webhookId}")
    @Operation(summary = "Delete a webhook")
    public ResponseEntity<Void> deleteWebhook(@PathVariable UUID webhookId) {
        UUID projectId = resolveAuthenticatedProjectId();
        webhookDispatcherService.deleteWebhook(webhookId, projectId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/webhooks/{webhookId}/deliveries")
    @Operation(summary = "List delivery attempts for a webhook")
    public ResponseEntity<List<WebhookDeliveryResponse>> listDeliveries(@PathVariable UUID webhookId) {
        UUID projectId = resolveAuthenticatedProjectId();
        return ResponseEntity.ok(webhookDispatcherService.listDeliveries(webhookId, projectId));
    }

    @PostMapping("/webhooks/{webhookId}/test")
    @Operation(summary = "Send a test ping delivery event to this webhook")
    public ResponseEntity<WebhookDeliveryResponse> testWebhook(@PathVariable UUID webhookId) {
        UUID projectId = resolveAuthenticatedProjectId();
        return ResponseEntity.ok(webhookDispatcherService.testWebhook(webhookId, projectId));
    }

    /**
     * Resolves the authenticated project ID either from the API Key or Console User JWT.
     */
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

        throw new UnauthorizedException("API Key or authenticated session required to access /v1 endpoints");
    }
}
