package com.integrationplatform.connector;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.integrationplatform.connector.impl.GoogleCalendarConnector;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class GoogleCalendarConnectorTest {

    private GoogleCalendarConnector connector;

    @BeforeEach
    void setUp() {
        connector = new GoogleCalendarConnector(new ObjectMapper());
    }

    @Test
    void testSupportsTool() {
        assertEquals("google-calendar", connector.getIntegrationSlug());
        assertTrue(connector.supportsTool("calendar.list_events"));
        assertTrue(connector.supportsTool("calendar.get_event"));
        assertTrue(connector.supportsTool("calendar.create_event"));
        assertTrue(connector.supportsTool("calendar.update_event"));
        assertTrue(connector.supportsTool("calendar.delete_event"));
        assertTrue(connector.supportsTool("calendar.get_free_busy"));

        assertFalse(connector.supportsTool("gmail.list_labels"));
        assertFalse(connector.supportsTool(null));
    }
}
