package com.integrationplatform.connector;

import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class ConnectorRegistry {

    private final Map<String, IntegrationConnector> connectors = new ConcurrentHashMap<>();

    public ConnectorRegistry(List<IntegrationConnector> connectorList) {
        for (IntegrationConnector connector : connectorList) {
            connectors.put(connector.getIntegrationSlug().toLowerCase(), connector);
        }
    }

    public void register(IntegrationConnector connector) {
        connectors.put(connector.getIntegrationSlug().toLowerCase(), connector);
    }

    public Optional<IntegrationConnector> getConnector(String integrationSlug) {
        if (integrationSlug == null) return Optional.empty();
        return Optional.ofNullable(connectors.get(integrationSlug.toLowerCase()));
    }

    public Optional<IntegrationConnector> findConnectorForTool(String toolSlug) {
        if (toolSlug == null) return Optional.empty();
        for (IntegrationConnector connector : connectors.values()) {
            if (connector.supportsTool(toolSlug)) {
                return Optional.of(connector);
            }
        }
        // Fallback: match prefix e.g. "gmail." -> "gmail"
        if (toolSlug.contains(".")) {
            String prefix = toolSlug.substring(0, toolSlug.indexOf('.'));
            return getConnector(prefix);
        }
        return Optional.empty();
    }
}
