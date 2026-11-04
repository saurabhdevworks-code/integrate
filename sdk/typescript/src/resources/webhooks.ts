import { Webhook, CreateWebhookParams, WebhookDelivery } from '../types';
import * as crypto from 'crypto';

export class WebhooksResource {
  constructor(private readonly request: <T>(path: string, options?: RequestInit) => Promise<T>) {}

  /**
   * List all registered webhooks for this project.
   */
  async list(): Promise<Webhook[]> {
    return this.request<Webhook[]>('/webhooks');
  }

  /**
   * Register a new webhook endpoint.
   */
  async create(params: CreateWebhookParams): Promise<Webhook> {
    return this.request<Webhook>('/webhooks', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  /**
   * Get details of a registered webhook by ID.
   */
  async get(webhookId: string): Promise<Webhook> {
    return this.request<Webhook>(`/webhooks/${webhookId}`);
  }

  /**
   * Delete a webhook.
   */
  async delete(webhookId: string): Promise<void> {
    return this.request<void>(`/webhooks/${webhookId}`, {
      method: 'DELETE',
    });
  }

  /**
   * List recent delivery attempts for a webhook.
   */
  async listDeliveries(webhookId: string): Promise<WebhookDelivery[]> {
    return this.request<WebhookDelivery[]>(`/webhooks/${webhookId}/deliveries`);
  }

  /**
   * Send a test ping event to verify the webhook receiver endpoint.
   */
  async test(webhookId: string): Promise<WebhookDelivery> {
    return this.request<WebhookDelivery>(`/webhooks/${webhookId}/test`, {
      method: 'POST',
    });
  }

  /**
   * Verify an incoming webhook signature using HMAC-SHA256 and constant-time comparison.
   *
   * @param secret The webhook signing secret ('whsec_...')
   * @param signatureHeader The header value from 'X-IntegrationPlatform-Signature'
   * @param payload Raw request body string
   * @param toleranceSeconds Max age of signature in seconds (default: 300)
   */
  verifySignature(
    secret: string,
    signatureHeader: string,
    payload: string,
    toleranceSeconds = 300
  ): boolean {
    if (!secret || !signatureHeader || !payload) {
      return false;
    }

    try {
      let timestamp: number | null = null;
      let receivedSig: string | null = null;

      const parts = signatureHeader.split(',');
      for (const part of parts) {
        const [k, v] = part.split('=').map(s => s.trim());
        if (k === 't') timestamp = parseInt(v, 10);
        if (k === 'v1') receivedSig = v;
      }

      if (!timestamp || !receivedSig) {
        return false;
      }

      const now = Math.floor(Date.now() / 1000);
      if (toleranceSeconds > 0 && Math.abs(now - timestamp) > toleranceSeconds) {
        return false;
      }

      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(`${timestamp}.${payload}`);
      const expectedSig = hmac.digest('hex');

      const expectedBuffer = Buffer.from(expectedSig, 'utf8');
      const receivedBuffer = Buffer.from(receivedSig, 'utf8');

      if (expectedBuffer.length !== receivedBuffer.length) {
        return false;
      }

      return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
    } catch {
      return false;
    }
  }
}
