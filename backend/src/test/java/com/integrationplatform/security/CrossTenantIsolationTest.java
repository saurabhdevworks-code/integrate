package com.integrationplatform.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.integrationplatform.common.exception.ForbiddenException;
import com.integrationplatform.common.exception.ResourceNotFoundException;
import com.integrationplatform.audit.service.AuditService;
import com.integrationplatform.connector.ConnectorRegistry;
import com.integrationplatform.execution.dto.ApprovalDecisionRequest;
import com.integrationplatform.execution.dto.ExecuteToolRequest;
import com.integrationplatform.execution.model.Approval;
import com.integrationplatform.execution.model.Execution;
import com.integrationplatform.execution.model.ToolDefinition;
import com.integrationplatform.execution.repository.*;
import com.integrationplatform.execution.service.ExecutionEngineService;
import com.integrationplatform.execution.service.SchemaValidationService;
import com.integrationplatform.integration.model.Integration;
import com.integrationplatform.integration.repository.ProjectIntegrationRepository;
import com.integrationplatform.oauth.model.ConnectedAccount;
import com.integrationplatform.oauth.repository.ConnectedAccountRepository;
import com.integrationplatform.oauth.service.TokenRefreshService;
import com.integrationplatform.organization.model.Organization;
import com.integrationplatform.organization.repository.OrganizationMemberRepository;
import com.integrationplatform.project.model.Project;
import com.integrationplatform.project.repository.ProjectRepository;
import com.integrationplatform.usage.service.UsageMeteringService;
import com.integrationplatform.vault.service.CredentialVaultService;
import com.integrationplatform.webhook.dto.CreateWebhookRequest;
import com.integrationplatform.webhook.model.Webhook;
import com.integrationplatform.webhook.repository.WebhookDeliveryRepository;
import com.integrationplatform.webhook.repository.WebhookRepository;
import com.integrationplatform.webhook.service.WebhookDispatcherService;
import com.integrationplatform.webhook.service.WebhookSignatureService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CrossTenantIsolationTest {

    // Execution Engine Mocks
    @Mock private ProjectRepository projectRepository;
    @Mock private OrganizationMemberRepository memberRepository;
    @Mock private ConnectedAccountRepository connectedAccountRepository;
    @Mock private ProjectIntegrationRepository projectIntegrationRepository;
    @Mock private ToolDefinitionRepository toolDefinitionRepository;
    @Mock private ExecutionRepository executionRepository;
    @Mock private ExecutionEventRepository executionEventRepository;
    @Mock private ApprovalRepository approvalRepository;
    @Mock private CredentialVaultService credentialVaultService;
    @Mock private TokenRefreshService tokenRefreshService;
    @Mock private AuditService auditService;
    @Mock private WebhookDispatcherService webhookDispatcherService;
    @Mock private UsageMeteringService usageMeteringService;

    // Webhook Mocks
    @Mock private WebhookRepository webhookRepository;
    @Mock private WebhookDeliveryRepository webhookDeliveryRepository;
    @Mock private WebhookSignatureService webhookSignatureService;

    private ExecutionEngineService executionEngineService;
    private WebhookDispatcherService dispatcherService;
    private ObjectMapper objectMapper;

    private Project projectA;
    private Project projectB;
    private ConnectedAccount accountB;

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

        dispatcherService = new WebhookDispatcherService(
            webhookRepository,
            webhookDeliveryRepository,
            projectRepository,
            webhookSignatureService,
            objectMapper
        );

        Organization orgA = new Organization("Org A", "org-a");
        orgA.setId(UUID.randomUUID());
        projectA = new Project(orgA, "Project A", "project-a");
        projectA.setId(UUID.randomUUID());

        Organization orgB = new Organization("Org B", "org-b");
        orgB.setId(UUID.randomUUID());
        projectB = new Project(orgB, "Project B", "project-b");
        projectB.setId(UUID.randomUUID());

        Integration gmail = new Integration("gmail", "Gmail", "email", "OAUTH2");
        accountB = new ConnectedAccount(projectB, gmail, "victim_user", null, null, null, "read", null);
        accountB.setId(UUID.randomUUID());
    }

    @Test
    @DisplayName("Penetration Test: Tenant A cannot execute actions with Tenant B's connected account ID")
    void testTenantACannotExecuteWithTenantBAccount() {
        when(projectRepository.findById(projectA.getId())).thenReturn(Optional.of(projectA));

        // When Project A queries for accountB.getId(), the repository is queried with projectA.getId(),
        // so it must return Optional.empty()
        when(connectedAccountRepository.findByIdAndProjectId(accountB.getId(), projectA.getId()))
            .thenReturn(Optional.empty());

        ExecuteToolRequest req = new ExecuteToolRequest(
            "attacker_user",
            accountB.getId(),
            "gmail.search_emails",
            objectMapper.createObjectNode(),
            null
        );

        assertThrows(ResourceNotFoundException.class, () -> {
            executionEngineService.execute(projectA.getId(), null, req);
        }, "Execution must fail with ResourceNotFoundException when cross-tenant account is supplied");
    }

    @Test
    @DisplayName("Penetration Test: Tenant A cannot decide or tamper with Tenant B's approvals")
    void testTenantACannotDecideTenantBApproval() {
        UUID approvalId = UUID.randomUUID();

        // Project A attempts to decide approval belonging to Project B
        when(approvalRepository.findByIdAndProjectId(approvalId, projectA.getId()))
            .thenReturn(Optional.empty());

        ApprovalDecisionRequest req = new ApprovalDecisionRequest("APPROVE", "Tampered approval");

        assertThrows(ResourceNotFoundException.class, () -> {
            executionEngineService.decideApproval(projectA.getId(), approvalId, null, req);
        }, "Approving another tenant's action must be rejected with ResourceNotFoundException");
    }

    @Test
    @DisplayName("Penetration Test: Tenant A cannot access or delete Tenant B's webhooks")
    void testTenantACannotAccessTenantBWebhook() {
        UUID webhookBId = UUID.randomUUID();

        when(webhookRepository.findByIdAndProjectId(webhookBId, projectA.getId()))
            .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            dispatcherService.getWebhook(webhookBId, projectA.getId());
        }, "Reading another tenant's webhook must fail");

        assertThrows(ResourceNotFoundException.class, () -> {
            dispatcherService.deleteWebhook(webhookBId, projectA.getId());
        }, "Deleting another tenant's webhook must fail");
    }

    @Test
    @DisplayName("Penetration Test: Tenant A cannot view Tenant B's webhook delivery logs")
    void testTenantACannotViewTenantBDeliveries() {
        UUID webhookBId = UUID.randomUUID();

        when(webhookRepository.findByIdAndProjectId(webhookBId, projectA.getId()))
            .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            dispatcherService.listDeliveries(webhookBId, projectA.getId());
        }, "Accessing another tenant's webhook deliveries must fail");
    }

    @Test
    @DisplayName("Penetration Test: Unauthenticated caller without membership cannot execute tools")
    void testUserWithoutMembershipRejected() {
        UUID unauthorizedUserId = UUID.randomUUID();
        when(projectRepository.findById(projectA.getId())).thenReturn(Optional.of(projectA));
        when(memberRepository.existsByOrganizationIdAndUserId(projectA.getOrganization().getId(), unauthorizedUserId))
            .thenReturn(false);

        ExecuteToolRequest req = new ExecuteToolRequest(
            "user_123",
            null,
            "gmail.search_emails",
            objectMapper.createObjectNode(),
            null
        );

        assertThrows(ForbiddenException.class, () -> {
            executionEngineService.execute(projectA.getId(), unauthorizedUserId, req);
        }, "Unauthorized user must be rejected with ForbiddenException");
    }
}
