package com.integrationplatform.connector;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.integrationplatform.connector.impl.GmailConnector;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class GmailConnectorTest {

    private GmailConnector connector;

    @BeforeEach
    void setUp() {
        connector = new GmailConnector(new ObjectMapper());
    }

    @Test
    void testSupportsTool() {
        assertEquals("gmail", connector.getIntegrationSlug());
        assertTrue(connector.supportsTool("gmail.search_emails"));
        assertTrue(connector.supportsTool("gmail.get_email"));
        assertTrue(connector.supportsTool("gmail.create_draft"));
        assertTrue(connector.supportsTool("gmail.send_email"));
        assertTrue(connector.supportsTool("gmail.list_labels"));

        assertFalse(connector.supportsTool("github.create_issue"));
        assertFalse(connector.supportsTool("calendar.list_events"));
        assertFalse(connector.supportsTool(null));
    }
}
