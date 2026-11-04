package com.integrationplatform.apikey;

import com.integrationplatform.apikey.dto.ApiKeyCreatedResponse;
import com.integrationplatform.apikey.dto.ApiKeyResponse;
import com.integrationplatform.apikey.dto.CreateApiKeyRequest;
import com.integrationplatform.apikey.model.ApiKey;
import com.integrationplatform.apikey.repository.ApiKeyRepository;
import com.integrationplatform.apikey.service.ApiKeyService;
import com.integrationplatform.audit.service.AuditService;
import com.integrationplatform.auth.model.User;
import com.integrationplatform.common.exception.ForbiddenException;
import com.integrationplatform.organization.model.Organization;
import com.integrationplatform.organization.repository.OrganizationMemberRepository;
import com.integrationplatform.project.model.Project;
import com.integrationplatform.project.repository.ProjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ApiKeyServiceTest {

    @Mock
    private ApiKeyRepository apiKeyRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private OrganizationMemberRepository memberRepository;

    @Mock
    private AuditService auditService;

    private ApiKeyService apiKeyService;

    private UUID userId;
    private UUID orgId;
    private UUID projectId;
    private Organization organization;
    private Project project;

    @BeforeEach
    void setUp() {
        apiKeyService = new ApiKeyService(apiKeyRepository, projectRepository, memberRepository, auditService);

        userId = UUID.randomUUID();
        orgId = UUID.randomUUID();
        projectId = UUID.randomUUID();

        organization = new Organization("Acme Corp", "acme-corp");
        organization.setId(orgId);

        project = new Project(organization, "Production App", "prod-app");
        project.setId(projectId);
    }

    @Test
    void testCreateApiKey_Success_GeneratesRawKeyAndHashesAtRest() {
        when(projectRepository.findById(projectId)).thenReturn(Optional.of(project));
        when(memberRepository.existsByOrganizationIdAndUserId(orgId, userId)).thenReturn(true);
        when(apiKeyRepository.save(any(ApiKey.class))).thenAnswer(invocation -> {
            ApiKey toSave = invocation.getArgument(0);
            toSave.setId(UUID.randomUUID());
            return toSave;
        });

        CreateApiKeyRequest request = new CreateApiKeyRequest("Backend Server Key", "LIVE", null);
        ApiKeyCreatedResponse response = apiKeyService.createApiKey(projectId, userId, request);

        assertNotNull(response);
        assertNotNull(response.rawKey());
        assertTrue(response.rawKey().startsWith("ip_live_"), "Key must start with ip_live_");
        assertEquals("LIVE", response.environment());
        assertEquals("Backend Server Key", response.name());

        // Verify save received hashed key and prefix, never plain secret alone
        verify(apiKeyRepository).save(argThat(apiKey ->
            apiKey.getKeyPrefix().startsWith("ip_live_") &&
            apiKey.getKeyHash() != null &&
            apiKey.getKeyHash().length() == 64 // SHA-256 hex string length
        ));
    }

    @Test
    void testCreateApiKey_DeniedForNonMember() {
        when(projectRepository.findById(projectId)).thenReturn(Optional.of(project));
        when(memberRepository.existsByOrganizationIdAndUserId(orgId, userId)).thenReturn(false);

        CreateApiKeyRequest request = new CreateApiKeyRequest("Hacker Key", "LIVE", null);

        assertThrows(ForbiddenException.class, () -> apiKeyService.createApiKey(projectId, userId, request));
        verify(apiKeyRepository, never()).save(any());
    }

    @Test
    void testRevokeApiKey_SetsRevokedAt() {
        ApiKey apiKey = new ApiKey(project, "Old Key", "ip_live_12345678", "hash", "LIVE", null);
        apiKey.setId(UUID.randomUUID());

        when(apiKeyRepository.findByIdAndProjectId(apiKey.getId(), projectId)).thenReturn(Optional.of(apiKey));
        when(memberRepository.existsByOrganizationIdAndUserId(orgId, userId)).thenReturn(true);

        apiKeyService.revokeApiKey(projectId, apiKey.getId(), userId);

        assertNotNull(apiKey.getRevokedAt());
        assertFalse(apiKey.isActive());
        verify(apiKeyRepository).save(apiKey);
    }
}
