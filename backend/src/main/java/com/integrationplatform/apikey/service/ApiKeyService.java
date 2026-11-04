package com.integrationplatform.apikey.service;

import com.integrationplatform.apikey.dto.ApiKeyCreatedResponse;
import com.integrationplatform.apikey.dto.ApiKeyResponse;
import com.integrationplatform.apikey.dto.CreateApiKeyRequest;
import com.integrationplatform.apikey.model.ApiKey;
import com.integrationplatform.apikey.repository.ApiKeyRepository;
import com.integrationplatform.audit.service.AuditService;
import com.integrationplatform.common.exception.ForbiddenException;
import com.integrationplatform.common.exception.ResourceNotFoundException;
import com.integrationplatform.organization.repository.OrganizationMemberRepository;
import com.integrationplatform.project.model.Project;
import com.integrationplatform.project.repository.ProjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ApiKeyService {

    private final ApiKeyRepository apiKeyRepository;
    private final ProjectRepository projectRepository;
    private final OrganizationMemberRepository memberRepository;
    private final AuditService auditService;
    private final SecureRandom secureRandom = new SecureRandom();

    public ApiKeyService(
        ApiKeyRepository apiKeyRepository,
        ProjectRepository projectRepository,
        OrganizationMemberRepository memberRepository,
        AuditService auditService
    ) {
        this.apiKeyRepository = apiKeyRepository;
        this.projectRepository = projectRepository;
        this.memberRepository = memberRepository;
        this.auditService = auditService;
    }

    @Transactional
    public ApiKeyCreatedResponse createApiKey(UUID projectId, UUID userId, CreateApiKeyRequest request) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        // Tenant isolation: caller must be member of project's owning organization
        boolean isMember = memberRepository.existsByOrganizationIdAndUserId(project.getOrganization().getId(), userId);
        if (!isMember) {
            throw new ForbiddenException("You do not have permission to create API keys in this project");
        }

        // Generate prefix: ip_live_a1b2c3d4 or ip_test_a1b2c3d4 (16 chars)
        byte[] prefixBytes = new byte[4];
        secureRandom.nextBytes(prefixBytes);
        String envPrefix = "LIVE".equalsIgnoreCase(request.environment()) ? "ip_live_" : "ip_test_";
        String keyPrefix = envPrefix + HexFormat.of().formatHex(prefixBytes);

        // Generate random secret (32 bytes = 256 bits)
        byte[] secretBytes = new byte[32];
        secureRandom.nextBytes(secretBytes);
        String secret = Base64.getUrlEncoder().withoutPadding().encodeToString(secretBytes);

        // Full raw key to return once
        String rawKey = keyPrefix + "_" + secret;

        // Hash raw key with SHA-256
        String keyHash = hashKey(rawKey);

        ApiKey apiKey = new ApiKey(
            project,
            request.name().trim(),
            keyPrefix,
            keyHash,
            request.environment().toUpperCase(),
            request.expiresAt()
        );

        ApiKey saved = apiKeyRepository.save(apiKey);

        auditService.record(
            userId,
            project.getOrganization().getId(),
            "api_key.created",
            "ApiKey",
            saved.getId(),
            "{\"name\":\"" + saved.getName() + "\",\"environment\":\"" + saved.getEnvironment() + "\"}"
        );

        return new ApiKeyCreatedResponse(
            saved.getId(),
            project.getId(),
            saved.getName(),
            saved.getKeyPrefix(),
            rawKey,
            saved.getEnvironment(),
            saved.getExpiresAt(),
            saved.getCreatedAt()
        );
    }

    @Transactional(readOnly = true)
    public List<ApiKeyResponse> listApiKeys(UUID projectId, UUID userId) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        boolean isMember = memberRepository.existsByOrganizationIdAndUserId(project.getOrganization().getId(), userId);
        if (!isMember) {
            throw new ForbiddenException("You do not have access to this project's API keys");
        }

        return apiKeyRepository.findByProjectIdOrderByCreatedAtDesc(projectId).stream()
            .map(this::mapToResponse)
            .toList();
    }

    @Transactional
    public void revokeApiKey(UUID projectId, UUID apiKeyId, UUID userId) {
        ApiKey apiKey = apiKeyRepository.findByIdAndProjectId(apiKeyId, projectId)
            .orElseThrow(() -> new ResourceNotFoundException("API key not found"));

        boolean isMember = memberRepository.existsByOrganizationIdAndUserId(apiKey.getProject().getOrganization().getId(), userId);
        if (!isMember) {
            throw new ForbiddenException("You do not have permission to revoke this API key");
        }

        apiKey.setRevokedAt(Instant.now());
        apiKeyRepository.save(apiKey);

        auditService.record(
            userId,
            apiKey.getProject().getOrganization().getId(),
            "api_key.revoked",
            "ApiKey",
            apiKey.getId(),
            "{\"keyPrefix\":\"" + apiKey.getKeyPrefix() + "\"}"
        );
    }

    @Transactional
    public ApiKeyResponse toggleApiKey(UUID projectId, UUID apiKeyId, UUID userId, boolean enable) {
        ApiKey apiKey = apiKeyRepository.findByIdAndProjectId(apiKeyId, projectId)
            .orElseThrow(() -> new ResourceNotFoundException("API key not found"));

        boolean isMember = memberRepository.existsByOrganizationIdAndUserId(apiKey.getProject().getOrganization().getId(), userId);
        if (!isMember) {
            throw new ForbiddenException("You do not have permission to modify this API key");
        }

        if (enable) {
            apiKey.setRevokedAt(null);
        } else {
            apiKey.setRevokedAt(Instant.now());
        }
        ApiKey saved = apiKeyRepository.save(apiKey);

        auditService.record(
            userId,
            apiKey.getProject().getOrganization().getId(),
            enable ? "api_key.enabled" : "api_key.disabled",
            "ApiKey",
            apiKey.getId(),
            "{\"keyPrefix\":\"" + apiKey.getKeyPrefix() + "\"}"
        );

        return mapToResponse(saved);
    }

    @Transactional
    public void deleteApiKey(UUID projectId, UUID apiKeyId, UUID userId) {
        ApiKey apiKey = apiKeyRepository.findByIdAndProjectId(apiKeyId, projectId)
            .orElseThrow(() -> new ResourceNotFoundException("API key not found"));

        boolean isMember = memberRepository.existsByOrganizationIdAndUserId(apiKey.getProject().getOrganization().getId(), userId);
        if (!isMember) {
            throw new ForbiddenException("You do not have permission to delete this API key");
        }

        apiKeyRepository.delete(apiKey);

        auditService.record(
            userId,
            apiKey.getProject().getOrganization().getId(),
            "api_key.deleted",
            "ApiKey",
            apiKey.getId(),
            "{\"keyPrefix\":\"" + apiKey.getKeyPrefix() + "\"}"
        );
    }

    @Transactional(readOnly = true)
    public Optional<ApiKey> authenticate(String rawKey) {
        if (rawKey == null || rawKey.length() < 20) {
            return Optional.empty();
        }

        // Must start with ip_live_ or ip_test_
        if (!rawKey.startsWith("ip_live_") && !rawKey.startsWith("ip_test_")) {
            return Optional.empty();
        }

        int underscoreIdx = rawKey.indexOf('_', 8); // after prefix e.g. ip_live_12345678_...
        if (underscoreIdx < 0) {
            return Optional.empty();
        }

        String prefix = rawKey.substring(0, underscoreIdx);
        String targetHash = hashKey(rawKey);

        List<ApiKey> candidates = apiKeyRepository.findByKeyPrefixAndRevokedAtIsNull(prefix);

        for (ApiKey candidate : candidates) {
            if (candidate.isActive() && slowEquals(candidate.getKeyHash(), targetHash)) {
                return Optional.of(candidate);
            }
        }

        return Optional.empty();
    }

    private ApiKeyResponse mapToResponse(ApiKey key) {
        return new ApiKeyResponse(
            key.getId(),
            key.getProject().getId(),
            key.getName(),
            key.getKeyPrefix(),
            key.getEnvironment(),
            key.getExpiresAt(),
            key.getRevokedAt(),
            key.isActive(),
            key.getCreatedAt()
        );
    }

    private String hashKey(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm unavailable", e);
        }
    }

    private boolean slowEquals(String a, String b) {
        if (a == null || b == null) return false;
        return MessageDigest.isEqual(a.getBytes(StandardCharsets.UTF_8), b.getBytes(StandardCharsets.UTF_8));
    }
}
