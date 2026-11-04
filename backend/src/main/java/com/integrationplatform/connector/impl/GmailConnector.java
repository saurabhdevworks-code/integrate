package com.integrationplatform.connector.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.integrationplatform.common.exception.BadRequestException;
import com.integrationplatform.connector.IntegrationConnector;
import com.integrationplatform.connector.ToolExecutionContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Component
public class GmailConnector implements IntegrationConnector {

    private static final Logger log = LoggerFactory.getLogger(GmailConnector.class);
    private static final String BASE_URL = "https://gmail.googleapis.com/gmail/v1/users/me";

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public GmailConnector(ObjectMapper objectMapper) {
        this.restClient = RestClient.create();
        this.objectMapper = objectMapper;
    }

    @Override
    public String getIntegrationSlug() {
        return "gmail";
    }

    @Override
    public boolean supportsTool(String toolName) {
        return toolName != null && toolName.startsWith("gmail.");
    }

    @Override
    public JsonNode execute(String toolName, JsonNode input, ToolExecutionContext context) {
        String token = context.decryptedAccessToken();

        try {
            return switch (toolName) {
                case "gmail.search_emails" -> searchEmails(input, token);
                case "gmail.get_email" -> getEmail(input, token);
                case "gmail.create_draft" -> createDraft(input, token);
                case "gmail.send_email" -> sendEmail(input, token);
                case "gmail.list_labels" -> listLabels(token);
                default -> throw new BadRequestException("Unsupported Gmail tool: " + toolName);
            };
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            log.error("Gmail API call failed for tool: {}", toolName, e);
            throw new BadRequestException("Gmail API call failed: " + e.getMessage());
        }
    }

    private JsonNode searchEmails(JsonNode input, String token) {
        String query = input.has("query") ? input.get("query").asText() : "";
        int maxResults = input.has("maxResults") ? input.get("maxResults").asInt(10) : 10;

        JsonNode response = restClient.get()
            .uri(BASE_URL + "/messages?q={query}&maxResults={maxResults}", query, maxResults)
            .header("Authorization", "Bearer " + token)
            .accept(MediaType.APPLICATION_JSON)
            .retrieve()
            .body(JsonNode.class);

        ObjectNode result = objectMapper.createObjectNode();
        ArrayNode messages = objectMapper.createArrayNode();

        if (response != null && response.has("messages")) {
            for (JsonNode item : response.get("messages")) {
                String msgId = item.get("id").asText();
                try {
                    // Fetch summary snippet for found message
                    JsonNode msgDetail = restClient.get()
                        .uri(BASE_URL + "/messages/{id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date", msgId)
                        .header("Authorization", "Bearer " + token)
                        .accept(MediaType.APPLICATION_JSON)
                        .retrieve()
                        .body(JsonNode.class);

                    if (msgDetail != null) {
                        messages.add(msgDetail);
                    }
                } catch (Exception e) {
                    messages.add(item);
                }
            }
        }

        result.set("messages", messages);
        result.put("resultSizeEstimate", response != null && response.has("resultSizeEstimate") ? response.get("resultSizeEstimate").asInt() : 0);
        return result;
    }

    private JsonNode getEmail(JsonNode input, String token) {
        String messageId = input.get("messageId").asText();

        return restClient.get()
            .uri(BASE_URL + "/messages/{messageId}?format=full", messageId)
            .header("Authorization", "Bearer " + token)
            .accept(MediaType.APPLICATION_JSON)
            .retrieve()
            .body(JsonNode.class);
    }

    private JsonNode createDraft(JsonNode input, String token) {
        String to = input.get("to").asText();
        String subject = input.get("subject").asText();
        String body = input.get("body").asText();

        String rawRfc2822 = createRawEmail(to, subject, body);

        ObjectNode draftPayload = objectMapper.createObjectNode();
        ObjectNode messageNode = objectMapper.createObjectNode();
        messageNode.put("raw", rawRfc2822);
        draftPayload.set("message", messageNode);

        return restClient.post()
            .uri(BASE_URL + "/drafts")
            .header("Authorization", "Bearer " + token)
            .contentType(MediaType.APPLICATION_JSON)
            .body(draftPayload)
            .retrieve()
            .body(JsonNode.class);
    }

    private JsonNode sendEmail(JsonNode input, String token) {
        String to = input.get("to").asText();
        String subject = input.get("subject").asText();
        String body = input.get("body").asText();

        String rawRfc2822 = createRawEmail(to, subject, body);

        ObjectNode sendPayload = objectMapper.createObjectNode();
        sendPayload.put("raw", rawRfc2822);

        return restClient.post()
            .uri(BASE_URL + "/messages/send")
            .header("Authorization", "Bearer " + token)
            .contentType(MediaType.APPLICATION_JSON)
            .body(sendPayload)
            .retrieve()
            .body(JsonNode.class);
    }

    private JsonNode listLabels(String token) {
        return restClient.get()
            .uri(BASE_URL + "/labels")
            .header("Authorization", "Bearer " + token)
            .accept(MediaType.APPLICATION_JSON)
            .retrieve()
            .body(JsonNode.class);
    }

    private String createRawEmail(String to, String subject, String body) {
        String emailContent = "To: " + to + "\r\n" +
            "Subject: " + subject + "\r\n" +
            "Content-Type: text/plain; charset=utf-8\r\n\r\n" +
            body;
        return Base64.getUrlEncoder().withoutPadding().encodeToString(emailContent.getBytes(StandardCharsets.UTF_8));
    }
}
