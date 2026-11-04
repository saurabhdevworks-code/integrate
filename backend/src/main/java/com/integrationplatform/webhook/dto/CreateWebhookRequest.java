package com.integrationplatform.webhook.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

public record CreateWebhookRequest(
    @NotBlank(message = "Webhook URL is required")
    @Size(max = 500, message = "URL cannot exceed 500 characters")
    String url,

    List<String> events
) {}
