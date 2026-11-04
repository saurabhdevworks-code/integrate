import { ConnectedAccount } from '../types';

export class ConnectionsResource {
  constructor(private readonly request: <T>(path: string, options?: RequestInit) => Promise<T>) {}

  /**
   * List all connected external accounts authorized by end users.
   */
  async list(): Promise<ConnectedAccount[]> {
    return this.request<ConnectedAccount[]>('/connections');
  }

  /**
   * Get details of a specific connected account.
   */
  async get(connectionId: string): Promise<ConnectedAccount> {
    return this.request<ConnectedAccount>(`/connections/${encodeURIComponent(connectionId)}`);
  }

  /**
   * Disconnect and revoke a connected account, purging credentials from the Credential Vault.
   */
  async disconnect(connectionId: string): Promise<void> {
    await this.request<void>(`/connections/${encodeURIComponent(connectionId)}`, {
      method: 'DELETE',
    });
  }
}
