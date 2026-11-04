package com.integrationplatform.execution;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.integrationplatform.common.exception.BadRequestException;
import com.integrationplatform.execution.service.SchemaValidationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class SchemaValidationServiceTest {

    private SchemaValidationService validationService;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        validationService = new SchemaValidationService(objectMapper);
    }

    @Test
    void testValidate_Success() {
        String schema = """
            {
              "type": "object",
              "properties": {
                "query": { "type": "string" },
                "maxResults": { "type": "integer" }
              },
              "required": ["query"]
            }
            """;

        ObjectNode input = objectMapper.createObjectNode();
        input.put("query", "from:user@example.com");
        input.put("maxResults", 10);

        assertDoesNotThrow(() -> validationService.validate(schema, input));
    }

    @Test
    void testValidate_MissingRequiredFieldThrows() {
        String schema = """
            {
              "type": "object",
              "properties": {
                "query": { "type": "string" }
              },
              "required": ["query"]
            }
            """;

        ObjectNode input = objectMapper.createObjectNode();
        input.put("other", 123);

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
            validationService.validate(schema, input)
        );
        assertTrue(ex.getMessage().contains("Missing required field: 'query'"));
    }

    @Test
    void testValidate_InvalidTypeThrows() {
        String schema = """
            {
              "type": "object",
              "properties": {
                "count": { "type": "integer" }
              }
            }
            """;

        ObjectNode input = objectMapper.createObjectNode();
        input.put("count", "not-a-number");

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
            validationService.validate(schema, input)
        );
        assertTrue(ex.getMessage().contains("must be of type integer"));
    }
}
