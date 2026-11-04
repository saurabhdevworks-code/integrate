package com.integrationplatform.apikey.controller;

import com.integrationplatform.apikey.dto.ApiKeyCreatedResponse;
import com.integrationplatform.apikey.dto.ApiKeyResponse;
import com.integrationplatform.apikey.dto.CreateApiKeyRequest;
import com.integrationplatform.apikey.service.ApiKeyService;
import com.integrationplatform.common.security.SecurityContextHelper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/projects/{projectId}/api-keys")
@Tag(name = "API Keys", description = "Project-scoped API key generation, rotation, and revocation")
public class ApiKeyController {

    private final ApiKeyService apiKeyService;
    private final SecurityContextHelper securityContextHelper;

    public ApiKeyController(ApiKeyService apiKeyService, SecurityContextHelper securityContextHelper) {
        this.apiKeyService = apiKeyService;
        this.securityContextHelper = securityContextHelper;
    }

    @PostMapping
    @Operation(summary = "Generate a project-scoped API key (raw secret displayed ONLY ONCE)")
    public ResponseEntity<ApiKeyCreatedResponse> createApiKey(
        @PathVariable UUID projectId,
        @Valid @RequestBody CreateApiKeyRequest request
    ) {
        UUID userId = securityContextHelper.getCurrentUserId();
        ApiKeyCreatedResponse response = apiKeyService.createApiKey(projectId, userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(summary = "List all API keys for a project (metadata only, no secrets)")
    public ResponseEntity<List<ApiKeyResponse>> listApiKeys(@PathVariable UUID projectId) {
        UUID userId = securityContextHelper.getCurrentUserId();
        return ResponseEntity.ok(apiKeyService.listApiKeys(projectId, userId));
    }

    @PostMapping("/{apiKeyId}/revoke")
    @Operation(summary = "Revoke an API key immediately")
    public ResponseEntity<Void> revokeApiKey(
        @PathVariable UUID projectId,
        @PathVariable UUID apiKeyId
    ) {
        UUID userId = securityContextHelper.getCurrentUserId();
        apiKeyService.revokeApiKey(projectId, apiKeyId, userId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{apiKeyId}/toggle")
    @Operation(summary = "Enable or disable an API key")
    public ResponseEntity<ApiKeyResponse> toggleApiKey(
        @PathVariable UUID projectId,
        @PathVariable UUID apiKeyId,
        @RequestParam(defaultValue = "true") boolean enable
    ) {
        UUID userId = securityContextHelper.getCurrentUserId();
        return ResponseEntity.ok(apiKeyService.toggleApiKey(projectId, apiKeyId, userId, enable));
    }

    @DeleteMapping("/{apiKeyId}")
    @Operation(summary = "Permanently delete an API key")
    public ResponseEntity<Void> deleteApiKey(
        @PathVariable UUID projectId,
        @PathVariable UUID apiKeyId
    ) {
        UUID userId = securityContextHelper.getCurrentUserId();
        apiKeyService.deleteApiKey(projectId, apiKeyId, userId);
        return ResponseEntity.noContent().build();
    }
}
