-- Milestone 5: Hosted Connection Sessions for End-User Connect Experience

CREATE TABLE connect_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
    project_user_id VARCHAR(120) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    return_url VARCHAR(500),
    auth_url TEXT,
    connected_account_id UUID REFERENCES connected_accounts(id) ON DELETE SET NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_connect_session_status CHECK (status IN ('PENDING', 'COMPLETED', 'EXPIRED'))
);
CREATE INDEX idx_connect_sessions_proj ON connect_sessions(project_id);
