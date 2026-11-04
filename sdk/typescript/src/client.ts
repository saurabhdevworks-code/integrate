import { ClientConfig } from './types';
import { ToolsResource } from './resources/tools';
import { ConnectionsResource } from './resources/connections';
import { SessionsResource } from './resources/sessions';
import { ExecutionsResource } from './resources/executions';
import { WebhooksResource } from './resources/webhooks';

export class IntegrationClient {
  public readonly tools: ToolsResource;
  public readonly connections: ConnectionsResource;
  public readonly sessions: SessionsResource;
  public readonly executions: ExecutionsResource;
  public readonly webhooks: WebhooksResource;

  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor(config: ClientConfig) {
    if (!config || !config.apiKey) {
      throw new Error('API key is required to initialize IntegrationClient (e.g. "ip_live_...")');
    }

    this.apiKey = config.apiKey.trim();
    this.baseUrl = (config.baseUrl || 'http://localhost:8080').replace(/\/+$/, '') + '/v1';
    this.timeoutMs = config.timeoutMs || 30000;

    const boundRequest = this.request.bind(this);
    this.tools = new ToolsResource(boundRequest);
    this.connections = new ConnectionsResource(boundRequest);
    this.sessions = new SessionsResource(boundRequest);
    this.executions = new ExecutionsResource(boundRequest);
    this.webhooks = new WebhooksResource(boundRequest);
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${path.startsWith('/') ? path : '/' + path}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      'X-API-Key': this.apiKey,
      'User-Agent': 'IntegrationPlatform-NodeSDK/0.1.0',
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...(options.headers || {}),
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        let errorMessage = `API Request failed with HTTP ${response.status}`;
        try {
          const errorJson = await response.json();
          errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch {
          // ignore
        }
        throw new Error(errorMessage);
      }

      if (response.status === 204) {
        return {} as T;
      }

      return (await response.json()) as T;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
