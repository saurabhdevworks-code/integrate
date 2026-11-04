package com.integrationplatform.session.model;

import com.integrationplatform.integration.model.Integration;
import com.integrationplatform.oauth.model.ConnectedAccount;
import com.integrationplatform.project.model.Project;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "connect_sessions")
public class ConnectSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "integration_id", nullable = false)
    private Integration integration;

    @Column(name = "project_user_id", nullable = false, length = 120)
    private String projectUserId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ConnectSessionStatus status = ConnectSessionStatus.PENDING;

    @Column(name = "return_url", length = 500)
    private String returnUrl;

    @Column(name = "auth_url", columnDefinition = "TEXT")
    private String authUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "connected_account_id")
    private ConnectedAccount connectedAccount;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public ConnectSession() {}

    public ConnectSession(
        Project project,
        Integration integration,
        String projectUserId,
        String returnUrl,
        String authUrl,
        Instant expiresAt
    ) {
        this.project = project;
        this.integration = integration;
        this.projectUserId = projectUserId;
        this.returnUrl = returnUrl;
        this.authUrl = authUrl;
        this.expiresAt = expiresAt;
        this.status = ConnectSessionStatus.PENDING;
        this.createdAt = Instant.now();
    }

    public boolean isValid() {
        return status == ConnectSessionStatus.PENDING && expiresAt.isAfter(Instant.now());
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

    public String getProjectUserId() {
        return projectUserId;
    }

    public void setProjectUserId(String projectUserId) {
        this.projectUserId = projectUserId;
    }

    public ConnectSessionStatus getStatus() {
        return status;
    }

    public void setStatus(ConnectSessionStatus status) {
        this.status = status;
    }

    public String getReturnUrl() {
        return returnUrl;
    }

    public void setReturnUrl(String returnUrl) {
        this.returnUrl = returnUrl;
    }

    public String getAuthUrl() {
        return authUrl;
    }

    public void setAuthUrl(String authUrl) {
        this.authUrl = authUrl;
    }

    public ConnectedAccount getConnectedAccount() {
        return connectedAccount;
    }

    public void setConnectedAccount(ConnectedAccount connectedAccount) {
        this.connectedAccount = connectedAccount;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Instant expiresAt) {
        this.expiresAt = expiresAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
