package com.integrationplatform.execution;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.integrationplatform.audit.service.AuditService;
import com.integrationplatform.common.exception.ForbiddenException;
import com.integrationplatform.connector.ConnectorRegistry;
import com.integrationplatform.execution.dto.ExecuteToolRequest;
import com.integrationplatform.execution.dto.ExecutionResponse;
import com.integrationplatform.execution.model.*;
import com.integrationplatform.execution.repository.ApprovalRepository;
import com.integrationplatform.execution.repository.ExecutionEventRepository;
import com.integrationplatform.execution.repository.ExecutionRepository;
import com.integrationplatform.execution.repository.ToolDefinitionRepository;
import com.integrationplatform.execution.service.ExecutionEngineService;
import com.integrationplatform.execution.service.SchemaValidationService;
import com.integrationplatform.integration.model.Integration;
import com.integrationplatform.integration.repository.ProjectIntegrationRepository;
import com.integrationplatform.oauth.model.ConnectedAccount;
import com.integrationplatform.oauth.model.ConnectedAccountStatus;
import com.integrationplatform.oauth.model.EncryptedCredential;
import com.integrationplatform.oauth.repository.ConnectedAccountRepository;
import com.integrationplatform.oauth.service.TokenRefreshService;
import com.integrationplatform.organization.model.Organization;
import com.integrationplatform.organization.repository.OrganizationMemberRepository;
import com.integrationplatform.project.model.Project;
import com.integrationplatform.project.repository.ProjectRepository;
import com.integrationplatform.vault.service.CredentialVaultService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExecutionEngineServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private OrganizationMemberRepository memberRepository;

    @Mock
    private ConnectedAccountRepository connectedAccountRepository;

    @Mock
    private ProjectIntegrationRepository projectIntegrationRepository;

    @Mock
    private ToolDefinitionRepository toolDefinitionRepository;

    @Mock
    private ExecutionRepository executionRepository;

    @Mock
    private ExecutionEventRepository executionEventRepository;

    @Mock
    private ApprovalRepository approvalRepository;

    @Mock
    private CredentialVaultService credentialVaultService;

    @Mock
    private TokenRefreshService tokenRefreshService;

    @Mock
    private AuditService auditService;

    @Mock
    private com.integrationplatform.webhook.service.WebhookDispatcherService webhookDispatcherService;

    @Mock
    private com.integrationplatform.usage.service.UsageMeteringService usageMeteringService;

    private ExecutionEngineService executionEngineService;
    private ObjectMapper objectMapper;

    private UUID projectId;
    private UUID userId;
    private Project project;
    private Integration gmailInteg;
    private ConnectedAccount connectedAccount;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        SchemaValidationService schemaValidationService = new SchemaValidationService(objectMapper);
        ConnectorRegistry connectorRegistry = new ConnectorRegistry(Collections.emptyList());

        executionEngineService = new ExecutionEngineService(
            projectRepository,
            memberRepository,
            connectedAccountRepository,
            projectIntegrationRepository,
            toolDefinitionRepository,
            executionRepository,
            executionEventRepository,
            approvalRepository,
            null,
            schemaValidationService,
            credentialVaultService,
            tokenRefreshService,
            connectorRegistry,
            auditService,
            objectMapper,
            webhookDispatcherService,
            usageMeteringService
        );

        projectId = UUID.randomUUID();
        userId = UUID.randomUUID();

        Organization org = new Organization("Acme Corp", "acme-corp");
        org.setId(UUID.randomUUID());

        project = new Project(org, "Main App", "main-app");
        project.setId(projectId);

        gmailInteg = new Integration();
        gmailInteg.setId(UUID.randomUUID());
        gmailInteg.setSlug("gmail");
        gmailInteg.setName("Gmail");

        connectedAccount = new ConnectedAccount(
            project,
            gmailInteg,
            "user_456",
            "google_id_789",
            "user@gmail.com",
            "Test User",
            "https://www.googleapis.com/auth/gmail.readonly",
            Instant.now().plusSeconds(3600)
        );
        connectedAccount.setStatus(ConnectedAccountStatus.CONNECTED);
        connectedAccount.setCredential(new EncryptedCredential(connectedAccount, "enc_access_token", null, 1));
    }

    @Test
    void testExecute_Success() {
        ToolDefinition tool = new ToolDefinition(
            gmailInteg,
            "gmail.search_emails",
            "Search",
            "Search desc",
            "{\"type\":\"object\",\"properties\":{\"query\":{\"type\":\"string\"}},\"required\":[\"query\"]}",
            "https://www.googleapis.com/auth/gmail.readonly",
            RiskLevel.LOW,
            false
        );

        when(projectRepository.findById(projectId)).thenReturn(Optional.of(project));
        when(memberRepository.existsByOrganizationIdAndUserId(any(), eq(userId))).thenReturn(true);
        when(toolDefinitionRepository.findBySlug("gmail.search_emails")).thenReturn(Optional.of(tool));
        when(projectIntegrationRepository.findByProjectIdAndIntegrationId(any(), any())).thenReturn(Optional.empty());
        when(connectedAccountRepository.findByProjectIdAndIntegrationIdAndProjectUserId(projectId, gmailInteg.getId(), "user_456"))
            .thenReturn(Optional.of(connectedAccount));
        when(tokenRefreshService.getOrRefreshToken(connectedAccount)).thenReturn("plain_access_token");

        when(executionRepository.save(any(Execution.class))).thenAnswer(i -> {
            Execution e = i.getArgument(0);
            if (e.getId() == null) e.setId(UUID.randomUUID());
            return e;
        });

        ObjectNode input = objectMapper.createObjectNode();
        input.put("query", "is:unread");

        ExecuteToolRequest request = new ExecuteToolRequest("user_456", null, "gmail.search_emails", input, null);
        ExecutionResponse response = executionEngineService.execute(projectId, userId, request);

        assertNotNull(response);
        assertEquals(ExecutionStatus.SUCCEEDED, response.status());
        assertNotNull(response.output());
        assertNull(response.errorMessage());
    }

    @Test
    void testExecute_ApprovalGated_HighRiskToolReturnsPendingApproval() {
        ToolDefinition highRiskTool = new ToolDefinition(
            gmailInteg,
            "gmail.send_email",
            "Send",
            "Send email",
            "{\"type\":\"object\"}",
            null,
            RiskLevel.HIGH,
            true // Requires approval!
        );

        when(projectRepository.findById(projectId)).thenReturn(Optional.of(project));
        when(memberRepository.existsByOrganizationIdAndUserId(any(), eq(userId))).thenReturn(true);
        when(toolDefinitionRepository.findBySlug("gmail.send_email")).thenReturn(Optional.of(highRiskTool));
        when(projectIntegrationRepository.findByProjectIdAndIntegrationId(any(), any())).thenReturn(Optional.empty());
        when(connectedAccountRepository.findByProjectIdAndIntegrationIdAndProjectUserId(projectId, gmailInteg.getId(), "user_456"))
            .thenReturn(Optional.of(connectedAccount));

        when(executionRepository.save(any(Execution.class))).thenAnswer(i -> {
            Execution e = i.getArgument(0);
            if (e.getId() == null) e.setId(UUID.randomUUID());
            return e;
        });

        when(approvalRepository.save(any(Approval.class))).thenAnswer(i -> {
            Approval a = i.getArgument(0);
            a.setId(UUID.randomUUID());
            return a;
        });

        ExecuteToolRequest request = new ExecuteToolRequest("user_456", null, "gmail.send_email", objectMapper.createObjectNode(), null);
        ExecutionResponse response = executionEngineService.execute(projectId, userId, request);

        assertNotNull(response);
        assertEquals(ExecutionStatus.PENDING_APPROVAL, response.status());
        assertTrue(response.requiresApproval());
        assertNotNull(response.approvalId());
    }

    @Test
    void testExecute_TenantIsolation_DeniedForNonMember() {
        when(projectRepository.findById(projectId)).thenReturn(Optional.of(project));
        when(memberRepository.existsByOrganizationIdAndUserId(any(), eq(userId))).thenReturn(false);

        ExecuteToolRequest request = new ExecuteToolRequest("user_456", null, "gmail.search_emails", objectMapper.createObjectNode(), null);

        assertThrows(ForbiddenException.class, () ->
            executionEngineService.execute(projectId, userId, request)
        );
        verify(executionRepository, never()).save(any());
    }
}
