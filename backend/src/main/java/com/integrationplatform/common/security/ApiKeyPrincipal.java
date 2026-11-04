package com.integrationplatform.common.security;

import com.integrationplatform.apikey.model.ApiKey;
import com.integrationplatform.organization.model.Organization;
import com.integrationplatform.project.model.Project;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public class ApiKeyPrincipal implements UserDetails {

    private final UUID apiKeyId;
    private final UUID projectId;
    private final String projectName;
    private final UUID organizationId;
    private final String environment;

    public ApiKeyPrincipal(ApiKey apiKey) {
        this.apiKeyId = apiKey.getId();
        this.projectId = apiKey.getProject().getId();
        this.projectName = apiKey.getProject().getName();
        this.organizationId = apiKey.getProject().getOrganization().getId();
        this.environment = apiKey.getEnvironment();
    }

    public UUID getApiKeyId() {
        return apiKeyId;
    }

    public UUID getProjectId() {
        return projectId;
    }

    public String getProjectName() {
        return projectName;
    }

    public UUID getOrganizationId() {
        return organizationId;
    }

    public String getEnvironment() {
        return environment;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_API_KEY"));
    }

    @Override
    public String getPassword() {
        return "";
    }

    @Override
    public String getUsername() {
        return "api-key:" + apiKeyId;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
