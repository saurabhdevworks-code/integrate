const RAW_API_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) || '';
const API_BASE = RAW_API_URL
  ? (RAW_API_URL.endsWith('/api') ? RAW_API_URL : `${RAW_API_URL.replace(/\/+$/, '')}/api`)
  : '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  // Only attach Bearer token if it is a valid signed JWT (starts with eyJ)
  if (token && token.startsWith('eyJ')) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    let errorMsg = `Request failed (${res.status})`;
    try {
      const errorJson = await res.json();
      errorMsg = errorJson.message || (errorJson.details && errorJson.details.join(', ')) || errorMsg;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  if (res.status === 204) {
    return {} as T;
  }

  return res.json();
}

export interface AuthResponse {
  token: string;
  userId: string;
  email: string;
  defaultOrganization?: Organization;
}

export interface UserProfile {
  id: string;
  email: string;
  status: string;
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  currentUserRole: string;
  createdAt: string;
}

export interface Project {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  environments: string[];
  createdAt: string;
}

export interface ApiKey {
  id: string;
  projectId: string;
  name: string;
  keyPrefix: string;
  environment: string;
  expiresAt: string | null;
  revokedAt: string | null;
  active: boolean;
  createdAt: string;
}

export interface ApiKeyCreatedResponse {
  id: string;
  projectId: string;
  name: string;
  keyPrefix: string;
  rawKey: string;
  environment: string;
  expiresAt: string | null;
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

export interface ProviderConfigResponse {
  id: string | null;
  projectId: string;
  integrationSlug: string;
  clientId: string | null;
  redirectUri: string | null;
  scopes: string | null;
  configured: boolean;
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

export interface OAuthInitiateResponse {
  authorizationUrl: string;
  stateToken: string;
  expiresAt: string;
}

export interface ToolDefinition {
  id: string;
  integrationSlug: string;
  integrationName: string;
  slug: string;
  name: string;
  description: string;
  inputSchema: any;
  requiredScopes: string | null;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  requiresApproval: boolean;
  version: string;
}

export interface ConnectSessionResponse {
  id: string;
  integrationSlug: string;
  projectUserId: string;
  connectUrl: string | null;
  status: 'PENDING' | 'COMPLETED' | 'EXPIRED';
  returnUrl?: string | null;
  connectedAccountId?: string | null;
  expiresAt: string;
  createdAt: string;
}

export interface ExecutionResponse {
  id: string;
  projectId: string;
  toolSlug: string;
  projectUserId: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'PENDING_APPROVAL' | 'REJECTED';
  output: any;
  errorMessage: string | null;
  durationMs: number | null;
  startedAt: string;
  completedAt: string | null;
  requiresApproval: boolean;
  approvalId: string | null;
}

export interface ApprovalResponse {
  id: string;
  executionId: string;
  projectId: string;
  toolSlug: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reason: string | null;
  createdAt: string;
  decidedAt: string | null;
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

export interface DailyUsageDto {
  date: string;
  executions: number;
  successful: number;
  failed: number;
  totalDurationMs: number;
  averageDurationMs: number;
}

export interface UsageSummaryResponse {
  projectId: string;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  successRatePercent: number;
  averageDurationMs: number;
  dailyBreakdown: DailyUsageDto[];
}

export const api = {
  signup: (email: string, password: string, organizationName?: string) =>
    request<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, organizationName }),
    }),

  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  listOrganizations: () => request<Organization[]>('/organizations'),

  createOrganization: (name: string) =>
    request<Organization>('/organizations', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),

  listProjects: (orgId: string) =>
    request<Project[]>(`/organizations/${orgId}/projects`),

  createProject: (orgId: string, name: string) =>
    request<Project>(`/organizations/${orgId}/projects`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),

  listApiKeys: (projectId: string) =>
    request<ApiKey[]>(`/projects/${projectId}/api-keys`),

  createApiKey: (projectId: string, name: string, environment: 'TEST' | 'LIVE', expiresAt?: string) =>
    request<ApiKeyCreatedResponse>(`/projects/${projectId}/api-keys`, {
      method: 'POST',
      body: JSON.stringify({ name, environment, expiresAt }),
    }),

  revokeApiKey: (projectId: string, apiKeyId: string) =>
    request<void>(`/projects/${projectId}/api-keys/${apiKeyId}/revoke`, {
      method: 'POST',
    }),

  toggleApiKey: (projectId: string, apiKeyId: string, enable: boolean) =>
    request<ApiKey>(`/projects/${projectId}/api-keys/${apiKeyId}/toggle?enable=${enable}`, {
      method: 'PATCH',
    }),

  deleteApiKey: (projectId: string, apiKeyId: string) =>
    request<void>(`/projects/${projectId}/api-keys/${apiKeyId}`, {
      method: 'DELETE',
    }),

  listIntegrations: (projectId: string) =>
    request<Integration[]>(`/projects/${projectId}/integrations`),

  configureProvider: (projectId: string, slug: string, clientId: string, clientSecret: string, redirectUri: string, scopes?: string) =>
    request<ProviderConfigResponse>(`/projects/${projectId}/integrations/${slug}/configure`, {
      method: 'POST',
      body: JSON.stringify({ clientId, clientSecret, redirectUri, scopes }),
    }),

  toggleIntegration: (projectId: string, slug: string) =>
    request<{ enabled: boolean }>(`/projects/${projectId}/integrations/${slug}/toggle`, {
      method: 'POST'
    }),

  initiateOAuth: (projectId: string, integrationSlug: string, projectUserId: string, redirectUri?: string) =>
    request<OAuthInitiateResponse>(`/projects/${projectId}/oauth/initiate`, {
      method: 'POST',
      body: JSON.stringify({ integrationSlug, projectUserId, redirectUri }),
    }),

  listConnectedAccounts: (projectId: string) =>
    request<ConnectedAccount[]>(`/projects/${projectId}/connected-accounts`),

  disconnectAccount: (projectId: string, accountId: string) =>
    request<void>(`/projects/${projectId}/connected-accounts/${accountId}/disconnect`, {
      method: 'POST',
    }),

  // Milestone 3: Tools & Execution Engine
  listTools: (projectId: string) =>
    request<ToolDefinition[]>(`/projects/${projectId}/tools`),

  executeTool: (projectId: string, projectUserId: string, tool: string, input: any, connectedAccountId?: string, idempotencyKey?: string) =>
    request<ExecutionResponse>(`/projects/${projectId}/tools/execute`, {
      method: 'POST',
      body: JSON.stringify({ projectUserId, tool, input, connectedAccountId, idempotencyKey }),
    }),

  listExecutions: (projectId: string) =>
    request<ExecutionResponse[]>(`/projects/${projectId}/executions`),

  listApprovals: (projectId: string) =>
    request<ApprovalResponse[]>(`/projects/${projectId}/approvals`),

  decideApproval: (projectId: string, approvalId: string, decision: 'APPROVE' | 'REJECT', reason?: string) =>
    request<ApprovalResponse>(`/projects/${projectId}/approvals/${approvalId}/decide`, {
      method: 'POST',
      body: JSON.stringify({ decision, reason }),
    }),

  // Milestone 6: Webhooks & Usage
  listWebhooks: (projectId: string) =>
    request<Webhook[]>(`/projects/${projectId}/webhooks`),

  createWebhook: (projectId: string, url: string, events?: string[]) =>
    request<Webhook>(`/projects/${projectId}/webhooks`, {
      method: 'POST',
      body: JSON.stringify({ url, events }),
    }),

  deleteWebhook: (projectId: string, webhookId: string) =>
    request<void>(`/projects/${projectId}/webhooks/${webhookId}`, {
      method: 'DELETE',
    }),

  listWebhookDeliveries: (projectId: string, webhookId: string) =>
    request<WebhookDelivery[]>(`/projects/${projectId}/webhooks/${webhookId}/deliveries`),

  testWebhook: (projectId: string, webhookId: string) =>
    request<WebhookDelivery>(`/projects/${projectId}/webhooks/${webhookId}/test`, {
      method: 'POST',
    }),

  getUsage: (projectId: string, days = 30) =>
    request<UsageSummaryResponse>(`/projects/${projectId}/usage?days=${days}`),
};
