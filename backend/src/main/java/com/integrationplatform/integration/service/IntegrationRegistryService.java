package com.integrationplatform.integration.service;

import com.integrationplatform.audit.service.AuditService;
import com.integrationplatform.common.exception.ForbiddenException;
import com.integrationplatform.common.exception.ResourceNotFoundException;
import com.integrationplatform.integration.dto.ConfigureProviderRequest;
import com.integrationplatform.integration.dto.IntegrationResponse;
import com.integrationplatform.integration.dto.ProviderConfigResponse;
import com.integrationplatform.integration.model.Integration;
import com.integrationplatform.integration.model.OAuthProviderConfig;
import com.integrationplatform.integration.model.ProjectIntegration;
import com.integrationplatform.integration.repository.IntegrationRepository;
import com.integrationplatform.integration.repository.OAuthProviderConfigRepository;
import com.integrationplatform.integration.repository.ProjectIntegrationRepository;
import com.integrationplatform.organization.repository.OrganizationMemberRepository;
import com.integrationplatform.project.model.Project;
import com.integrationplatform.project.repository.ProjectRepository;
import com.integrationplatform.vault.service.CredentialVaultService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class IntegrationRegistryService {

    private final IntegrationRepository integrationRepository;
    private final ProjectIntegrationRepository projectIntegrationRepository;
    private final OAuthProviderConfigRepository providerConfigRepository;
    private final ProjectRepository projectRepository;
    private final OrganizationMemberRepository memberRepository;
    private final CredentialVaultService credentialVaultService;
    private final AuditService auditService;

    public IntegrationRegistryService(
        IntegrationRepository integrationRepository,
        ProjectIntegrationRepository projectIntegrationRepository,
        OAuthProviderConfigRepository providerConfigRepository,
        ProjectRepository projectRepository,
        OrganizationMemberRepository memberRepository,
        CredentialVaultService credentialVaultService,
        AuditService auditService
    ) {
        this.integrationRepository = integrationRepository;
        this.projectIntegrationRepository = projectIntegrationRepository;
        this.providerConfigRepository = providerConfigRepository;
        this.projectRepository = projectRepository;
        this.memberRepository = memberRepository;
        this.credentialVaultService = credentialVaultService;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public List<IntegrationResponse> listIntegrationsForProject(UUID projectId, UUID userId) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        validateMembership(project.getOrganization().getId(), userId);

        List<Integration> allIntegrations = integrationRepository.findAll();
        Map<UUID, ProjectIntegration> enabledMap = projectIntegrationRepository.findByProjectId(projectId).stream()
            .collect(Collectors.toMap(pi -> pi.getIntegration().getId(), Function.identity()));

        return allIntegrations.stream().map(integration -> {
            boolean enabled = enabledMap.containsKey(integration.getId()) ? enabledMap.get(integration.getId()).isEnabled() : true;
            boolean configured = providerConfigRepository.findByProjectIdAndIntegrationId(projectId, integration.getId()).isPresent();

            return new IntegrationResponse(
                integration.getId(),
                integration.getSlug(),
                integration.getName(),
                integration.getCategory(),
                integration.getAuthType(),
                integration.getDefaultScopes(),
                integration.getIconUrl(),
                integration.getDocumentationUrl(),
                enabled,
                configured
            );
        }).toList();
    }

    @Transactional
    public ProviderConfigResponse configureProvider(UUID projectId, String slug, UUID userId, ConfigureProviderRequest request) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        validateMembership(project.getOrganization().getId(), userId);

        Integration integration = integrationRepository.findBySlug(slug.toLowerCase())
            .orElseThrow(() -> new ResourceNotFoundException("Integration not found with slug: " + slug));

        // Encrypt the provider client secret with the Credential Vault
        String encryptedSecret = credentialVaultService.encrypt(request.clientSecret());

        OAuthProviderConfig config = providerConfigRepository.findByProjectIdAndIntegrationId(projectId, integration.getId())
            .orElseGet(() -> new OAuthProviderConfig(
                project,
                integration,
                request.clientId().trim(),
                encryptedSecret,
                request.redirectUri().trim(),
                request.scopes()
            ));

        config.setClientId(request.clientId().trim());
        config.setClientSecretEncrypted(encryptedSecret);
        config.setRedirectUri(request.redirectUri().trim());
        if (request.scopes() != null) {
            config.setScopes(request.scopes().trim());
        }

        OAuthProviderConfig saved = providerConfigRepository.save(config);

        auditService.record(
            userId,
            project.getOrganization().getId(),
            "oauth.provider_configured",
            "OAuthProviderConfig",
            saved.getId(),
            "{\"integration\":\"" + integration.getSlug() + "\",\"clientId\":\"" + saved.getClientId() + "\"}"
        );

        return new ProviderConfigResponse(
            saved.getId(),
            project.getId(),
            integration.getSlug(),
            saved.getClientId(),
            saved.getRedirectUri(),
            saved.getScopes(),
            true
        );
    }

    @Transactional(readOnly = true)
    public ProviderConfigResponse getProviderConfig(UUID projectId, String slug, UUID userId) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        validateMembership(project.getOrganization().getId(), userId);

        Integration integration = integrationRepository.findBySlug(slug.toLowerCase())
            .orElseThrow(() -> new ResourceNotFoundException("Integration not found with slug: " + slug));

        return providerConfigRepository.findByProjectIdAndIntegrationId(projectId, integration.getId())
            .map(c -> new ProviderConfigResponse(
                c.getId(),
                projectId,
                slug,
                c.getClientId(),
                c.getRedirectUri(),
                c.getScopes(),
                true
            ))
            .orElseGet(() -> new ProviderConfigResponse(
                null,
                projectId,
                slug,
                null,
                null,
                integration.getDefaultScopes(),
                false
            ));
    }

    @Transactional
    public boolean toggleIntegration(UUID projectId, String slug, UUID userId) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        validateMembership(project.getOrganization().getId(), userId);

        Integration integration = integrationRepository.findBySlug(slug.toLowerCase())
            .orElseThrow(() -> new ResourceNotFoundException("Integration not found with slug: " + slug));

        ProjectIntegration pi = projectIntegrationRepository.findByProjectIdAndIntegrationId(projectId, integration.getId())
            .orElseGet(() -> new ProjectIntegration(project, integration, false));

        pi.setEnabled(!pi.isEnabled());
        projectIntegrationRepository.save(pi);
        return pi.isEnabled();
    }

    private void validateMembership(UUID organizationId, UUID userId) {
        if (!memberRepository.existsByOrganizationIdAndUserId(organizationId, userId)) {
            throw new ForbiddenException("You do not have access to this project");
        }
    }
}
