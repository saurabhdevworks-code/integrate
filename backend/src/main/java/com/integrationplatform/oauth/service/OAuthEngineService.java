package com.integrationplatform.oauth.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.integrationplatform.audit.service.AuditService;
import com.integrationplatform.common.exception.BadRequestException;
import com.integrationplatform.common.exception.ForbiddenException;
import com.integrationplatform.common.exception.ResourceNotFoundException;
import com.integrationplatform.integration.model.Integration;
import com.integrationplatform.integration.model.OAuthProviderConfig;
import com.integrationplatform.integration.repository.IntegrationRepository;
import com.integrationplatform.integration.repository.OAuthProviderConfigRepository;
import com.integrationplatform.oauth.dto.ConnectedAccountResponse;
import com.integrationplatform.oauth.dto.InitiateOAuthRequest;
import com.integrationplatform.oauth.dto.OAuthInitiateResponse;
import com.integrationplatform.oauth.model.ConnectedAccount;
import com.integrationplatform.oauth.model.ConnectedAccountStatus;
import com.integrationplatform.oauth.model.EncryptedCredential;
import com.integrationplatform.oauth.model.OAuthState;
import com.integrationplatform.oauth.repository.ConnectedAccountRepository;
import com.integrationplatform.oauth.repository.OAuthStateRepository;
import com.integrationplatform.organization.repository.OrganizationMemberRepository;
import com.integrationplatform.project.model.Project;
import com.integrationplatform.project.repository.ProjectRepository;
import com.integrationplatform.vault.service.CredentialVaultService;
import com.integrationplatform.webhook.service.WebhookDispatcherService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class OAuthEngineService {

    private static final Logger log = LoggerFactory.getLogger(OAuthEngineService.class);

    private final OAuthStateRepository oauthStateRepository;
    private final ConnectedAccountRepository connectedAccountRepository;
    private final IntegrationRepository integrationRepository;
    private final OAuthProviderConfigRepository providerConfigRepository;
    private final ProjectRepository projectRepository;
    private final OrganizationMemberRepository memberRepository;
    private final CredentialVaultService credentialVaultService;
    private final AuditService auditService;
    private final WebhookDispatcherService webhookDispatcherService;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final SecureRandom secureRandom = new SecureRandom();

    public OAuthEngineService(
        OAuthStateRepository oauthStateRepository,
        ConnectedAccountRepository connectedAccountRepository,
        IntegrationRepository integrationRepository,
        OAuthProviderConfigRepository providerConfigRepository,
        ProjectRepository projectRepository,
        OrganizationMemberRepository memberRepository,
        CredentialVaultService credentialVaultService,
        AuditService auditService,
        WebhookDispatcherService webhookDispatcherService,
        ObjectMapper objectMapper
    ) {
        this.oauthStateRepository = oauthStateRepository;
        this.connectedAccountRepository = connectedAccountRepository;
        this.integrationRepository = integrationRepository;
        this.providerConfigRepository = providerConfigRepository;
        this.projectRepository = projectRepository;
        this.memberRepository = memberRepository;
        this.credentialVaultService = credentialVaultService;
        this.auditService = auditService;
        this.webhookDispatcherService = webhookDispatcherService;
        this.objectMapper = objectMapper;
        this.restClient = RestClient.create();
    }

    @Transactional
    public OAuthInitiateResponse initiateOAuthFlow(UUID projectId, InitiateOAuthRequest request) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        Integration integration = integrationRepository.findBySlug(request.integrationSlug().toLowerCase())
            .orElseThrow(() -> new ResourceNotFoundException("Integration not found: " + request.integrationSlug()));

        OAuthProviderConfig config = providerConfigRepository.findByProjectIdAndIntegrationId(projectId, integration.getId())
            .orElseThrow(() -> new BadRequestException("OAuth credentials are not configured for integration '" + integration.getName() + "'. Please configure Client ID and Secret in settings first."));

        // Generate cryptographically secure state token (32 bytes = 256 bits)
        byte[] stateBytes = new byte[32];
        secureRandom.nextBytes(stateBytes);
        String stateToken = Base64.getUrlEncoder().withoutPadding().encodeToString(stateBytes);

        // Generate PKCE code verifier and code challenge
        byte[] verifierBytes = new byte[32];
        secureRandom.nextBytes(verifierBytes);
        String codeVerifier = Base64.getUrlEncoder().withoutPadding().encodeToString(verifierBytes);
        String codeChallenge = generateCodeChallenge(codeVerifier);

        String redirectUri = StringUtils.hasText(request.redirectUri()) ? request.redirectUri().trim() : config.getRedirectUri();
        String scopes = StringUtils.hasText(config.getScopes()) ? config.getScopes() : integration.getDefaultScopes();

        Instant expiresAt = Instant.now().plus(10, ChronoUnit.MINUTES);

        OAuthState oauthState = new OAuthState(
            project,
            integration,
            request.projectUserId().trim(),
            stateToken,
            codeVerifier,
            redirectUri,
            expiresAt
        );
        oauthStateRepository.save(oauthState);

        // Build authorization URL
        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(integration.getAuthorizationUrl())
            .queryParam("client_id", config.getClientId())
            .queryParam("redirect_uri", redirectUri)
            .queryParam("response_type", "code")
            .queryParam("state", stateToken)
            .queryParam("code_challenge", codeChallenge)
            .queryParam("code_challenge_method", "S256");

        if (StringUtils.hasText(scopes)) {
            builder.queryParam("scope", scopes);
        }

        // Provider-specific parameters (e.g. Google offline refresh token)
        if (integration.getSlug().contains("google") || integration.getSlug().contains("gmail")) {
            builder.queryParam("access_type", "offline");
            builder.queryParam("prompt", "consent");
        }

        String authUrl = builder.build().toUriString();

        return new OAuthInitiateResponse(authUrl, stateToken, expiresAt);
    }

    @Transactional
    public ConnectedAccountResponse handleCallback(String stateToken, String code, String error) {
        OAuthState state = oauthStateRepository.findByStateToken(stateToken)
            .orElseThrow(() -> new BadRequestException("Invalid or unrecognized OAuth state parameter"));

        if (!state.isValid()) {
            throw new BadRequestException("OAuth authorization request has already been used or has expired");
        }

        // Mark as used immediately to prevent replay attacks
        state.setUsedAt(Instant.now());
        oauthStateRepository.save(state);

        if (StringUtils.hasText(error)) {
            throw new BadRequestException("Provider OAuth error: " + error);
        }

        if (!StringUtils.hasText(code)) {
            throw new BadRequestException("No authorization code received from provider");
        }

        Project project = state.getProject();
        Integration integration = state.getIntegration();

        OAuthProviderConfig config = providerConfigRepository.findByProjectIdAndIntegrationId(project.getId(), integration.getId())
            .orElseThrow(() -> new IllegalStateException("Provider configuration missing for state"));

        String clientSecret = credentialVaultService.decrypt(config.getClientSecretEncrypted());

        // Exchange code for tokens
        MultiValueMap<String, String> tokenParams = new LinkedMultiValueMap<>();
        tokenParams.add("grant_type", "authorization_code");
        tokenParams.add("code", code);
        tokenParams.add("client_id", config.getClientId());
        tokenParams.add("client_secret", clientSecret);
        tokenParams.add("redirect_uri", state.getRedirectUri());
        if (StringUtils.hasText(state.getCodeVerifier())) {
            tokenParams.add("code_verifier", state.getCodeVerifier());
        }

        JsonNode tokenResponseNode;
        try {
            tokenResponseNode = restClient.post()
                .uri(integration.getTokenUrl())
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .accept(MediaType.APPLICATION_JSON)
                .body(tokenParams)
                .retrieve()
                .body(JsonNode.class);
        } catch (Exception e) {
            log.error("Failed to exchange OAuth code for tokens with provider: {}", integration.getSlug(), e);
            throw new BadRequestException("Failed to exchange authorization code with provider: " + e.getMessage());
        }

        if (tokenResponseNode == null || !tokenResponseNode.has("access_token")) {
            throw new BadRequestException("Invalid token response from provider (missing access_token)");
        }

        String accessToken = tokenResponseNode.get("access_token").asText();
        String refreshToken = tokenResponseNode.has("refresh_token") ? tokenResponseNode.get("refresh_token").asText() : null;
        long expiresIn = tokenResponseNode.has("expires_in") ? tokenResponseNode.get("expires_in").asLong() : 3600;
        String grantedScope = tokenResponseNode.has("scope") ? tokenResponseNode.get("scope").asText() : config.getScopes();

        Instant tokenExpiresAt = Instant.now().plus(expiresIn, ChronoUnit.SECONDS);

        // Fetch User Info where available
        String accountEmail = null;
        String accountName = null;
        String providerAccountId = null;

        if (StringUtils.hasText(integration.getUserInfoUrl())) {
            try {
                JsonNode userNode = restClient.get()
                    .uri(integration.getUserInfoUrl())
                    .header("Authorization", "Bearer " + accessToken)
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .body(JsonNode.class);

                if (userNode != null) {
                    if (userNode.has("email")) accountEmail = userNode.get("email").asText();
                    if (userNode.has("name")) accountName = userNode.get("name").asText();
                    if (userNode.has("id")) providerAccountId = userNode.get("id").asText();
                    else if (userNode.has("sub")) providerAccountId = userNode.get("sub").asText();
                }
            } catch (Exception e) {
                log.warn("Could not retrieve user info from provider: {}", e.getMessage());
            }
        }

        // Encrypt tokens before persistence in Credential Vault
        String encryptedAccessToken = credentialVaultService.encrypt(accessToken);
        String encryptedRefreshToken = refreshToken != null ? credentialVaultService.encrypt(refreshToken) : null;

        // Upsert ConnectedAccount
        ConnectedAccount account = connectedAccountRepository
            .findByProjectIdAndIntegrationIdAndProjectUserId(project.getId(), integration.getId(), state.getProjectUserId())
            .orElseGet(() -> new ConnectedAccount(
                project,
                integration,
                state.getProjectUserId(),
                null,
                null,
                null,
                grantedScope,
                tokenExpiresAt
            ));

        account.setProviderAccountId(providerAccountId);
        if (accountEmail != null) account.setAccountEmail(accountEmail);
        if (accountName != null) account.setAccountName(accountName);
        account.setGrantedScopes(grantedScope);
        account.setTokenExpiresAt(tokenExpiresAt);
        account.setStatus(ConnectedAccountStatus.CONNECTED);
        account.setLastRefreshedAt(Instant.now());

        ConnectedAccount savedAccount = connectedAccountRepository.save(account);

        // Upsert EncryptedCredential
        EncryptedCredential credential = savedAccount.getCredential();
        if (credential == null) {
            credential = new EncryptedCredential(savedAccount, encryptedAccessToken, encryptedRefreshToken, 1);
            savedAccount.setCredential(credential);
        } else {
            credential.setAccessTokenEncrypted(encryptedAccessToken);
            if (encryptedRefreshToken != null) {
                credential.setRefreshTokenEncrypted(encryptedRefreshToken);
            }
        }
        connectedAccountRepository.save(savedAccount);

        auditService.record(
            null,
            project.getOrganization().getId(),
            "connected_account.authorized",
            "ConnectedAccount",
            savedAccount.getId(),
            "{\"integration\":\"" + integration.getSlug() + "\",\"projectUserId\":\"" + state.getProjectUserId() + "\"}"
        );

        ConnectedAccountResponse response = mapToResponse(savedAccount);
        webhookDispatcherService.dispatch(project.getId(), "connection.created", response);
        return response;
    }

    @Transactional(readOnly = true)
    public List<ConnectedAccountResponse> listConnectedAccounts(UUID projectId, UUID userId) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + projectId));

        validateMembership(project.getOrganization().getId(), userId);

        return connectedAccountRepository.findByProjectIdOrderByCreatedAtDesc(projectId).stream()
            .map(this::mapToResponse)
            .toList();
    }

    @Transactional
    public void disconnectAccount(UUID projectId, UUID accountId, UUID userId) {
        ConnectedAccount account = connectedAccountRepository.findByIdAndProjectId(accountId, projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Connected account not found"));

        validateMembership(account.getProject().getOrganization().getId(), userId);

        account.setStatus(ConnectedAccountStatus.REVOKED);
        account.setCredential(null);
        connectedAccountRepository.save(account);

        auditService.record(
            userId,
            account.getProject().getOrganization().getId(),
            "connected_account.disconnected",
            "ConnectedAccount",
            account.getId(),
            "{\"integration\":\"" + account.getIntegration().getSlug() + "\"}"
        );

        webhookDispatcherService.dispatch(account.getProject().getId(), "connection.revoked", mapToResponse(account));
    }

    private ConnectedAccountResponse mapToResponse(ConnectedAccount account) {
        return new ConnectedAccountResponse(
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
        );
    }

    private String generateCodeChallenge(String verifier) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(verifier.getBytes(StandardCharsets.US_ASCII));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 unavailable for PKCE", e);
        }
    }

    private void validateMembership(UUID organizationId, UUID userId) {
        if (!memberRepository.existsByOrganizationIdAndUserId(organizationId, userId)) {
            throw new ForbiddenException("You do not have access to this project");
        }
    }
}
