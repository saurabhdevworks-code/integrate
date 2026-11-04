package com.integrationplatform.connector;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.integrationplatform.connector.impl.GitHubConnector;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class GitHubConnectorTest {

    private GitHubConnector connector;

    @BeforeEach
    void setUp() {
        connector = new GitHubConnector(new ObjectMapper());
    }

    @Test
    void testSupportsTool() {
        assertEquals("github", connector.getIntegrationSlug());
        assertTrue(connector.supportsTool("github.list_repositories"));
        assertTrue(connector.supportsTool("github.list_issues"));
        assertTrue(connector.supportsTool("github.get_issue"));
        assertTrue(connector.supportsTool("github.create_issue"));
        assertTrue(connector.supportsTool("github.create_issue_comment"));
        assertTrue(connector.supportsTool("github.list_pull_requests"));

        assertFalse(connector.supportsTool("gmail.send_email"));
        assertFalse(connector.supportsTool(null));
    }
}
