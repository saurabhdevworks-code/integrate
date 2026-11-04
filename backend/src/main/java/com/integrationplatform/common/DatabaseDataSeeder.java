package com.integrationplatform.common;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.integrationplatform.execution.model.RiskLevel;
import com.integrationplatform.execution.model.ToolDefinition;
import com.integrationplatform.execution.repository.ToolDefinitionRepository;
import com.integrationplatform.integration.model.Integration;
import com.integrationplatform.integration.repository.IntegrationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Order(1)
public class DatabaseDataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseDataSeeder.class);

    private final IntegrationRepository integrationRepository;
    private final ToolDefinitionRepository toolDefinitionRepository;
    private final ObjectMapper objectMapper;

    public DatabaseDataSeeder(
        IntegrationRepository integrationRepository,
        ToolDefinitionRepository toolDefinitionRepository,
        ObjectMapper objectMapper
    ) {
        this.integrationRepository = integrationRepository;
        this.toolDefinitionRepository = toolDefinitionRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Checking and seeding comprehensive integration marketplace catalog (30 connectors)...");

        seedIntegrationIfMissing("gmail", "Google Gmail", "COMMUNICATION", "OAUTH2", "https://mail.google.com/", "https://developers.google.com/gmail/api");
        seedIntegrationIfMissing("github", "GitHub", "DEVELOPER_TOOLS", "OAUTH2", "repo,read:user,user:email", "https://docs.github.com/rest");
        seedIntegrationIfMissing("google_calendar", "Google Calendar", "PRODUCTIVITY", "OAUTH2", "https://www.googleapis.com/auth/calendar.events", "https://developers.google.com/calendar/api");
        seedIntegrationIfMissing("google_drive", "Google Drive", "STORAGE", "OAUTH2", "https://www.googleapis.com/auth/drive.file", "https://developers.google.com/drive");
        seedIntegrationIfMissing("slack", "Slack", "COMMUNICATION", "OAUTH2", "chat:write channels:read users:read", "https://api.slack.com/");
        seedIntegrationIfMissing("notion", "Notion", "PRODUCTIVITY", "OAUTH2", "read_content update_content insert_content", "https://developers.notion.com/");
        seedIntegrationIfMissing("linear", "Linear", "DEVELOPER_TOOLS", "OAUTH2", "read,write,issues:create", "https://developers.linear.app/");
        seedIntegrationIfMissing("jira", "Jira", "DEVELOPER_TOOLS", "OAUTH2", "read:jira-work write:jira-work", "https://developer.atlassian.com/cloud/jira/platform/rest/v3/");
        seedIntegrationIfMissing("discord", "Discord", "COMMUNICATION", "OAUTH2", "bot messages.read webhook.incoming", "https://discord.com/developers/docs/intro");
        seedIntegrationIfMissing("stripe", "Stripe", "FINANCE", "OAUTH2", "read_write", "https://stripe.com/docs/api");
        seedIntegrationIfMissing("hubspot", "HubSpot", "CRM", "OAUTH2", "crm.objects.contacts.read crm.objects.deals.read", "https://developers.hubspot.com/docs/api/overview");
        seedIntegrationIfMissing("salesforce", "Salesforce", "CRM", "OAUTH2", "api refresh_token offline_access", "https://developer.salesforce.com/");
        seedIntegrationIfMissing("airtable", "Airtable", "PRODUCTIVITY", "OAUTH2", "data.records:read data.records:write", "https://airtable.com/developers/web/api/introduction");
        seedIntegrationIfMissing("trello", "Trello", "PRODUCTIVITY", "OAUTH2", "read,write", "https://developer.atlassian.com/cloud/trello/rest/");
        seedIntegrationIfMissing("asana", "Asana", "PRODUCTIVITY", "OAUTH2", "default", "https://developers.asana.com/");
        seedIntegrationIfMissing("clickup", "ClickUp", "PRODUCTIVITY", "OAUTH2", "task:read task:write", "https://clickup.com/api");
        seedIntegrationIfMissing("gitlab", "GitLab", "DEVELOPER_TOOLS", "OAUTH2", "api read_user", "https://docs.gitlab.com/ee/api/rest/");
        seedIntegrationIfMissing("zoom", "Zoom", "COMMUNICATION", "OAUTH2", "meeting:write meeting:read", "https://developers.zoom.us/docs/api/");
        seedIntegrationIfMissing("ms_teams", "Microsoft Teams", "COMMUNICATION", "OAUTH2", "Chat.ReadWrite ChannelMessage.Send", "https://learn.microsoft.com/en-us/graph/teams-concept-overview");
        seedIntegrationIfMissing("ms_outlook", "Microsoft Outlook", "COMMUNICATION", "OAUTH2", "Mail.ReadWrite Mail.Send", "https://learn.microsoft.com/en-us/graph/outlook-mail-concept-overview");
        seedIntegrationIfMissing("zendesk", "Zendesk", "CRM", "OAUTH2", "read write", "https://developer.zendesk.com/api-reference/");
        seedIntegrationIfMissing("shopify", "Shopify", "FINANCE", "OAUTH2", "read_orders write_products", "https://shopify.dev/docs/api/admin-rest");
        seedIntegrationIfMissing("figma", "Figma", "DESIGN", "OAUTH2", "files:read comments:read", "https://www.figma.com/developers/api");
        seedIntegrationIfMissing("supabase", "Supabase", "DEVELOPER_TOOLS", "OAUTH2", "all", "https://supabase.com/docs/reference/api");
        seedIntegrationIfMissing("dropbox", "Dropbox", "STORAGE", "OAUTH2", "files.content.write files.content.read", "https://www.dropbox.com/developers/documentation");
        seedIntegrationIfMissing("twitter", "Twitter / X", "MARKETING", "OAUTH2", "tweet.read tweet.write users.read", "https://developer.x.com/en/docs");
        seedIntegrationIfMissing("linkedin", "LinkedIn", "MARKETING", "OAUTH2", "w_member_social r_liteprofile", "https://learn.microsoft.com/en-us/linkedin/");
        seedIntegrationIfMissing("mailchimp", "Mailchimp", "MARKETING", "OAUTH2", "campaigns:read campaigns:write", "https://mailchimp.com/developer/marketing/api/");
        seedIntegrationIfMissing("intercom", "Intercom", "CRM", "OAUTH2", "read write", "https://developers.intercom.com/docs");

        if (toolDefinitionRepository.count() == 0) {
            log.info("Auto-seeding default tool catalog (17 tools across Gmail, GitHub, Calendar)...");

            Integration gmail = integrationRepository.findBySlug("gmail").orElse(null);
            Integration github = integrationRepository.findBySlug("github").orElse(null);
            Integration calendar = integrationRepository.findBySlug("google_calendar").orElse(null);

            if (gmail != null) {
                seedTool(gmail, "gmail.search_emails", "Search Emails", "Search email messages using Gmail query syntax", "{\"type\":\"object\",\"properties\":{\"query\":{\"type\":\"string\"},\"maxResults\":{\"type\":\"integer\"}},\"required\":[\"query\"]}", RiskLevel.LOW, false);
                seedTool(gmail, "gmail.get_email", "Get Email by ID", "Fetch full RFC 2822 email payload and metadata", "{\"type\":\"object\",\"properties\":{\"messageId\":{\"type\":\"string\"}},\"required\":[\"messageId\"]}", RiskLevel.LOW, false);
                seedTool(gmail, "gmail.create_draft", "Create Draft Email", "Create a draft email in user's Gmail box", "{\"type\":\"object\",\"properties\":{\"to\":{\"type\":\"string\"},\"subject\":{\"type\":\"string\"},\"body\":{\"type\":\"string\"}},\"required\":[\"to\",\"subject\",\"body\"]}", RiskLevel.LOW, false);
                seedTool(gmail, "gmail.send_email", "Send Email", "Send an email directly from user's Gmail address", "{\"type\":\"object\",\"properties\":{\"to\":{\"type\":\"string\"},\"subject\":{\"type\":\"string\"},\"body\":{\"type\":\"string\"}},\"required\":[\"to\",\"subject\",\"body\"]}", RiskLevel.HIGH, true);
                seedTool(gmail, "gmail.list_labels", "List Gmail Labels", "List all system and custom labels in user's mailbox", "{\"type\":\"object\",\"properties\":{}}", RiskLevel.LOW, false);
            }

            if (github != null) {
                seedTool(github, "github.list_repositories", "List Repositories", "List repositories for authenticated user", "{\"type\":\"object\",\"properties\":{\"visibility\":{\"type\":\"string\"}}}", RiskLevel.LOW, false);
                seedTool(github, "github.list_issues", "List Issues", "List repository issues with state filter", "{\"type\":\"object\",\"properties\":{\"owner\":{\"type\":\"string\"},\"repo\":{\"type\":\"string\"},\"state\":{\"type\":\"string\"}},\"required\":[\"owner\",\"repo\"]}", RiskLevel.LOW, false);
                seedTool(github, "github.get_issue", "Get Issue", "Get details of an issue by issue number", "{\"type\":\"object\",\"properties\":{\"owner\":{\"type\":\"string\"},\"repo\":{\"type\":\"string\"},\"issueNumber\":{\"type\":\"integer\"}},\"required\":[\"owner\",\"repo\",\"issueNumber\"]}", RiskLevel.LOW, false);
                seedTool(github, "github.create_issue", "Create Issue", "Create a new issue in a GitHub repository", "{\"type\":\"object\",\"properties\":{\"owner\":{\"type\":\"string\"},\"repo\":{\"type\":\"string\"},\"title\":{\"type\":\"string\"},\"body\":{\"type\":\"string\"}},\"required\":[\"owner\",\"repo\",\"title\"]}", RiskLevel.MEDIUM, false);
                seedTool(github, "github.create_issue_comment", "Add Issue Comment", "Post a comment on an issue or pull request", "{\"type\":\"object\",\"properties\":{\"owner\":{\"type\":\"string\"},\"repo\":{\"type\":\"string\"},\"issueNumber\":{\"type\":\"integer\"},\"body\":{\"type\":\"string\"}},\"required\":[\"owner\",\"repo\",\"issueNumber\",\"body\"]}", RiskLevel.MEDIUM, false);
                seedTool(github, "github.list_pull_requests", "List Pull Requests", "List pull requests in a GitHub repository", "{\"type\":\"object\",\"properties\":{\"owner\":{\"type\":\"string\"},\"repo\":{\"type\":\"string\"},\"state\":{\"type\":\"string\"}},\"required\":[\"owner\",\"repo\"]}", RiskLevel.LOW, false);
            }

            if (calendar != null) {
                seedTool(calendar, "calendar.list_events", "List Calendar Events", "List upcoming calendar events", "{\"type\":\"object\",\"properties\":{\"calendarId\":{\"type\":\"string\"},\"maxResults\":{\"type\":\"integer\"}}}", RiskLevel.LOW, false);
                seedTool(calendar, "calendar.get_event", "Get Event", "Get details of a specific calendar event", "{\"type\":\"object\",\"properties\":{\"calendarId\":{\"type\":\"string\"},\"eventId\":{\"type\":\"string\"}},\"required\":[\"eventId\"]}", RiskLevel.LOW, false);
                seedTool(calendar, "calendar.create_event", "Create Calendar Event", "Schedule a new event on user's calendar", "{\"type\":\"object\",\"properties\":{\"calendarId\":{\"type\":\"string\"},\"summary\":{\"type\":\"string\"},\"start\":{\"type\":\"string\"},\"end\":{\"type\":\"string\"}},\"required\":[\"summary\",\"start\",\"end\"]}", RiskLevel.MEDIUM, false);
                seedTool(calendar, "calendar.update_event", "Update Calendar Event", "Update an existing event on user's calendar", "{\"type\":\"object\",\"properties\":{\"calendarId\":{\"type\":\"string\"},\"eventId\":{\"type\":\"string\"},\"summary\":{\"type\":\"string\"}},\"required\":[\"eventId\"]}", RiskLevel.MEDIUM, false);
                seedTool(calendar, "calendar.delete_event", "Delete Calendar Event", "Remove an event from user's calendar", "{\"type\":\"object\",\"properties\":{\"calendarId\":{\"type\":\"string\"},\"eventId\":{\"type\":\"string\"}},\"required\":[\"eventId\"]}", RiskLevel.HIGH, true);
                seedTool(calendar, "calendar.get_free_busy", "Check Free/Busy Time", "Query user's busy slots across time windows", "{\"type\":\"object\",\"properties\":{\"timeMin\":{\"type\":\"string\"},\"timeMax\":{\"type\":\"string\"}},\"required\":[\"timeMin\",\"timeMax\"]}", RiskLevel.LOW, false);
            }
        }
    }

    private void seedIntegrationIfMissing(String slug, String name, String category, String authType, String scopes, String docUrl) {
        if (integrationRepository.findBySlug(slug).isEmpty()) {
            Integration integ = new Integration(slug, name, category, authType);
            integ.setDefaultScopes(scopes);
            integ.setDocumentationUrl(docUrl);
            integrationRepository.save(integ);
            log.info("Seeded integration: {} ({})", name, slug);
        }
    }

    private void seedTool(Integration integration, String slug, String name, String desc, String schemaJson, RiskLevel risk, boolean requiresApproval) {
        ToolDefinition tool = new ToolDefinition(
            integration,
            slug,
            name,
            desc,
            schemaJson,
            integration.getDefaultScopes(),
            risk,
            requiresApproval
        );
        toolDefinitionRepository.save(tool);
    }
}
