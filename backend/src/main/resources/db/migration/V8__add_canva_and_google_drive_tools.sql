-- V8: Add Canva Integration and Google Drive & Canva Tools
INSERT INTO integrations (slug, name, category, auth_type, default_scopes, documentation_url)
VALUES
('canva', 'Canva', 'DESIGN', 'OAUTH2', 'design:content:read design:content:write asset:read asset:write', 'https://www.canva.dev/docs/connect/')
ON CONFLICT (slug) DO NOTHING;

-- Google Drive Tools
INSERT INTO tool_definitions (integration_id, slug, name, description, input_schema, required_scopes, risk_level, requires_approval)
SELECT 
    id,
    'google_drive.list_files',
    'Search & List Files',
    'Search and list files, folders, and shared assets in Google Drive',
    '{"type":"object","properties":{"query":{"type":"string","description":"Search query term or name filter"},"pageSize":{"type":"integer","default":20}},"required":[]}'::jsonb,
    'https://www.googleapis.com/auth/drive.file',
    'LOW',
    false
FROM integrations WHERE slug = 'google_drive'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO tool_definitions (integration_id, slug, name, description, input_schema, required_scopes, risk_level, requires_approval)
SELECT 
    id,
    'google_drive.get_file',
    'Get File Metadata',
    'Fetch complete metadata, sharing permissions, and download links by file ID',
    '{"type":"object","properties":{"fileId":{"type":"string","description":"Google Drive File ID"}},"required":["fileId"]}'::jsonb,
    'https://www.googleapis.com/auth/drive.file',
    'LOW',
    false
FROM integrations WHERE slug = 'google_drive'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO tool_definitions (integration_id, slug, name, description, input_schema, required_scopes, risk_level, requires_approval)
SELECT 
    id,
    'google_drive.upload_file',
    'Upload File to Drive',
    'Upload a new document, image, or text asset to Google Drive',
    '{"type":"object","properties":{"name":{"type":"string","description":"File name with extension"},"content":{"type":"string","description":"File content or data URI"},"folderId":{"type":"string","description":"Destination folder ID"}},"required":["name","content"]}'::jsonb,
    'https://www.googleapis.com/auth/drive.file',
    'LOW',
    false
FROM integrations WHERE slug = 'google_drive'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO tool_definitions (integration_id, slug, name, description, input_schema, required_scopes, risk_level, requires_approval)
SELECT 
    id,
    'google_drive.create_folder',
    'Create Folder',
    'Create a new folder in Google Drive',
    '{"type":"object","properties":{"name":{"type":"string","description":"Folder name"},"parentFolderId":{"type":"string","description":"Parent folder ID (optional)"}},"required":["name"]}'::jsonb,
    'https://www.googleapis.com/auth/drive.file',
    'LOW',
    false
FROM integrations WHERE slug = 'google_drive'
ON CONFLICT (slug) DO NOTHING;

-- Canva Tools
INSERT INTO tool_definitions (integration_id, slug, name, description, input_schema, required_scopes, risk_level, requires_approval)
SELECT 
    id,
    'canva.create_design',
    'Create New Design',
    'Create a new Canva design project with specified dimensions, type, and title',
    '{"type":"object","properties":{"title":{"type":"string","description":"Design title"},"designType":{"type":"string","description":"Template type e.g. presentation, social_media"},"width":{"type":"integer","default":1920},"height":{"type":"integer","default":1080}},"required":["title"]}'::jsonb,
    'design:content:write',
    'LOW',
    false
FROM integrations WHERE slug = 'canva'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO tool_definitions (integration_id, slug, name, description, input_schema, required_scopes, risk_level, requires_approval)
SELECT 
    id,
    'canva.get_design',
    'Get Design Details',
    'Retrieve metadata, thumbnail preview, and edit links for a design by ID',
    '{"type":"object","properties":{"designId":{"type":"string","description":"Canva Design ID"}},"required":["designId"]}'::jsonb,
    'design:content:read',
    'LOW',
    false
FROM integrations WHERE slug = 'canva'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO tool_definitions (integration_id, slug, name, description, input_schema, required_scopes, risk_level, requires_approval)
SELECT 
    id,
    'canva.export_design',
    'Export Design Asset',
    'Export a Canva design to PDF, PNG, JPG, or MP4 format',
    '{"type":"object","properties":{"designId":{"type":"string","description":"Canva Design ID"},"format":{"type":"string","enum":["pdf","png","jpg","mp4"],"default":"png"}},"required":["designId","format"]}'::jsonb,
    'design:content:read',
    'LOW',
    false
FROM integrations WHERE slug = 'canva'
ON CONFLICT (slug) DO NOTHING;
