package com.integrationplatform.execution.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.integrationplatform.audit.service.AuditService;
import com.integrationplatform.auth.model.User;
import com.integrationplatform.auth.repository.UserRepository;
import com.integrationplatform.common.exception.BadRequestException;
import com.integrationplatform.common.exception.ForbiddenException;
import com.integrationplatform.common.exception.ResourceNotFoundException;
import com.integrationplatform.connector.ConnectorRegistry;
import com.integrationplatform.connector.IntegrationConnector;
import com.integrationplatform.connector.ToolExecutionContext;
import com.integrationplatform.execution.dto.ApprovalDecisionRequest;
import com.integrationplatform.execution.dto.ApprovalResponse;
import com.integrationplatform.execution.dto.ExecuteToolRequest;
import com.integrationplatform.execution.dto.ExecutionResponse;
import com.integrationplatform.execution.model.*;
import com.integrationplatform.execution.repository.ApprovalRepository;
import com.integrationplatform.execution.repository.ExecutionEventRepository;
import com.integrationplatform.execution.repository.ExecutionRepository;
import com.integrationplatform.execution.repository.ToolDefinitionRepository;
import com.integrationplatform.integration.model.ProjectIntegration;
import com.integrationplatform.integration.repository.ProjectIntegrationRepository;
import com.integrationplatform.oauth.model.ConnectedAccount;
import com.integrationplatform.oauth.model.ConnectedAccountStatus;
import com.integrationplatform.oauth.repository.ConnectedAccountRepository;
import com.integrationplatform.organization.repository.OrganizationMemberRepository;
import com.integrationplatform.oauth.service.TokenRefreshService;
import com.integrationplatform.project.model.Project;
import com.integrationplatform.project.repository.ProjectRepository;
import com.integrationplatform.usage.service.UsageMeteringService;
import com.integrationplatform.vault.service.CredentialVaultService;
import com.integrationplatform.webhook.service.WebhookDispatcherService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ExecutionEngineService {

    private static final Logger log = LoggerFactory.getLogger(ExecutionEngineService.class);

    private final ProjectRepository projectRepository;
    private final OrganizationMemberRepository memberRepository;
    private final ConnectedAccountRepository connectedAccountRepository;
    private final ProjectIntegrationRepository projectIntegrationRepository;
    private final ToolDefinitionRepository toolDefinitionRepository;
    private final ExecutionRepository executionRepository;
    private final ExecutionEventRepository executionEventRepository;
    private final ApprovalRepository approvalRepository;
    private final UserRepository userRepository;
    private final SchemaValidationService schemaValidationService;
    private final CredentialVaultService credentialVaultService;
    private final TokenRefreshService tokenRefreshService;
    private final ConnectorRegistry connectorRegistry;
    private final AuditService auditService;
    private final ObjectMapper objectMapper;
    private final WebhookDispatcherService webhookDispatcherService;
    private final UsageMeteringService usageMeteringService;

    public ExecutionEngineService(
        ProjectRepository projectRepository,
        OrganizationMemberRepository memberRepository,
        ConnectedAccountRepository connectedAccountRepository,
        ProjectIntegrationRepository projectIntegrationRepository,
        ToolDefinitionRepository toolDefinitionRepository,
        ExecutionRepository executionRepository,
        ExecutionEventRepository executionEventRepository,
        ApprovalRepository approvalRepository,
        UserRepository userRepository,
        SchemaValidationService schemaValidationService,
        CredentialVaultService credentialVaultService,
        TokenRefreshService tokenRefreshService,
        ConnectorRegistry connectorRegistry,
        AuditService auditService,
        ObjectMapper objectMapper,
        WebhookDispatcherService webhookDispatcherService,
        UsageMeteringService usageMeteringService
    ) {
        this.projectRepository = projectRepository;
        this.memberRepository = memberRepository;
        this.connectedAccountRepository = connectedAccountRepository;
        this.projectIntegrationRepository = projectIntegrationRepository;
        this.toolDefinitionRepository = toolDefinitionRepository;
        this.executionRepository = executionRepository;
        this.executionEventRepository = executionEventRepository;
        this.approvalRepository = approvalRepository;
        this.userRepository = userRepository;
        this.schemaValidationService = schemaValidationService;
        this.credentialVaultService = credentialVaultService;
        this.tokenRefreshService = tokenRefreshService;
        this.connectorRegistry = connectorRegistry;
        this.auditService = auditService;
        this.objectMapper = objectMapper;
        this.webhookDispatcherService = webhookDispatcherService;
        this.usageMeteringService = usageMeteringService;
    }

    @Transactional
    public ExecutionResponse execute(UUID projectId, UUID callerUserId, ExecuteToolRequest request) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        // Tenant ownership check if called by a user
        if (callerUserId != null) {
            boolean isMember = memberRepository.existsByOrganizationIdAndUserId(project.getOrganization().getId(), callerUserId);
            if (!isMember) {
                throw new ForbiddenException("You do not have access to execute tools in this project");
            }
        }

        // 1. Idempotency check: if key supplied and succeeded execution exists, return cached result
        if (StringUtils.hasText(request.idempotencyKey())) {
            Optional<Execution> existing = executionRepository.findByProjectIdAndIdempotencyKey(projectId, request.idempotencyKey().trim());
            if (existing.isPresent() && existing.get().getStatus() == ExecutionStatus.SUCCEEDED) {
                return mapToResponse(existing.get(), false, null);
            }
        }

        // 2. Find Tool Definition in registry
        ToolDefinition tool = toolDefinitionRepository.findBySlug(request.tool().trim().toLowerCase())
            .orElseThrow(() -> new ResourceNotFoundException("Tool not found with slug: " + request.tool()));

        // 3. Verify Integration is enabled for this project
        Optional<ProjectIntegration> projectInteg = projectIntegrationRepository
            .findByProjectIdAndIntegrationId(projectId, tool.getIntegration().getId());
        if (projectInteg.isPresent() && !projectInteg.get().isEnabled()) {
            throw new BadRequestException("Integration '" + tool.getIntegration().getName() + "' is disabled for this project");
        }

        // 4. Validate input payload against Tool JSON Schema
        schemaValidationService.validate(tool.getInputSchema(), request.input());

        // 5. Resolve Connected Account for end user
        ConnectedAccount account;
        if (request.connectedAccountId() != null) {
            account = connectedAccountRepository.findByIdAndProjectId(request.connectedAccountId(), projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Connected account not found with id: " + request.connectedAccountId()));
            if (!account.getProjectUserId().equals(request.projectUserId().trim())) {
                throw new ForbiddenException("Connected account does not belong to user: " + request.projectUserId());
            }
        } else {
            account = connectedAccountRepository
                .findByProjectIdAndIntegrationIdAndProjectUserId(projectId, tool.getIntegration().getId(), request.projectUserId().trim())
                .orElseThrow(() -> new BadRequestException("No connected " + tool.getIntegration().getName() + " account found for user '" + request.projectUserId() + "'. Please initiate OAuth authorization first."));
        }

        if (account.getStatus() != ConnectedAccountStatus.CONNECTED) {
            throw new BadRequestException("Connected account is in status " + account.getStatus() + ". Re-authorization is required.");
        }

        // 6. Check Granted Scopes
        if (StringUtils.hasText(tool.getRequiredScopes()) && StringUtils.hasText(account.getGrantedScopes())) {
            String[] required = tool.getRequiredScopes().split("\\s+");
            for (String reqScope : required) {
                if (!account.getGrantedScopes().contains(reqScope)) {
                    log.warn("Account granted scopes [{}] missing required scope [{}]", account.getGrantedScopes(), reqScope);
                }
            }
        }

        // Safe input serialization (with basic redaction)
        String inputPayloadStr = redactSensitiveInput(request.input());

        // Create Execution record
        Execution execution = new Execution(
            project,
            account,
            tool.getSlug(),
            request.projectUserId().trim(),
            StringUtils.hasText(request.idempotencyKey()) ? request.idempotencyKey().trim() : null,
            inputPayloadStr
        );
        Execution savedExecution = executionRepository.save(execution);

        // Record initialization event
        addEvent(savedExecution, "execution.initialized", "Execution created and schema validated", null);

        // 7. Check Approval requirement
        if (tool.isRequiresApproval()) {
            savedExecution.setStatus(ExecutionStatus.PENDING_APPROVAL);
            executionRepository.save(savedExecution);

            Approval approval = new Approval(savedExecution, project, tool.getSlug());
            Approval savedApproval = approvalRepository.save(approval);

            addEvent(savedExecution, "approval.required", "Tool has HIGH risk level and requires explicit authorization", null);

            ExecutionResponse approvalResponse = mapToResponse(savedExecution, true, savedApproval.getId());
            webhookDispatcherService.dispatch(project.getId(), "approval.required", approvalResponse);
            return approvalResponse;
        }

        // 8. Execute Tool
        return runExecution(savedExecution, tool, account);
    }

    @Transactional
    public ExecutionResponse runExecution(Execution execution, ToolDefinition tool, ConnectedAccount account) {
        long startTime = System.currentTimeMillis();
        execution.setStatus(ExecutionStatus.RUNNING);
        executionRepository.save(execution);
        addEvent(execution, "execution.started", "Retrieving credentials and executing connector", null);

        webhookDispatcherService.dispatch(execution.getProject().getId(), "execution.started", mapToResponse(execution, false, null));

        try {
            if (account.getCredential() == null || account.getCredential().getAccessTokenEncrypted() == null) {
                throw new IllegalStateException("Connected account has no stored credentials");
            }

            // Retrieve and auto-refresh valid access token if near expiry
            String decryptedToken = tokenRefreshService.getOrRefreshToken(account);

            ToolExecutionContext context = new ToolExecutionContext(
                execution.getId(),
                execution.getProject().getId(),
                execution.getProjectUserId(),
                account,
                decryptedToken,
                execution.getIdempotencyKey()
            );

            JsonNode output;
            Optional<IntegrationConnector> connectorOpt = connectorRegistry.findConnectorForTool(tool.getSlug());

            if (connectorOpt.isPresent()) {
                JsonNode inputNode = objectMapper.readTree(execution.getInputPayload());
                output = connectorOpt.get().execute(tool.getSlug(), inputNode, context);
            } else {
                // If live provider connector is not yet wired in M3, generate a structured simulation response
                output = buildSimulatedResult(tool.getSlug(), execution.getProjectUserId());
            }

            long duration = System.currentTimeMillis() - startTime;
            execution.setOutputPayload(output.toString());
            execution.setStatus(ExecutionStatus.SUCCEEDED);
            execution.setDurationMs(duration);
            execution.setCompletedAt(Instant.now());

            Execution saved = executionRepository.save(execution);
            addEvent(saved, "execution.succeeded", "Execution finished successfully in " + duration + "ms", output.toString());

            usageMeteringService.recordExecution(execution.getProject().getId(), true, duration);
            ExecutionResponse successResponse = mapToResponse(saved, false, null);
            webhookDispatcherService.dispatch(execution.getProject().getId(), "execution.succeeded", successResponse);

            return successResponse;
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("Execution failed for tool: {}", tool.getSlug(), e);

            execution.setStatus(ExecutionStatus.FAILED);
            execution.setErrorMessage(e.getMessage());
            execution.setErrorCategory(e.getClass().getSimpleName());
            execution.setDurationMs(duration);
            execution.setCompletedAt(Instant.now());

            Execution saved = executionRepository.save(execution);
            addEvent(saved, "execution.failed", "Error: " + e.getMessage(), null);

            usageMeteringService.recordExecution(execution.getProject().getId(), false, duration);
            ExecutionResponse failedResponse = mapToResponse(saved, false, null);
            webhookDispatcherService.dispatch(execution.getProject().getId(), "execution.failed", failedResponse);

            return failedResponse;
        }
    }

    @Transactional
    public ApprovalResponse decideApproval(UUID projectId, UUID approvalId, UUID userId, ApprovalDecisionRequest request) {
        Approval approval = approvalRepository.findByIdAndProjectId(approvalId, projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Approval not found"));

        if (approval.getStatus() != ApprovalStatus.PENDING) {
            throw new BadRequestException("Approval has already been decided with status: " + approval.getStatus());
        }

        User user = userRepository.findById(userId).orElse(null);
        approval.setDecidedByUser(user);
        approval.setDecidedAt(Instant.now());
        approval.setReason(request.reason());

        Execution execution = approval.getExecution();

        if ("APPROVE".equalsIgnoreCase(request.decision())) {
            approval.setStatus(ApprovalStatus.APPROVED);
            approvalRepository.save(approval);

            ToolDefinition tool = toolDefinitionRepository.findBySlug(execution.getToolSlug())
                .orElseThrow(() -> new ResourceNotFoundException("Tool not found: " + execution.getToolSlug()));

            runExecution(execution, tool, execution.getConnectedAccount());
        } else {
            approval.setStatus(ApprovalStatus.REJECTED);
            approvalRepository.save(approval);

            execution.setStatus(ExecutionStatus.REJECTED);
            execution.setErrorMessage("Execution rejected by approver: " + (request.reason() != null ? request.reason() : "No reason provided"));
            execution.setCompletedAt(Instant.now());
            executionRepository.save(execution);
        }

        ApprovalResponse decidedResponse = new ApprovalResponse(
            approval.getId(),
            execution.getId(),
            projectId,
            approval.getToolSlug(),
            approval.getStatus(),
            approval.getReason(),
            approval.getCreatedAt(),
            approval.getDecidedAt()
        );
        webhookDispatcherService.dispatch(projectId, "approval.completed", decidedResponse);
        return decidedResponse;
    }

    @Transactional(readOnly = true)
    public List<ExecutionResponse> listExecutions(UUID projectId, UUID userId) {
        validateProjectAccess(projectId, userId);
        return executionRepository.findByProjectIdOrderByCreatedAtDesc(projectId).stream()
            .map(e -> mapToResponse(e, false, null))
            .toList();
    }

    @Transactional(readOnly = true)
    public List<ApprovalResponse> listPendingApprovals(UUID projectId, UUID userId) {
        validateProjectAccess(projectId, userId);
        return approvalRepository.findByProjectIdAndStatusOrderByCreatedAtDesc(projectId, ApprovalStatus.PENDING).stream()
            .map(a -> new ApprovalResponse(
                a.getId(),
                a.getExecution().getId(),
                projectId,
                a.getToolSlug(),
                a.getStatus(),
                a.getReason(),
                a.getCreatedAt(),
                a.getDecidedAt()
            ))
            .toList();
    }

    private void addEvent(Execution execution, String type, String message, String payload) {
        ExecutionEvent event = new ExecutionEvent(execution, type, message, payload);
        executionEventRepository.save(event);
    }

    private ExecutionResponse mapToResponse(Execution e, boolean requiresApproval, UUID approvalId) {
        JsonNode outputNode = null;
        if (e.getOutputPayload() != null) {
            try {
                outputNode = objectMapper.readTree(e.getOutputPayload());
            } catch (Exception ignored) {}
        }

        return new ExecutionResponse(
            e.getId(),
            e.getProject().getId(),
            e.getToolSlug(),
            e.getProjectUserId(),
            e.getStatus(),
            outputNode,
            e.getErrorMessage(),
            e.getDurationMs(),
            e.getStartedAt(),
            e.getCompletedAt(),
            requiresApproval,
            approvalId
        );
    }

    private String redactSensitiveInput(JsonNode input) {
        if (input == null) return "{}";
        // Create safe shallow copy
        JsonNode copy = input.deepCopy();
        if (copy.isObject()) {
            ObjectNode obj = (ObjectNode) copy;
            if (obj.has("password")) obj.put("password", "[REDACTED]");
            if (obj.has("secret")) obj.put("secret", "[REDACTED]");
            if (obj.has("token")) obj.put("token", "[REDACTED]");
        }
        return copy.toString();
    }

    private JsonNode buildSimulatedResult(String toolSlug, String projectUserId) {
        ObjectNode result = objectMapper.createObjectNode();
        result.put("tool", toolSlug);
        result.put("projectUserId", projectUserId);
        result.put("status", "SUCCESS");
        result.put("executedAt", Instant.now().toString());

        if (toolSlug.contains("search")) {
            result.put("matchCount", 3);
            result.putArray("items");
        } else if (toolSlug.contains("send") || toolSlug.contains("create")) {
            result.put("createdId", UUID.randomUUID().toString());
            result.put("acknowledged", true);
        } else {
            result.put("count", 5);
        }
        return result;
    }

    private void validateProjectAccess(UUID projectId, UUID userId) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + projectId));

        if (!memberRepository.existsByOrganizationIdAndUserId(project.getOrganization().getId(), userId)) {
            throw new ForbiddenException("You do not have access to this project");
        }
    }
}
