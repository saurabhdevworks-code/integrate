package com.integrationplatform.execution.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.integrationplatform.common.exception.BadRequestException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Service
public class SchemaValidationService {

    private final ObjectMapper objectMapper;
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@(.+)$");

    public SchemaValidationService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public void validate(String schemaJson, JsonNode input) {
        if (schemaJson == null || schemaJson.trim().isEmpty() || schemaJson.trim().equals("{}")) {
            return;
        }

        JsonNode schemaNode;
        try {
            schemaNode = objectMapper.readTree(schemaJson);
        } catch (Exception e) {
            throw new IllegalStateException("Invalid tool input schema definition: " + e.getMessage());
        }

        List<String> errors = new ArrayList<>();

        // Validate required fields
        if (schemaNode.has("required") && schemaNode.get("required").isArray()) {
            for (JsonNode reqField : schemaNode.get("required")) {
                String fieldName = reqField.asText();
                if (input == null || !input.has(fieldName) || input.get(fieldName).isNull()) {
                    errors.add("Missing required field: '" + fieldName + "'");
                }
            }
        }

        // Validate properties type and enum
        if (schemaNode.has("properties") && schemaNode.get("properties").isObject() && input != null && input.isObject()) {
            JsonNode properties = schemaNode.get("properties");
            properties.fieldNames().forEachRemaining(propName -> {
                if (input.has(propName) && !input.get(propName).isNull()) {
                    JsonNode propDef = properties.get(propName);
                    JsonNode val = input.get(propName);

                    // Check type
                    if (propDef.has("type")) {
                        String expectedType = propDef.get("type").asText();
                        if (!matchesType(expectedType, val)) {
                            errors.add("Field '" + propName + "' must be of type " + expectedType);
                        }
                    }

                    // Check enum
                    if (propDef.has("enum") && propDef.get("enum").isArray()) {
                        boolean matchEnum = false;
                        String valText = val.asText();
                        for (JsonNode enumOpt : propDef.get("enum")) {
                            if (enumOpt.asText().equalsIgnoreCase(valText)) {
                                matchEnum = true;
                                break;
                            }
                        }
                        if (!matchEnum) {
                            errors.add("Field '" + propName + "' value is not allowed");
                        }
                    }

                    // Check format
                    if (propDef.has("format") && "email".equalsIgnoreCase(propDef.get("format").asText())) {
                        if (!EMAIL_PATTERN.matcher(val.asText()).matches()) {
                            errors.add("Field '" + propName + "' must be a valid email address");
                        }
                    }
                }
            });
        }

        if (!errors.isEmpty()) {
            throw new BadRequestException("Tool input validation failed: " + String.join("; ", errors));
        }
    }

    private boolean matchesType(String type, JsonNode val) {
        return switch (type.toLowerCase()) {
            case "string" -> val.isTextual();
            case "integer" -> val.isInt() || val.isLong();
            case "number" -> val.isNumber();
            case "boolean" -> val.isBoolean();
            case "array" -> val.isArray();
            case "object" -> val.isObject();
            default -> true;
        };
    }
}
