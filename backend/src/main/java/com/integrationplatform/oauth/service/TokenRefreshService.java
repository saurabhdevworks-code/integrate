package com.integrationplatform.oauth.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.integrationplatform.integration.model.OAuthProviderConfig;
import com.integrationplatform.integration.repository.OAuthProviderConfigRepository;
import com.integrationplatform.oauth.model.ConnectedAccount;
import com.integrationplatform.oauth.model.ConnectedAccountStatus;
import com.integrationplatform.oauth.model.EncryptedCredential;
import com.integrationplatform.oauth.repository.ConnectedAccountRepository;
import com.integrationplatform.vault.service.CredentialVaultService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
public class TokenRefreshService {

    private static final Logger log = LoggerFactory.getLogger(TokenRefreshService.class);

    private final ConnectedAccountRepository connectedAccountRepository;
    private final OAuthProviderConfigRepository providerConfigRepository;
    private final CredentialVaultService credentialVaultService;
    private final RestClient restClient;

    public TokenRefreshService(
        ConnectedAccountRepository connectedAccountRepository,
        OAuthProviderConfigRepository providerConfigRepository,
        CredentialVaultService credentialVaultService
    ) {
        this.connectedAccountRepository = connectedAccountRepository;
        this.providerConfigRepository = providerConfigRepository;
        this.credentialVaultService = credentialVaultService;
        this.restClient = RestClient.create();
    }

    /**
     * Checks if the access token needs refresh (expired or within 5 minutes of expiring).
     * Returns the valid decrypted access token (refreshing if necessary).
     */
    @Transactional
    public String getOrRefreshToken(ConnectedAccount account) {
        EncryptedCredential credential = account.getCredential();
        if (credential == null || !StringUtils.hasText(credential.getAccessTokenEncrypted())) {
            throw new IllegalStateException("Connected account has no stored credentials");
        }

        boolean isExpiredOrNear = account.getTokenExpiresAt() != null &&
            account.getTokenExpiresAt().isBefore(Instant.now().plus(5, ChronoUnit.MINUTES));

        if (!isExpiredOrNear || !StringUtils.hasText(credential.getRefreshTokenEncrypted())) {
            // Token is still valid or no refresh token is available
            return credentialVaultService.decrypt(credential.getAccessTokenEncrypted());
        }

        log.info("Token for account {} near expiry; attempting refresh with provider {}", account.getId(), account.getIntegration().getSlug());

        try {
            UUID projectId = account.getProject().getId();
            UUID integrationId = account.getIntegration().getId();

            OAuthProviderConfig config = providerConfigRepository.findByProjectIdAndIntegrationId(projectId, integrationId)
                .orElseThrow(() -> new IllegalStateException("OAuth provider config not found for refresh"));

            String clientSecret = credentialVaultService.decrypt(config.getClientSecretEncrypted());
            String refreshToken = credentialVaultService.decrypt(credential.getRefreshTokenEncrypted());

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("grant_type", "refresh_token");
            body.add("refresh_token", refreshToken);
            body.add("client_id", config.getClientId());
            body.add("client_secret", clientSecret);

            JsonNode tokenResponse = restClient.post()
                .uri(account.getIntegration().getTokenUrl())
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .accept(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(JsonNode.class);

            if (tokenResponse != null && tokenResponse.has("access_token")) {
                String newAccessToken = tokenResponse.get("access_token").asText();
                long expiresIn = tokenResponse.has("expires_in") ? tokenResponse.get("expires_in").asLong() : 3600;

                // Update encrypted access token in Credential Vault
                credential.setAccessTokenEncrypted(credentialVaultService.encrypt(newAccessToken));

                // If provider issued a rotated refresh token, update it as well
                if (tokenResponse.has("refresh_token")) {
                    credential.setRefreshTokenEncrypted(credentialVaultService.encrypt(tokenResponse.get("refresh_token").asText()));
                }

                account.setTokenExpiresAt(Instant.now().plus(expiresIn, ChronoUnit.SECONDS));
                account.setLastRefreshedAt(Instant.now());
                account.setStatus(ConnectedAccountStatus.CONNECTED);

                connectedAccountRepository.save(account);
                log.info("Successfully refreshed OAuth access token for account: {}", account.getId());

                return newAccessToken;
            }
        } catch (Exception e) {
            log.error("Failed to refresh OAuth token for account: {}", account.getId(), e);
            account.setStatus(ConnectedAccountStatus.EXPIRED);
            connectedAccountRepository.save(account);
        }

        // Fallback: return current token and let provider error trigger re-auth
        return credentialVaultService.decrypt(credential.getAccessTokenEncrypted());
    }
}
