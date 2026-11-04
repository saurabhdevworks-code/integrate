package com.integrationplatform.publicapi;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.integrationplatform.common.security.ApiKeyPrincipal;
import com.integrationplatform.common.security.SecurityContextHelper;
import com.integrationplatform.execution.dto.ExecuteToolRequest;
import com.integrationplatform.execution.dto.ExecutionResponse;
import com.integrationplatform.execution.dto.ToolDefinitionResponse;
import com.integrationplatform.execution.model.ExecutionStatus;
import com.integrationplatform.execution.model.RiskLevel;
import com.integrationplatform.execution.repository.ExecutionRepository;
import com.integrationplatform.execution.service.ExecutionEngineService;
import com.integrationplatform.execution.service.ToolRegistryService;
import com.integrationplatform.integration.service.IntegrationRegistryService;
import com.integrationplatform.oauth.dto.ConnectedAccountResponse;
import com.integrationplatform.oauth.model.ConnectedAccountStatus;
import com.integrationplatform.oauth.repository.ConnectedAccountRepository;
import com.integrationplatform.oauth.service.OAuthEngineService;
import com.integrationplatform.organization.service.OrganizationService;
import com.integrationplatform.project.service.ProjectService;
import com.integrationplatform.publicapi.controller.PublicApiController;
import com.integrationplatform.session.dto.ConnectSessionResponse;
import com.integrationplatform.session.dto.CreateSessionRequest;
import com.integrationplatform.session.model.ConnectSessionStatus;
import com.integrationplatform.session.service.ConnectSessionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PublicApiControllerTest {

    @Mock
    private SecurityContextHelper securityContextHelper;

    @Mock
    private IntegrationRegistryService integrationRegistryService;

    @Mock
    private ToolRegistryService toolRegistryService;

    @Mock
    private ExecutionEngineService executionEngineService;

    @Mock
    private ExecutionRepository executionRepository;

    @Mock
    private OAuthEngineService oauthEngineService;

    @Mock
    private ConnectedAccountRepository connectedAccountRepository;

    @Mock
    private ConnectSessionService connectSessionService;

    @Mock
    private OrganizationService organizationService;

    @Mock
    private ProjectService projectService;

    @Mock
    private com.integrationplatform.webhook.service.WebhookDispatcherService webhookDispatcherService;

    @Mock
    private ApiKeyPrincipal apiKeyPrincipal;

    private PublicApiController controller;
    private UUID projectId;

    @BeforeEach
    void setUp() {
        controller = new PublicApiController(
            securityContextHelper,
            integrationRegistryService,
            toolRegistryService,
            executionEngineService,
            executionRepository,
            oauthEngineService,
            connectedAccountRepository,
            connectSessionService,
            organizationService,
            projectService,
            webhookDispatcherService
        );

        projectId = UUID.randomUUID();
    }

    @Test
    void testListTools_UsesAuthenticatedProject() {
        when(securityContextHelper.getCurrentApiKey()).thenReturn(apiKeyPrincipal);
        when(apiKeyPrincipal.getProjectId()).thenReturn(projectId);

        ToolDefinitionResponse tool = new ToolDefinitionResponse(
            UUID.randomUUID(), "gmail", "Gmail", "gmail.search_emails", "Search Emails",
            "Search inbox", null, "https://www.googleapis.com/auth/gmail.readonly",
            RiskLevel.LOW, false, "1.0.0"
        );
        when(toolRegistryService.listToolsForProject(projectId, null)).thenReturn(List.of(tool));

        ResponseEntity<List<ToolDefinitionResponse>> response = controller.listTools();

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(1, response.getBody().size());
        assertEquals("gmail.search_emails", response.getBody().get(0).slug());
    }

    @Test
    void testExecuteTool_DelegatesToExecutionEngine() {
        when(securityContextHelper.getCurrentApiKey()).thenReturn(apiKeyPrincipal);
        when(apiKeyPrincipal.getProjectId()).thenReturn(projectId);

        ObjectMapper mapper = new ObjectMapper();
        ExecuteToolRequest request = new ExecuteToolRequest("user_123", null, "gmail.search_emails", mapper.createObjectNode(), null);

        ExecutionResponse execRes = new ExecutionResponse(
            UUID.randomUUID(), projectId, "gmail.search_emails", "user_123",
            ExecutionStatus.SUCCEEDED, mapper.createObjectNode(), null, 120L,
            Instant.now(), Instant.now(), false, null
        );

        when(executionEngineService.execute(eq(projectId), eq(null), any(ExecuteToolRequest.class))).thenReturn(execRes);

        ResponseEntity<ExecutionResponse> response = controller.executeTool(request);

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertEquals("gmail.search_emails", response.getBody().toolSlug());
        assertEquals(ExecutionStatus.SUCCEEDED, response.getBody().status());
    }

    @Test
    void testCreateConnectSession_ReturnsHostedConnectUrl() {
        when(securityContextHelper.getCurrentApiKey()).thenReturn(apiKeyPrincipal);
        when(apiKeyPrincipal.getProjectId()).thenReturn(projectId);

        CreateSessionRequest request = new CreateSessionRequest("gmail", "end_user_789", "https://myapp.com/callback");
        ConnectSessionResponse sessionRes = new ConnectSessionResponse(
            UUID.randomUUID(), "gmail", "end_user_789",
            "https://accounts.google.com/o/oauth2/v2/auth?state=xyz",
            ConnectSessionStatus.PENDING, "https://myapp.com/callback", null,
            Instant.now().plusSeconds(1800), Instant.now()
        );

        when(connectSessionService.createSession(eq(projectId), any(CreateSessionRequest.class))).thenReturn(sessionRes);

        ResponseEntity<ConnectSessionResponse> response = controller.createConnectSession(request);

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertTrue(response.getBody().connectUrl().contains("accounts.google.com"));
    }
}
