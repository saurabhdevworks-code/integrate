import { ConnectSession, CreateSessionParams } from '../types';

export class SessionsResource {
  constructor(private readonly request: <T>(path: string, options?: RequestInit) => Promise<T>) {}

  /**
   * Initiate a connection session for an end user and retrieve an OAuth connect URL.
   */
  async create(params: CreateSessionParams): Promise<ConnectSession> {
    return this.request<ConnectSession>('/connect/sessions', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  /**
   * Check status of a connection session by session ID.
   */
  async get(sessionId: string): Promise<ConnectSession> {
    return this.request<ConnectSession>(`/connect/sessions/${encodeURIComponent(sessionId)}`);
  }
}
