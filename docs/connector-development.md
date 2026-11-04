# Connector Development Guide — Planned Contract

A connector should be an adapter, not an authorization boundary. It must execute only after the shared engine authenticates the caller, validates tenant ownership, resolves a connected account, checks scopes/permissions, and applies approval policy.

Suggested contract:
```java
public interface IntegrationConnector {
    IntegrationMetadata getMetadata();
    AuthenticationStrategy getAuthenticationStrategy();
    List<ToolDefinition> getAvailableTools();
    void validateConfiguration(IntegrationConfiguration configuration);
    ToolResult executeTool(ToolExecutionContext context, String toolSlug, JsonNode arguments);
    void refreshConnection(ConnectedAccount account);
    void disconnect(ConnectedAccount account);
}
```

Adding a connector should register an implementation without modifying the core execution orchestration. Third-party code must not be loaded as arbitrary in-process plugins; use an isolated execution boundary for untrusted connectors.
