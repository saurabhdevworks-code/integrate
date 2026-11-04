export interface ClientConfig {
  apiKey: string;
  baseUrl?: string;
  timeoutMs?: number;
}

export interface ToolDefinition {
  id: string;
  integrationSlug: string;
  integrationName: string;
  slug: string;
  name: string;
  description: string;
  inputSchema: Record<string, any>;
  requiredScopes: string | null;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  requiresApproval: boolean;
  version: string;
}

export interface ExecuteToolParams {
  projectUserId: string;
  connectedAccountId?: string;
  tool: string;
  input: Record<string, any>;
  idempotencyKey?: string;
}

export interface ExecutionResult<T = any> {
  id: string;
  projectId: string;
  toolSlug: string;
  projectUserId: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'PENDING_APPROVAL' | 'REJECTED';
  output: T | null;
  errorMessage: string | null;
  durationMs: number | null;
  startedAt: string;
  completedAt: string | null;
  requiresApproval: boolean;
  approvalId: string | null;
}

export interface ConnectedAccount {
  id: string;
  projectId: string;
  integrationSlug: string;
  integrationName: string;
  projectUserId: string;
  providerAccountId: string | null;
  accountEmail: string | null;
  accountName: string | null;
  status: 'CONNECTED' | 'EXPIRED' | 'REVOKED' | 'ERROR';
  grantedScopes: string | null;
  tokenExpiresAt: string | null;
  createdAt: string;
}

export interface CreateSessionParams {
  integrationSlug: string;
  projectUserId: string;
  returnUrl?: string;
}

export interface ConnectSession {
  sessionId: string;
  integrationSlug: string;
  projectUserId: string;
  connectUrl: string;
  status: 'PENDING' | 'COMPLETED' | 'EXPIRED';
  returnUrl: string | null;
  connectedAccountId: string | null;
  expiresAt: string;
  createdAt: string;
}

export interface Integration {
  id: string;
  slug: string;
  name: string;
  category: string;
  authType: string;
  defaultScopes: string;
  iconUrl: string | null;
  documentationUrl: string | null;
  enabled: boolean;
  configured: boolean;
}

export interface Webhook {
  id: string;
  projectId: string;
  url: string;
  secret: string;
  events: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWebhookParams {
  url: string;
  events?: string[];
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  projectId: string;
  eventType: string;
  payload: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  httpStatusCode: number | null;
  responseBody: string | null;
  attemptCount: number;
  nextRetryAt: string | null;
  createdAt: string;
  deliveredAt: string | null;
}
