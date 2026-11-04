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

@Component
public class GoogleCalendarConnector implements IntegrationConnector {

    private static final Logger log = LoggerFactory.getLogger(GoogleCalendarConnector.class);
    private static final String BASE_URL = "https://www.googleapis.com/calendar/v3";

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public GoogleCalendarConnector(ObjectMapper objectMapper) {
        this.restClient = RestClient.create();
        this.objectMapper = objectMapper;
    }

    @Override
    public String getIntegrationSlug() {
        return "google-calendar";
    }

    @Override
    public boolean supportsTool(String toolName) {
        return toolName != null && (toolName.startsWith("calendar.") || toolName.startsWith("google-calendar."));
    }

    @Override
    public JsonNode execute(String toolName, JsonNode input, ToolExecutionContext context) {
        String token = context.decryptedAccessToken();

        try {
            return switch (toolName) {
                case "calendar.list_events" -> listEvents(input, token);
                case "calendar.get_event" -> getEvent(input, token);
                case "calendar.create_event" -> createEvent(input, token);
                case "calendar.update_event" -> updateEvent(input, token);
                case "calendar.delete_event" -> deleteEvent(input, token);
                case "calendar.get_free_busy" -> getFreeBusy(input, token);
                default -> throw new BadRequestException("Unsupported Google Calendar tool: " + toolName);
            };
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            log.error("Google Calendar API call failed for tool: {}", toolName, e);
            throw new BadRequestException("Google Calendar API call failed: " + e.getMessage());
        }
    }

    private JsonNode listEvents(JsonNode input, String token) {
        String calendarId = input.has("calendarId") ? input.get("calendarId").asText() : "primary";
        int maxResults = input.has("maxResults") ? input.get("maxResults").asInt(20) : 20;

        return restClient.get()
            .uri(BASE_URL + "/calendars/{calendarId}/events?maxResults={maxResults}&singleEvents=true&orderBy=startTime", calendarId, maxResults)
            .header("Authorization", "Bearer " + token)
            .accept(MediaType.APPLICATION_JSON)
            .retrieve()
            .body(JsonNode.class);
    }

    private JsonNode getEvent(JsonNode input, String token) {
        String calendarId = input.has("calendarId") ? input.get("calendarId").asText() : "primary";
        String eventId = input.get("eventId").asText();

        return restClient.get()
            .uri(BASE_URL + "/calendars/{calendarId}/events/{eventId}", calendarId, eventId)
            .header("Authorization", "Bearer " + token)
            .accept(MediaType.APPLICATION_JSON)
            .retrieve()
            .body(JsonNode.class);
    }

    private JsonNode createEvent(JsonNode input, String token) {
        String calendarId = input.has("calendarId") ? input.get("calendarId").asText() : "primary";

        ObjectNode payload = objectMapper.createObjectNode();
        payload.put("summary", input.get("summary").asText());
        if (input.has("description")) {
            payload.put("description", input.get("description").asText());
        }

        ObjectNode start = objectMapper.createObjectNode();
        start.put("dateTime", input.get("startDateTime").asText());
        payload.set("start", start);

        ObjectNode end = objectMapper.createObjectNode();
        end.put("dateTime", input.get("endDateTime").asText());
        payload.set("end", end);

        return restClient.post()
            .uri(BASE_URL + "/calendars/{calendarId}/events", calendarId)
            .header("Authorization", "Bearer " + token)
            .contentType(MediaType.APPLICATION_JSON)
            .body(payload)
            .retrieve()
            .body(JsonNode.class);
    }

    private JsonNode updateEvent(JsonNode input, String token) {
        String calendarId = input.has("calendarId") ? input.get("calendarId").asText() : "primary";
        String eventId = input.get("eventId").asText();

        ObjectNode patch = objectMapper.createObjectNode();
        if (input.has("summary")) patch.put("summary", input.get("summary").asText());
        if (input.has("description")) patch.put("description", input.get("description").asText());

        if (input.has("startDateTime")) {
            ObjectNode start = objectMapper.createObjectNode();
            start.put("dateTime", input.get("startDateTime").asText());
            patch.set("start", start);
        }
        if (input.has("endDateTime")) {
            ObjectNode end = objectMapper.createObjectNode();
            end.put("dateTime", input.get("endDateTime").asText());
            patch.set("end", end);
        }

        return restClient.patch()
            .uri(BASE_URL + "/calendars/{calendarId}/events/{eventId}", calendarId, eventId)
            .header("Authorization", "Bearer " + token)
            .contentType(MediaType.APPLICATION_JSON)
            .body(patch)
            .retrieve()
            .body(JsonNode.class);
    }

    private JsonNode deleteEvent(JsonNode input, String token) {
        String calendarId = input.has("calendarId") ? input.get("calendarId").asText() : "primary";
        String eventId = input.get("eventId").asText();

        restClient.delete()
            .uri(BASE_URL + "/calendars/{calendarId}/events/{eventId}", calendarId, eventId)
            .header("Authorization", "Bearer " + token)
            .retrieve()
            .toBodilessEntity();

        ObjectNode result = objectMapper.createObjectNode();
        result.put("status", "DELETED");
        result.put("eventId", eventId);
        return result;
    }

    private JsonNode getFreeBusy(JsonNode input, String token) {
        String calendarId = input.has("calendarId") ? input.get("calendarId").asText() : "primary";
        String timeMin = input.get("timeMin").asText();
        String timeMax = input.get("timeMax").asText();

        ObjectNode payload = objectMapper.createObjectNode();
        payload.put("timeMin", timeMin);
        payload.put("timeMax", timeMax);

        ArrayNode items = objectMapper.createArrayNode();
        ObjectNode calItem = objectMapper.createObjectNode();
        calItem.put("id", calendarId);
        items.add(calItem);
        payload.set("items", items);

        return restClient.post()
            .uri(BASE_URL + "/freeBusy")
            .header("Authorization", "Bearer " + token)
            .contentType(MediaType.APPLICATION_JSON)
            .body(payload)
            .retrieve()
            .body(JsonNode.class);
    }
}
