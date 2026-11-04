package com.integrationplatform.oauth.controller;

import com.integrationplatform.common.security.SecurityContextHelper;
import com.integrationplatform.oauth.dto.ConnectedAccountResponse;
import com.integrationplatform.oauth.dto.InitiateOAuthRequest;
import com.integrationplatform.oauth.dto.OAuthInitiateResponse;
import com.integrationplatform.oauth.service.OAuthEngineService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@Tag(name = "OAuth Engine", description = "End-user OAuth lifecycle and connected accounts")
public class OAuthController {

    private final OAuthEngineService oauthEngineService;
    private final SecurityContextHelper securityContextHelper;

    public OAuthController(OAuthEngineService oauthEngineService, SecurityContextHelper securityContextHelper) {
        this.oauthEngineService = oauthEngineService;
        this.securityContextHelper = securityContextHelper;
    }

    @PostMapping("/projects/{projectId}/oauth/initiate")
    @Operation(summary = "Initiate an OAuth connection session for an end user")
    public ResponseEntity<OAuthInitiateResponse> initiateOAuth(
        @PathVariable UUID projectId,
        @Valid @RequestBody InitiateOAuthRequest request
    ) {
        // Can be called by dashboard user or by authenticated API key
        OAuthInitiateResponse response = oauthEngineService.initiateOAuthFlow(projectId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/oauth/callback")
    @Operation(summary = "OAuth callback endpoint invoked by the third-party provider after user authorization")
    public ResponseEntity<ConnectedAccountResponse> handleOAuthCallback(
        @RequestParam(name = "state") String state,
        @RequestParam(name = "code", required = false) String code,
        @RequestParam(name = "error", required = false) String error
    ) {
        ConnectedAccountResponse response = oauthEngineService.handleCallback(state, code, error);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/projects/{projectId}/connected-accounts")
    @Operation(summary = "List all external connected accounts for a project")
    public ResponseEntity<List<ConnectedAccountResponse>> listConnectedAccounts(@PathVariable UUID projectId) {
        UUID userId = securityContextHelper.getCurrentUserId();
        return ResponseEntity.ok(oauthEngineService.listConnectedAccounts(projectId, userId));
    }

    @PostMapping("/projects/{projectId}/connected-accounts/{accountId}/disconnect")
    @Operation(summary = "Disconnect and revoke a connected account")
    public ResponseEntity<Void> disconnectAccount(
        @PathVariable UUID projectId,
        @PathVariable UUID accountId
    ) {
        UUID userId = securityContextHelper.getCurrentUserId();
        oauthEngineService.disconnectAccount(projectId, accountId, userId);
        return ResponseEntity.noContent().build();
    }
}
