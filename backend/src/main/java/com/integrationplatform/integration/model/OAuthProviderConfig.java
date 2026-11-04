package com.integrationplatform.integration.model;

import com.integrationplatform.project.model.Project;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "oauth_provider_configs", uniqueConstraints = {
    @UniqueConstraint(name = "uq_oauth_provider_config", columnNames = {"project_id", "integration_id"})
})
public class OAuthProviderConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "integration_id", nullable = false)
    private Integration integration;

    @Column(name = "client_id", nullable = false)
    private String clientId;

    @Column(name = "client_secret_encrypted", nullable = false, columnDefinition = "text")
    private String clientSecretEncrypted;

    @Column(name = "redirect_uri", nullable = false, length = 500)
    private String redirectUri;

    @Column(columnDefinition = "text")
    private String scopes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public OAuthProviderConfig() {}

    public OAuthProviderConfig(Project project, Integration integration, String clientId, String clientSecretEncrypted, String redirectUri, String scopes) {
        this.project = project;
        this.integration = integration;
        this.clientId = clientId;
        this.clientSecretEncrypted = clientSecretEncrypted;
        this.redirectUri = redirectUri;
        this.scopes = scopes;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public Integration getIntegration() {
        return integration;
    }

    public void setIntegration(Integration integration) {
        this.integration = integration;
    }

    public String getClientId() {
        return clientId;
    }

    public void setClientId(String clientId) {
        this.clientId = clientId;
    }

    public String getClientSecretEncrypted() {
        return clientSecretEncrypted;
    }

    public void setClientSecretEncrypted(String clientSecretEncrypted) {
        this.clientSecretEncrypted = clientSecretEncrypted;
    }

    public String getRedirectUri() {
        return redirectUri;
    }

    public void setRedirectUri(String redirectUri) {
        this.redirectUri = redirectUri;
    }

    public String getScopes() {
        return scopes;
    }

    public void setScopes(String scopes) {
        this.scopes = scopes;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
