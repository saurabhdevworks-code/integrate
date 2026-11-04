-- Milestone 2: Integrations, OAuth Engine, and Credential Vault

CREATE TABLE integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(80) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL,
    category VARCHAR(60) NOT NULL,
    auth_type VARCHAR(40) NOT NULL DEFAULT 'OAUTH2',
    authorization_url VARCHAR(500),
    token_url VARCHAR(500),
    user_info_url VARCHAR(500),
    default_scopes TEXT,
    icon_url VARCHAR(500),
    documentation_url VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed standard integrations
INSERT INTO integrations (slug, name, category, auth_type, authorization_url, token_url, user_info_url, default_scopes, documentation_url)
VALUES
('gmail', 'Gmail', 'COMMUNICATION', 'OAUTH2', 
 'https://accounts.google.com/o/oauth2/v2/auth', 
 'https://oauth2.googleapis.com/token',
 'https://www.googleapis.com/oauth2/v2/userinfo',
 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.compose https://www.googleapis.com/auth/userinfo.email',
 'https://developers.google.com/gmail/api'),

('github', 'GitHub', 'DEVELOPER_TOOLS', 'OAUTH2',
 'https://github.com/login/oauth/authorize',
 'https://github.com/login/oauth/access_token',
 'https://api.github.com/user',
 'repo read:user user:email',
 'https://docs.github.com/en/rest'),

('google-calendar', 'Google Calendar', 'PRODUCTIVITY', 'OAUTH2',
 'https://accounts.google.com/o/oauth2/v2/auth',
 'https://oauth2.googleapis.com/token',
 'https://www.googleapis.com/oauth2/v2/userinfo',
 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.email',
 'https://developers.google.com/calendar/api');

CREATE TABLE project_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
    enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_project_integration UNIQUE (project_id, integration_id)
);
CREATE INDEX idx_proj_integrations_proj ON project_integrations(project_id);

CREATE TABLE oauth_provider_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
    client_id VARCHAR(255) NOT NULL,
    client_secret_encrypted TEXT NOT NULL,
    redirect_uri VARCHAR(500) NOT NULL,
    scopes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_oauth_provider_config UNIQUE (project_id, integration_id)
);

CREATE TABLE oauth_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
    project_user_id VARCHAR(120) NOT NULL,
    state_token VARCHAR(255) NOT NULL UNIQUE,
    code_verifier VARCHAR(255),
    redirect_uri VARCHAR(500) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_oauth_states_token ON oauth_states(state_token);

CREATE TABLE connected_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
    project_user_id VARCHAR(120) NOT NULL,
    provider_account_id VARCHAR(255),
    account_email VARCHAR(320),
    account_name VARCHAR(255),
    status VARCHAR(30) NOT NULL DEFAULT 'CONNECTED',
    granted_scopes TEXT,
    token_expires_at TIMESTAMPTZ,
    last_refreshed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_connected_account UNIQUE (project_id, integration_id, project_user_id),
    CONSTRAINT ck_conn_account_status CHECK (status IN ('CONNECTED', 'EXPIRED', 'REVOKED', 'ERROR'))
);
CREATE INDEX idx_conn_accounts_proj ON connected_accounts(project_id);
CREATE INDEX idx_conn_accounts_user ON connected_accounts(project_id, project_user_id);

CREATE TABLE encrypted_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connected_account_id UUID NOT NULL REFERENCES connected_accounts(id) ON DELETE CASCADE UNIQUE,
    access_token_encrypted TEXT NOT NULL,
    refresh_token_encrypted TEXT,
    key_version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
