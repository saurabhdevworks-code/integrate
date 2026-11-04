-- Milestone 4: Comprehensive Tool Definitions for Gmail, GitHub, and Google Calendar

-- Additional Gmail tools
INSERT INTO tool_definitions (integration_id, slug, name, description, input_schema, required_scopes, risk_level, requires_approval)
SELECT 
    id,
    'gmail.get_email',
    'Get Email Details',
    'Fetch complete email content, headers, sender, recipients, and message body by ID',
    '{"type":"object","properties":{"messageId":{"type":"string","description":"Gmail message ID"}},"required":["messageId"]}'::jsonb,
    'https://www.googleapis.com/auth/gmail.readonly',
    'LOW',
    false
FROM integrations WHERE slug = 'gmail';

INSERT INTO tool_definitions (integration_id, slug, name, description, input_schema, required_scopes, risk_level, requires_approval)
SELECT 
    id,
    'gmail.create_draft',
    'Create Draft Email',
    'Create a draft email in user Gmail mailbox without sending it',
    '{"type":"object","properties":{"to":{"type":"string","format":"email","description":"Recipient email"},"subject":{"type":"string","description":"Subject line"},"body":{"type":"string","description":"Draft body"}},"required":["to","subject","body"]}'::jsonb,
    'https://www.googleapis.com/auth/gmail.compose',
    'LOW',
    false
FROM integrations WHERE slug = 'gmail';

INSERT INTO tool_definitions (integration_id, slug, name, description, input_schema, required_scopes, risk_level, requires_approval)
SELECT 
    id,
    'gmail.list_labels',
    'List Gmail Labels',
    'Retrieve all mailbox labels, system folders, and custom tags',
    '{"type":"object","properties":{}}'::jsonb,
    'https://www.googleapis.com/auth/gmail.readonly',
    'LOW',
    false
FROM integrations WHERE slug = 'gmail';

-- Additional GitHub tools
INSERT INTO tool_definitions (integration_id, slug, name, description, input_schema, required_scopes, risk_level, requires_approval)
SELECT 
    id,
    'github.list_issues',
    'List Repository Issues',
    'List issues in a GitHub repository with filter options (state: open, closed, all)',
    '{"type":"object","properties":{"owner":{"type":"string","description":"Repo owner"},"repo":{"type":"string","description":"Repo name"},"state":{"type":"string","enum":["open","closed","all"],"default":"open"},"perPage":{"type":"integer","default":30}},"required":["owner","repo"]}'::jsonb,
    'repo',
    'LOW',
    false
FROM integrations WHERE slug = 'github';

INSERT INTO tool_definitions (integration_id, slug, name, description, input_schema, required_scopes, risk_level, requires_approval)
SELECT 
    id,
    'github.get_issue',
    'Get Issue by Number',
    'Fetch issue title, state, description, author, labels, and timestamps',
    '{"type":"object","properties":{"owner":{"type":"string","description":"Repo owner"},"repo":{"type":"string","description":"Repo name"},"issueNumber":{"type":"integer","description":"Issue number"}},"required":["owner","repo","issueNumber"]}'::jsonb,
    'repo',
    'LOW',
    false
FROM integrations WHERE slug = 'github';

INSERT INTO tool_definitions (integration_id, slug, name, description, input_schema, required_scopes, risk_level, requires_approval)
SELECT 
    id,
    'github.create_issue_comment',
    'Add Issue Comment',
    'Post a new comment to an existing GitHub issue or pull request',
    '{"type":"object","properties":{"owner":{"type":"string","description":"Repo owner"},"repo":{"type":"string","description":"Repo name"},"issueNumber":{"type":"integer","description":"Issue number"},"body":{"type":"string","description":"Comment markdown body"}},"required":["owner","repo","issueNumber","body"]}'::jsonb,
    'repo',
    'MEDIUM',
    false
FROM integrations WHERE slug = 'github';

INSERT INTO tool_definitions (integration_id, slug, name, description, input_schema, required_scopes, risk_level, requires_approval)
SELECT 
    id,
    'github.list_pull_requests',
    'List Pull Requests',
    'List pull requests in a GitHub repository',
    '{"type":"object","properties":{"owner":{"type":"string","description":"Repo owner"},"repo":{"type":"string","description":"Repo name"},"state":{"type":"string","enum":["open","closed","all"],"default":"open"},"perPage":{"type":"integer","default":30}},"required":["owner","repo"]}'::jsonb,
    'repo',
    'LOW',
    false
FROM integrations WHERE slug = 'github';

-- Additional Google Calendar tools
INSERT INTO tool_definitions (integration_id, slug, name, description, input_schema, required_scopes, risk_level, requires_approval)
SELECT 
    id,
    'calendar.get_event',
    'Get Calendar Event',
    'Fetch detailed information about a specific calendar event by ID',
    '{"type":"object","properties":{"calendarId":{"type":"string","default":"primary"},"eventId":{"type":"string","description":"Google Calendar event ID"}},"required":["eventId"]}'::jsonb,
    'https://www.googleapis.com/auth/calendar',
    'LOW',
    false
FROM integrations WHERE slug = 'google-calendar';

INSERT INTO tool_definitions (integration_id, slug, name, description, input_schema, required_scopes, risk_level, requires_approval)
SELECT 
    id,
    'calendar.update_event',
    'Update Calendar Event',
    'Update summary, time, location, or description of an existing event',
    '{"type":"object","properties":{"calendarId":{"type":"string","default":"primary"},"eventId":{"type":"string","description":"Event ID"},"summary":{"type":"string"},"startDateTime":{"type":"string"},"endDateTime":{"type":"string"},"description":{"type":"string"}},"required":["eventId"]}'::jsonb,
    'https://www.googleapis.com/auth/calendar.events',
    'MEDIUM',
    false
FROM integrations WHERE slug = 'google-calendar';

INSERT INTO tool_definitions (integration_id, slug, name, description, input_schema, required_scopes, risk_level, requires_approval)
SELECT 
    id,
    'calendar.delete_event',
    'Delete Calendar Event',
    'Remove an event from user Google Calendar',
    '{"type":"object","properties":{"calendarId":{"type":"string","default":"primary"},"eventId":{"type":"string","description":"Event ID to delete"}},"required":["eventId"]}'::jsonb,
    'https://www.googleapis.com/auth/calendar.events',
    'HIGH',
    true
FROM integrations WHERE slug = 'google-calendar';

INSERT INTO tool_definitions (integration_id, slug, name, description, input_schema, required_scopes, risk_level, requires_approval)
SELECT 
    id,
    'calendar.get_free_busy',
    'Query Free/Busy Availability',
    'Query calendar availability for a set of users over a time window',
    '{"type":"object","properties":{"timeMin":{"type":"string","description":"ISO-8601 window start"},"timeMax":{"type":"string","description":"ISO-8601 window end"},"calendarId":{"type":"string","default":"primary"}},"required":["timeMin","timeMax"]}'::jsonb,
    'https://www.googleapis.com/auth/calendar',
    'LOW',
    false
FROM integrations WHERE slug = 'google-calendar';
