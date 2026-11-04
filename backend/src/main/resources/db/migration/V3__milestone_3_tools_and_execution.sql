-- Milestone 3: Tool Definitions, Execution Engine, Execution Events, and Approvals

CREATE TABLE tool_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
    slug VARCHAR(120) NOT NULL UNIQUE,
    name VARCHAR(160) NOT NULL,
    description TEXT,
    input_schema JSONB NOT NULL DEFAULT '{}'::jsonb,
    output_schema JSONB,
    required_scopes TEXT,
    risk_level VARCHAR(20) NOT NULL DEFAULT 'LOW',
    requires_approval BOOLEAN NOT NULL DEFAULT false,
    version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_tool_risk CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'))
);
CREATE INDEX idx_tool_defs_integration ON tool_definitions(integration_id);

CREATE TABLE executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    connected_account_id UUID REFERENCES connected_accounts(id) ON DELETE SET NULL,
    tool_slug VARCHAR(120) NOT NULL,
    project_user_id VARCHAR(120) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    idempotency_key VARCHAR(255),
    input_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    output_payload JSONB,
    error_message TEXT,
    error_category VARCHAR(60),
    duration_ms BIGINT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_execution_idempotency UNIQUE (project_id, idempotency_key),
    CONSTRAINT ck_execution_status CHECK (status IN ('PENDING', 'RUNNING', 'SUCCEEDED', 'FAILED', 'PENDING_APPROVAL', 'REJECTED'))
);
CREATE INDEX idx_executions_proj_created ON executions(project_id, created_at DESC);
CREATE INDEX idx_executions_conn_acc ON executions(connected_account_id);

CREATE TABLE execution_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id UUID NOT NULL REFERENCES executions(id) ON DELETE CASCADE,
    event_type VARCHAR(60) NOT NULL,
    message TEXT,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_exec_events_execution ON execution_events(execution_id, created_at);

CREATE TABLE approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id UUID NOT NULL REFERENCES executions(id) ON DELETE CASCADE UNIQUE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    tool_slug VARCHAR(120) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    decided_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    decided_at TIMESTAMPTZ,
    CONSTRAINT ck_approval_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED'))
);
CREATE INDEX idx_approvals_proj_status ON approvals(project_id, status);

-- Seed tool definitions for initial connectors
INSERT INTO tool_definitions (integration_id, slug, name, description, input_schema, required_scopes, risk_level, requires_approval)
SELECT 
    id,
    'gmail.search_emails',
    'Search Emails',
    'Search messages in Gmail inbox by query syntax (e.g. from:user@example.com is:unread)',
    '{"type":"object","properties":{"query":{"type":"string","description":"Gmail search query"},"maxResults":{"type":"integer","default":10}},"required":["query"]}'::jsonb,
    'https://www.googleapis.com/auth/gmail.readonly',
    'LOW',
    false
FROM integrations WHERE slug = 'gmail';

INSERT INTO tool_definitions (integration_id, slug, name, description, input_schema, required_scopes, risk_level, requires_approval)
SELECT 
    id,
    'gmail.send_email',
    'Send Email',
    'Compose and send an email message directly from connected Gmail account',
    '{"type":"object","properties":{"to":{"type":"string","format":"email","description":"Recipient email"},"subject":{"type":"string","description":"Email subject line"},"body":{"type":"string","description":"Message content"}},"required":["to","subject","body"]}'::jsonb,
    'https://www.googleapis.com/auth/gmail.send',
    'HIGH',
    true
FROM integrations WHERE slug = 'gmail';

INSERT INTO tool_definitions (integration_id, slug, name, description, input_schema, required_scopes, risk_level, requires_approval)
SELECT 
    id,
    'github.list_repositories',
    'List Repositories',
    'List repositories accessible to the authenticated GitHub account',
    '{"type":"object","properties":{"visibility":{"type":"string","enum":["all","public","private"],"default":"all"},"perPage":{"type":"integer","default":30}}}'::jsonb,
    'repo',
    'LOW',
    false
FROM integrations WHERE slug = 'github';

INSERT INTO tool_definitions (integration_id, slug, name, description, input_schema, required_scopes, risk_level, requires_approval)
SELECT 
    id,
    'github.create_issue',
    'Create Issue',
    'Create a new issue in a GitHub repository',
    '{"type":"object","properties":{"owner":{"type":"string","description":"Repository owner/organization"},"repo":{"type":"string","description":"Repository name"},"title":{"type":"string","description":"Issue title"},"body":{"type":"string","description":"Issue body"}},"required":["owner","repo","title"]}'::jsonb,
    'repo',
    'MEDIUM',
    false
FROM integrations WHERE slug = 'github';

INSERT INTO tool_definitions (integration_id, slug, name, description, input_schema, required_scopes, risk_level, requires_approval)
SELECT 
    id,
    'calendar.list_events',
    'List Calendar Events',
    'List upcoming events from the user primary Google Calendar',
    '{"type":"object","properties":{"calendarId":{"type":"string","default":"primary"},"maxResults":{"type":"integer","default":20}}}'::jsonb,
    'https://www.googleapis.com/auth/calendar',
    'LOW',
    false
FROM integrations WHERE slug = 'google-calendar';

INSERT INTO tool_definitions (integration_id, slug, name, description, input_schema, required_scopes, risk_level, requires_approval)
SELECT 
    id,
    'calendar.create_event',
    'Create Calendar Event',
    'Create an event on the user Google Calendar',
    '{"type":"object","properties":{"summary":{"type":"string","description":"Event title"},"startDateTime":{"type":"string","description":"ISO-8601 start time (e.g. 2026-11-05T10:00:00Z)"},"endDateTime":{"type":"string","description":"ISO-8601 end time"},"description":{"type":"string"}},"required":["summary","startDateTime","endDateTime"]}'::jsonb,
    'https://www.googleapis.com/auth/calendar.events',
    'MEDIUM',
    false
FROM integrations WHERE slug = 'google-calendar';
