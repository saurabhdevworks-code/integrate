# Integration-as-a-Service TypeScript SDK

Official TypeScript & Node.js client library for the Integration-as-a-Service Platform (similar to Composio). Connect your users' apps and execute actions through one unified API.

## Installation

```bash
npm install @integrationplatform/sdk
```

## Quick Start

### 1. Initialize Client
```typescript
import { IntegrationClient } from '@integrationplatform/sdk';

const client = new IntegrationClient({
  apiKey: process.env.INTEGRATION_API_KEY!, // Project API key e.g. "ip_live_..."
  baseUrl: 'http://localhost:8080' // Optional, defaults to production
});
```

### 2. Connect an End User (Hosted Connect Session)
```typescript
// Create a hosted connection session for your user
const session = await client.sessions.create({
  integrationSlug: 'gmail',
  projectUserId: 'user_123',
  returnUrl: 'https://myapp.com/settings/integrations'
});

// Redirect user to authorization URL
console.log('Connect URL:', session.connectUrl);
```

### 3. Discover Available Tools
```typescript
const tools = await client.tools.list();
console.log('Supported tools:', tools.map(t => t.slug));
// Output: ['gmail.search_emails', 'gmail.send_email', 'github.create_issue', ...]
```

### 4. Execute an Action (Unified API)
```typescript
// Search Gmail on behalf of user_123
const result = await client.tools.execute({
  projectUserId: 'user_123',
  tool: 'gmail.search_emails',
  input: {
    query: 'from:recruiter@example.com is:unread',
    maxResults: 5
  },
  idempotencyKey: 'search-req-98765'
});

console.log('Status:', result.status);
console.log('Output:', result.output);
```

### 5. Create a GitHub Issue
```typescript
const issue = await client.tools.execute({
  projectUserId: 'user_123',
  tool: 'github.create_issue',
  input: {
    owner: 'my-org',
    repo: 'my-project',
    title: 'Customer Feedback Integration Request',
    body: 'Automated issue created from customer ticket #456.'
  }
});
```

### 6. Manage Connections
```typescript
// List user connections
const connections = await client.connections.list();

// Revoke access
await client.connections.disconnect(connections[0].id);
```

### 7. Receive & Verify Webhook Events
```typescript
// Register a webhook endpoint
const webhook = await client.webhooks.create({
  url: 'https://myapp.com/api/webhooks',
  events: ['connection.created', 'execution.succeeded', 'approval.required']
});
console.log('Webhook Secret:', webhook.secret); // Save safely!

// In your Express or Next.js route:
app.post('/api/webhooks', (req, res) => {
  const signature = req.headers['x-integrationplatform-signature'] as string;
  const rawBody = req.rawBody; // Must be raw string body

  const isValid = client.webhooks.verifySignature(webhook.secret, signature, rawBody);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid HMAC signature' });
  }

  const { event, data } = JSON.parse(rawBody);
  console.log(`Received ${event}:`, data);
  res.status(200).send('OK');
});
```

## Security Best Practices
- Never embed your secret `ip_live_` API key in frontend/client-side code.
- Always perform tool executions from your backend server.
- Pass unique `idempotencyKey` strings for non-idempotent actions (like sending emails or creating events) to prevent duplicate execution during retries.
