package com.integrationplatform.oauth.model;

import com.integrationplatform.integration.model.Integration;
import com.integrationplatform.project.model.Project;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "connected_accounts", uniqueConstraints = {
    @UniqueConstraint(name = "uq_connected_account", columnNames = {"project_id", "integration_id", "project_user_id"})
})
public class ConnectedAccount {

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

    @Column(name = "provider_account_id")
    private String providerAccountId;

    @Column(name = "account_email", length = 320)
    private String accountEmail;

    @Column(name = "account_name")
    private String accountName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ConnectedAccountStatus status = ConnectedAccountStatus.CONNECTED;

    @Column(name = "granted_scopes", columnDefinition = "text")
    private String grantedScopes;

    @Column(name = "token_expires_at")
    private Instant tokenExpiresAt;

    @Column(name = "last_refreshed_at")
    private Instant lastRefreshedAt;

    @OneToOne(mappedBy = "connectedAccount", cascade = CascadeType.ALL, orphanRemoval = true)
    private EncryptedCredential credential;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public ConnectedAccount() {}

    public ConnectedAccount(
        Project project,
        Integration integration,
        String projectUserId,
        String providerAccountId,
        String accountEmail,
        String accountName,
        String grantedScopes,
        Instant tokenExpiresAt
    ) {
        this.project = project;
        this.integration = integration;
        this.projectUserId = projectUserId;
        this.providerAccountId = providerAccountId;
        this.accountEmail = accountEmail;
        this.accountName = accountName;
        this.grantedScopes = grantedScopes;
        this.tokenExpiresAt = tokenExpiresAt;
        this.status = ConnectedAccountStatus.CONNECTED;
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

    public String getProjectUserId() {
        return projectUserId;
    }

    public void setProjectUserId(String projectUserId) {
        this.projectUserId = projectUserId;
    }

    public String getProviderAccountId() {
        return providerAccountId;
    }

    public void setProviderAccountId(String providerAccountId) {
        this.providerAccountId = providerAccountId;
    }

    public String getAccountEmail() {
        return accountEmail;
    }

    public void setAccountEmail(String accountEmail) {
        this.accountEmail = accountEmail;
    }

    public String getAccountName() {
        return accountName;
    }

    public void setAccountName(String accountName) {
        this.accountName = accountName;
    }

    public ConnectedAccountStatus getStatus() {
        return status;
    }

    public void setStatus(ConnectedAccountStatus status) {
        this.status = status;
    }

    public String getGrantedScopes() {
        return grantedScopes;
    }

    public void setGrantedScopes(String grantedScopes) {
        this.grantedScopes = grantedScopes;
    }

    public Instant getTokenExpiresAt() {
        return tokenExpiresAt;
    }

    public void setTokenExpiresAt(Instant tokenExpiresAt) {
        this.tokenExpiresAt = tokenExpiresAt;
    }

    public Instant getLastRefreshedAt() {
        return lastRefreshedAt;
    }

    public void setLastRefreshedAt(Instant lastRefreshedAt) {
        this.lastRefreshedAt = lastRefreshedAt;
    }

    public EncryptedCredential getCredential() {
        return credential;
    }

    public void setCredential(EncryptedCredential credential) {
        this.credential = credential;
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
