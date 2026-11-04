package com.integrationplatform.connector.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
public class GitHubConnector implements IntegrationConnector {

    private static final Logger log = LoggerFactory.getLogger(GitHubConnector.class);
    private static final String BASE_URL = "https://api.github.com";

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public GitHubConnector(ObjectMapper objectMapper) {
        this.restClient = RestClient.create();
        this.objectMapper = objectMapper;
    }

    @Override
    public String getIntegrationSlug() {
        return "github";
    }

    @Override
    public boolean supportsTool(String toolName) {
        return toolName != null && toolName.startsWith("github.");
    }

    @Override
    public JsonNode execute(String toolName, JsonNode input, ToolExecutionContext context) {
        String token = context.decryptedAccessToken();

        try {
            return switch (toolName) {
                case "github.list_repositories" -> listRepositories(input, token);
                case "github.list_issues" -> listIssues(input, token);
                case "github.get_issue" -> getIssue(input, token);
                case "github.create_issue" -> createIssue(input, token);
                case "github.create_issue_comment" -> createIssueComment(input, token);
                case "github.list_pull_requests" -> listPullRequests(input, token);
                default -> throw new BadRequestException("Unsupported GitHub tool: " + toolName);
            };
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            log.error("GitHub API call failed for tool: {}", toolName, e);
            throw new BadRequestException("GitHub API call failed: " + e.getMessage());
        }
    }

    private JsonNode listRepositories(JsonNode input, String token) {
        String visibility = input.has("visibility") ? input.get("visibility").asText() : "all";
        int perPage = input.has("perPage") ? input.get("perPage").asInt(30) : 30;

        return restClient.get()
            .uri(BASE_URL + "/user/repos?visibility={visibility}&per_page={perPage}&sort=updated", visibility, perPage)
            .header("Authorization", "Bearer " + token)
            .header("Accept", "application/vnd.github+json")
            .header("X-GitHub-Api-Version", "2022-11-28")
            .header("User-Agent", "IntegrationPlatform/1.0")
            .retrieve()
            .body(JsonNode.class);
    }

    private JsonNode listIssues(JsonNode input, String token) {
        String owner = input.get("owner").asText();
        String repo = input.get("repo").asText();
        String state = input.has("state") ? input.get("state").asText() : "open";
        int perPage = input.has("perPage") ? input.get("perPage").asInt(30) : 30;

        return restClient.get()
            .uri(BASE_URL + "/repos/{owner}/{repo}/issues?state={state}&per_page={perPage}", owner, repo, state, perPage)
            .header("Authorization", "Bearer " + token)
            .header("Accept", "application/vnd.github+json")
            .header("X-GitHub-Api-Version", "2022-11-28")
            .header("User-Agent", "IntegrationPlatform/1.0")
            .retrieve()
            .body(JsonNode.class);
    }

    private JsonNode getIssue(JsonNode input, String token) {
        String owner = input.get("owner").asText();
        String repo = input.get("repo").asText();
        int issueNumber = input.get("issueNumber").asInt();

        return restClient.get()
            .uri(BASE_URL + "/repos/{owner}/{repo}/issues/{issueNumber}", owner, repo, issueNumber)
            .header("Authorization", "Bearer " + token)
            .header("Accept", "application/vnd.github+json")
            .header("X-GitHub-Api-Version", "2022-11-28")
            .header("User-Agent", "IntegrationPlatform/1.0")
            .retrieve()
            .body(JsonNode.class);
    }

    private JsonNode createIssue(JsonNode input, String token) {
        String owner = input.get("owner").asText();
        String repo = input.get("repo").asText();

        ObjectNode payload = objectMapper.createObjectNode();
        payload.put("title", input.get("title").asText());
        if (input.has("body")) {
            payload.put("body", input.get("body").asText());
        }

        return restClient.post()
            .uri(BASE_URL + "/repos/{owner}/{repo}/issues", owner, repo)
            .header("Authorization", "Bearer " + token)
            .header("Accept", "application/vnd.github+json")
            .header("X-GitHub-Api-Version", "2022-11-28")
            .header("User-Agent", "IntegrationPlatform/1.0")
            .contentType(MediaType.APPLICATION_JSON)
            .body(payload)
            .retrieve()
            .body(JsonNode.class);
    }

    private JsonNode createIssueComment(JsonNode input, String token) {
        String owner = input.get("owner").asText();
        String repo = input.get("repo").asText();
        int issueNumber = input.get("issueNumber").asInt();

        ObjectNode payload = objectMapper.createObjectNode();
        payload.put("body", input.get("body").asText());

        return restClient.post()
            .uri(BASE_URL + "/repos/{owner}/{repo}/issues/{issueNumber}/comments", owner, repo, issueNumber)
            .header("Authorization", "Bearer " + token)
            .header("Accept", "application/vnd.github+json")
            .header("X-GitHub-Api-Version", "2022-11-28")
            .header("User-Agent", "IntegrationPlatform/1.0")
            .contentType(MediaType.APPLICATION_JSON)
            .body(payload)
            .retrieve()
            .body(JsonNode.class);
    }

    private JsonNode listPullRequests(JsonNode input, String token) {
        String owner = input.get("owner").asText();
        String repo = input.get("repo").asText();
        String state = input.has("state") ? input.get("state").asText() : "open";
        int perPage = input.has("perPage") ? input.get("perPage").asInt(30) : 30;

        return restClient.get()
            .uri(BASE_URL + "/repos/{owner}/{repo}/pulls?state={state}&per_page={perPage}", owner, repo, state, perPage)
            .header("Authorization", "Bearer " + token)
            .header("Accept", "application/vnd.github+json")
            .header("X-GitHub-Api-Version", "2022-11-28")
            .header("User-Agent", "IntegrationPlatform/1.0")
            .retrieve()
            .body(JsonNode.class);
    }
}
