package com.integrationplatform.webhook.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.integrationplatform.common.exception.ResourceNotFoundException;
import com.integrationplatform.project.model.Project;
import com.integrationplatform.project.repository.ProjectRepository;
import com.integrationplatform.webhook.dto.*;
import com.integrationplatform.webhook.model.*;
import com.integrationplatform.webhook.repository.WebhookDeliveryRepository;
import com.integrationplatform.webhook.repository.WebhookRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class WebhookDispatcherService {

    private static final Logger log = LoggerFactory.getLogger(WebhookDispatcherService.class);
    private static final SecureRandom secureRandom = new SecureRandom();

    private final WebhookRepository webhookRepository;
    private final WebhookDeliveryRepository deliveryRepository;
    private final ProjectRepository projectRepository;
    private final WebhookSignatureService signatureService;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public WebhookDispatcherService(
        WebhookRepository webhookRepository,
        WebhookDeliveryRepository deliveryRepository,
        ProjectRepository projectRepository,
        WebhookSignatureService signatureService,
        ObjectMapper objectMapper
    ) {
        this.webhookRepository = webhookRepository;
        this.deliveryRepository = deliveryRepository;
        this.projectRepository = projectRepository;
        this.signatureService = signatureService;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();
    }

    @Transactional
    public WebhookResponse createWebhook(UUID projectId, CreateWebhookRequest request) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + projectId));

        byte[] secretBytes = new byte[24];
        secureRandom.nextBytes(secretBytes);
        String secret = "whsec_" + HexFormat.of().formatHex(secretBytes);

        String eventsStr = (request.events() == null || request.events().isEmpty())
            ? "*"
            : String.join(",", request.events());

        Webhook webhook = new Webhook(project, request.url().trim(), secret, eventsStr);
        Webhook saved = webhookRepository.save(webhook);

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<WebhookResponse> listWebhooks(UUID projectId) {
        return webhookRepository.findByProjectId(projectId).stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public WebhookResponse getWebhook(UUID webhookId, UUID projectId) {
        Webhook webhook = webhookRepository.findByIdAndProjectId(webhookId, projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Webhook not found: " + webhookId));
        return toResponse(webhook);
    }

    @Transactional
    public void deleteWebhook(UUID webhookId, UUID projectId) {
        Webhook webhook = webhookRepository.findByIdAndProjectId(webhookId, projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Webhook not found: " + webhookId));
        webhookRepository.delete(webhook);
    }

    @Transactional(readOnly = true)
    public List<WebhookDeliveryResponse> listDeliveries(UUID webhookId, UUID projectId) {
        Webhook webhook = webhookRepository.findByIdAndProjectId(webhookId, projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Webhook not found: " + webhookId));
        return deliveryRepository.findByWebhookIdOrderByCreatedAtDesc(webhook.getId()).stream()
            .map(this::toDeliveryResponse)
            .collect(Collectors.toList());
    }

    /**
     * Dispatches an event to all matching registered active webhooks.
     */
    @Async
    public void dispatch(UUID projectId, String eventType, Object data) {
        try {
            List<Webhook> activeWebhooks = webhookRepository.findByProjectIdAndIsActiveTrue(projectId);
            if (activeWebhooks.isEmpty()) {
                return;
            }

            Instant now = Instant.now();
            WebhookPayload payloadObj = new WebhookPayload(UUID.randomUUID(), eventType, now, data);
            String payloadJson = objectMapper.writeValueAsString(payloadObj);

            for (Webhook webhook : activeWebhooks) {
                if (matchesEvent(webhook.getEvents(), eventType)) {
                    deliverToWebhook(webhook, eventType, payloadJson, now.getEpochSecond());
                }
            }
        } catch (Exception e) {
            log.error("Failed to dispatch webhook event: {}", eventType, e);
        }
    }

    public WebhookDeliveryResponse testWebhook(UUID webhookId, UUID projectId) {
        Webhook webhook = webhookRepository.findByIdAndProjectId(webhookId, projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Webhook not found: " + webhookId));

        Map<String, Object> testData = Map.of(
            "message", "This is a test webhook event from Integration Platform",
            "projectId", projectId.toString(),
            "webhookId", webhookId.toString()
        );

        Instant now = Instant.now();
        WebhookPayload payloadObj = new WebhookPayload(UUID.randomUUID(), "ping", now, testData);
        try {
            String payloadJson = objectMapper.writeValueAsString(payloadObj);
            WebhookDelivery delivery = deliverToWebhook(webhook, "ping", payloadJson, now.getEpochSecond());
            return toDeliveryResponse(delivery);
        } catch (Exception e) {
            throw new RuntimeException("Failed to test webhook delivery: " + e.getMessage(), e);
        }
    }

    private WebhookDelivery deliverToWebhook(Webhook webhook, String eventType, String payloadJson, long timestamp) {
        WebhookDelivery delivery = new WebhookDelivery(webhook, webhook.getProject(), eventType, payloadJson);
        String signatureHeader = signatureService.generateHeader(webhook.getSecret(), timestamp, payloadJson);

        try {
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(webhook.getUrl()))
                .timeout(Duration.ofSeconds(6))
                .header("Content-Type", "application/json")
                .header("User-Agent", "IntegrationPlatform-Webhook-Dispatcher/1.0")
                .header("X-IntegrationPlatform-Event", eventType)
                .header("X-IntegrationPlatform-Signature", signatureHeader)
                .header("X-IntegrationPlatform-Timestamp", String.valueOf(timestamp))
                .POST(HttpRequest.BodyPublishers.ofString(payloadJson))
                .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            delivery.setHttpStatusCode(response.statusCode());
            String bodySnippet = response.body();
            if (bodySnippet != null && bodySnippet.length() > 500) {
                bodySnippet = bodySnippet.substring(0, 500) + "...";
            }
            delivery.setResponseBody(bodySnippet);

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                delivery.setStatus(WebhookDeliveryStatus.SUCCESS);
                delivery.setDeliveredAt(Instant.now());
            } else {
                delivery.setStatus(WebhookDeliveryStatus.FAILED);
            }
        } catch (Exception ex) {
            log.warn("Webhook delivery attempt failed for url {}: {}", webhook.getUrl(), ex.getMessage());
            delivery.setStatus(WebhookDeliveryStatus.FAILED);
            delivery.setResponseBody("Connection error: " + ex.getMessage());
        }

        return deliveryRepository.save(delivery);
    }

    private boolean matchesEvent(String subscribedEvents, String eventType) {
        if (subscribedEvents == null || subscribedEvents.isBlank() || subscribedEvents.equals("*")) {
            return true;
        }
        for (String ev : subscribedEvents.split(",")) {
            if (ev.trim().equalsIgnoreCase(eventType) || ev.trim().equals("*")) {
                return true;
            }
        }
        return false;
    }

    private WebhookResponse toResponse(Webhook w) {
        List<String> eventList = (w.getEvents() != null && !w.getEvents().isBlank())
            ? Arrays.stream(w.getEvents().split(",")).map(String::trim).collect(Collectors.toList())
            : List.of("*");

        return new WebhookResponse(
            w.getId(),
            w.getProject().getId(),
            w.getUrl(),
            w.getSecret(),
            eventList,
            w.isActive(),
            w.getCreatedAt(),
            w.getUpdatedAt()
        );
    }

    private WebhookDeliveryResponse toDeliveryResponse(WebhookDelivery d) {
        return new WebhookDeliveryResponse(
            d.getId(),
            d.getWebhook().getId(),
            d.getProject().getId(),
            d.getEventType(),
            d.getPayload(),
            d.getStatus(),
            d.getHttpStatusCode(),
            d.getResponseBody(),
            d.getAttemptCount(),
            d.getNextRetryAt(),
            d.getCreatedAt(),
            d.getDeliveredAt()
        );
    }
}
