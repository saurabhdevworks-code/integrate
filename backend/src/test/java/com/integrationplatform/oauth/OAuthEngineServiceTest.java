package com.integrationplatform.oauth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.integrationplatform.audit.service.AuditService;
import com.integrationplatform.common.exception.BadRequestException;
import com.integrationplatform.integration.model.Integration;
import com.integrationplatform.integration.model.OAuthProviderConfig;
import com.integrationplatform.integration.repository.IntegrationRepository;
import com.integrationplatform.integration.repository.OAuthProviderConfigRepository;
import com.integrationplatform.oauth.dto.InitiateOAuthRequest;
import com.integrationplatform.oauth.dto.OAuthInitiateResponse;
import com.integrationplatform.oauth.model.OAuthState;
import com.integrationplatform.oauth.repository.ConnectedAccountRepository;
import com.integrationplatform.oauth.repository.OAuthStateRepository;
import com.integrationplatform.oauth.service.OAuthEngineService;
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
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OAuthEngineServiceTest {

    @Mock
    private OAuthStateRepository oauthStateRepository;

    @Mock
    private ConnectedAccountRepository connectedAccountRepository;

    @Mock
    private IntegrationRepository integrationRepository;

    @Mock
    private OAuthProviderConfigRepository providerConfigRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private OrganizationMemberRepository memberRepository;

    @Mock
    private CredentialVaultService credentialVaultService;

    @Mock
    private AuditService auditService;

    @Mock
    private com.integrationplatform.webhook.service.WebhookDispatcherService webhookDispatcherService;

    private OAuthEngineService oauthEngineService;

    private Project project;
    private Integration gmailIntegration;
    private OAuthProviderConfig providerConfig;

    @BeforeEach
    void setUp() {
        oauthEngineService = new OAuthEngineService(
            oauthStateRepository,
            connectedAccountRepository,
            integrationRepository,
            providerConfigRepository,
            projectRepository,
            memberRepository,
            credentialVaultService,
            auditService,
            webhookDispatcherService,
            new ObjectMapper()
        );

        Organization org = new Organization("Acme Corp", "acme-corp");
        project = new Project(org, "Test App", "test-app");
        project.setId(UUID.randomUUID());

        gmailIntegration = new Integration();
        gmailIntegration.setId(UUID.randomUUID());
        gmailIntegration.setSlug("gmail");
        gmailIntegration.setName("Gmail");
        gmailIntegration.setAuthorizationUrl("https://accounts.google.com/o/oauth2/v2/auth");
        gmailIntegration.setTokenUrl("https://oauth2.googleapis.com/token");
        gmailIntegration.setDefaultScopes("https://www.googleapis.com/auth/gmail.readonly");

        providerConfig = new OAuthProviderConfig(
            project,
            gmailIntegration,
            "google-client-id-123.apps.googleusercontent.com",
            "encrypted-secret",
            "http://localhost:8080/api/oauth/callback",
            "https://www.googleapis.com/auth/gmail.readonly"
        );
    }

    @Test
    void testInitiateOAuthFlow_GeneratesAuthUrlWithPKCEAndState() {
        when(projectRepository.findById(project.getId())).thenReturn(Optional.of(project));
        when(integrationRepository.findBySlug("gmail")).thenReturn(Optional.of(gmailIntegration));
        when(providerConfigRepository.findByProjectIdAndIntegrationId(project.getId(), gmailIntegration.getId()))
            .thenReturn(Optional.of(providerConfig));

        InitiateOAuthRequest request = new InitiateOAuthRequest("gmail", "end_user_456", null);
        OAuthInitiateResponse response = oauthEngineService.initiateOAuthFlow(project.getId(), request);

        assertNotNull(response);
        assertNotNull(response.stateToken());
        assertNotNull(response.authorizationUrl());

        // Verify URL parameters
        assertTrue(response.authorizationUrl().contains("client_id=google-client-id-123"));
        assertTrue(response.authorizationUrl().contains("state=" + response.stateToken()));
        assertTrue(response.authorizationUrl().contains("code_challenge="));
        assertTrue(response.authorizationUrl().contains("code_challenge_method=S256"));
        assertTrue(response.authorizationUrl().contains("access_type=offline")); // For Google refresh token

        // Verify state persistence
        verify(oauthStateRepository).save(argThat(s ->
            s.getStateToken().equals(response.stateToken()) &&
            s.getProjectUserId().equals("end_user_456") &&
            s.getCodeVerifier() != null
        ));
    }

    @Test
    void testHandleCallback_ReplayAttackPrevention_ThrowsIfAlreadyUsed() {
        OAuthState usedState = new OAuthState(
            project,
            gmailIntegration,
            "user_1",
            "token_123",
            "verifier",
            "http://redirect",
            Instant.now().plusSeconds(300)
        );
        usedState.setUsedAt(Instant.now()); // Already used!

        when(oauthStateRepository.findByStateToken("token_123")).thenReturn(Optional.of(usedState));

        assertThrows(BadRequestException.class, () ->
            oauthEngineService.handleCallback("token_123", "auth_code", null)
        );
    }
}
