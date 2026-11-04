package com.integrationplatform.integration.controller;

import com.integrationplatform.common.security.SecurityContextHelper;
import com.integrationplatform.integration.dto.ConfigureProviderRequest;
import com.integrationplatform.integration.dto.IntegrationResponse;
import com.integrationplatform.integration.dto.ProviderConfigResponse;
import com.integrationplatform.integration.service.IntegrationRegistryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/projects/{projectId}/integrations")
@Tag(name = "Integrations", description = "Integration marketplace and provider configuration")
public class IntegrationController {

    private final IntegrationRegistryService integrationRegistryService;
    private final SecurityContextHelper securityContextHelper;

    public IntegrationController(IntegrationRegistryService integrationRegistryService, SecurityContextHelper securityContextHelper) {
        this.integrationRegistryService = integrationRegistryService;
        this.securityContextHelper = securityContextHelper;
    }

    @GetMapping
    @Operation(summary = "List all supported integrations with project-specific configuration status")
    public ResponseEntity<List<IntegrationResponse>> listIntegrations(@PathVariable UUID projectId) {
        UUID userId = securityContextHelper.getCurrentUserId();
        return ResponseEntity.ok(integrationRegistryService.listIntegrationsForProject(projectId, userId));
    }

    @PostMapping("/{slug}/configure")
    @Operation(summary = "Configure OAuth Client ID and Secret (BYO credentials) for an integration")
    public ResponseEntity<ProviderConfigResponse> configureProvider(
        @PathVariable UUID projectId,
        @PathVariable String slug,
        @Valid @RequestBody ConfigureProviderRequest request
    ) {
        UUID userId = securityContextHelper.getCurrentUserId();
        ProviderConfigResponse response = integrationRegistryService.configureProvider(projectId, slug, userId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{slug}/config")
    @Operation(summary = "Get configured OAuth client details (secrets are redacted)")
    public ResponseEntity<ProviderConfigResponse> getProviderConfig(
        @PathVariable UUID projectId,
        @PathVariable String slug
    ) {
        UUID userId = securityContextHelper.getCurrentUserId();
        return ResponseEntity.ok(integrationRegistryService.getProviderConfig(projectId, slug, userId));
    }

    @PostMapping("/{slug}/toggle")
    @Operation(summary = "Toggle enable/disable status for an integration")
    public ResponseEntity<java.util.Map<String, Boolean>> toggleIntegration(
        @PathVariable UUID projectId,
        @PathVariable String slug
    ) {
        UUID userId = securityContextHelper.getCurrentUserId();
        boolean enabled = integrationRegistryService.toggleIntegration(projectId, slug, userId);
        return ResponseEntity.ok(java.util.Map.of("enabled", enabled));
    }
}
