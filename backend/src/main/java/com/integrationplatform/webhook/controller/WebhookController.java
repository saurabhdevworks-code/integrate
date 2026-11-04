package com.integrationplatform.webhook.controller;

import com.integrationplatform.project.service.ProjectService;
import com.integrationplatform.webhook.dto.*;
import com.integrationplatform.webhook.service.WebhookDispatcherService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/projects/{projectId}/webhooks")
@Tag(name = "Webhooks", description = "Endpoints for managing event subscriptions and webhook deliveries")
public class WebhookController {

    private final WebhookDispatcherService webhookDispatcherService;
    private final ProjectService projectService;

    public WebhookController(
        WebhookDispatcherService webhookDispatcherService,
        ProjectService projectService
    ) {
        this.webhookDispatcherService = webhookDispatcherService;
        this.projectService = projectService;
    }

    @PostMapping
    @Operation(summary = "Register a new webhook endpoint for a project")
    public ResponseEntity<WebhookResponse> createWebhook(
        @PathVariable UUID projectId,
        @Valid @RequestBody CreateWebhookRequest request
    ) {
        projectService.validateProjectAccess(projectId);
        return ResponseEntity.ok(webhookDispatcherService.createWebhook(projectId, request));
    }

    @GetMapping
    @Operation(summary = "List all webhooks configured for a project")
    public ResponseEntity<List<WebhookResponse>> listWebhooks(@PathVariable UUID projectId) {
        projectService.validateProjectAccess(projectId);
        return ResponseEntity.ok(webhookDispatcherService.listWebhooks(projectId));
    }

    @GetMapping("/{webhookId}")
    @Operation(summary = "Get webhook details")
    public ResponseEntity<WebhookResponse> getWebhook(
        @PathVariable UUID projectId,
        @PathVariable UUID webhookId
    ) {
        projectService.validateProjectAccess(projectId);
        return ResponseEntity.ok(webhookDispatcherService.getWebhook(webhookId, projectId));
    }

    @DeleteMapping("/{webhookId}")
    @Operation(summary = "Delete a webhook")
    public ResponseEntity<Void> deleteWebhook(
        @PathVariable UUID projectId,
        @PathVariable UUID webhookId
    ) {
        projectService.validateProjectAccess(projectId);
        webhookDispatcherService.deleteWebhook(webhookId, projectId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{webhookId}/deliveries")
    @Operation(summary = "List delivery attempts and responses for a webhook")
    public ResponseEntity<List<WebhookDeliveryResponse>> listDeliveries(
        @PathVariable UUID projectId,
        @PathVariable UUID webhookId
    ) {
        projectService.validateProjectAccess(projectId);
        return ResponseEntity.ok(webhookDispatcherService.listDeliveries(webhookId, projectId));
    }

    @PostMapping("/{webhookId}/test")
    @Operation(summary = "Send a test ping event to verify the webhook receiver endpoint")
    public ResponseEntity<WebhookDeliveryResponse> testWebhook(
        @PathVariable UUID projectId,
        @PathVariable UUID webhookId
    ) {
        projectService.validateProjectAccess(projectId);
        return ResponseEntity.ok(webhookDispatcherService.testWebhook(webhookId, projectId));
    }
}
