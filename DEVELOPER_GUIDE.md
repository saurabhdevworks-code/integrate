# Developer Guide & Platform Manual (Developer POV)

> **Welcome to the Integration-as-a-Service (IaaS) Platform!**  
> This comprehensive manual explains how to use, integrate, and extend the platform from a **Developer Point of View (POV)** — whether you are building an AI agent, a SaaS product, a workflow automation engine, or backend microservices.

---

## 📑 Table of Contents
1. [Core Mental Model & Architecture](#1-core-mental-model--architecture)
2. [🎯 Just Like Composio: Concept Mapping & 3-Step Integration](#2--just-like-composio-concept-mapping--3-step-integration)
3. [🏆 Why Our Platform is Better Than Composio (What is BEST in Our Platform)](#3--why-our-platform-is-better-than-composio-what-is-best-in-our-platform)
4. [🚀 Ultra-Simple Guide: How to Use This in Your Project (3 Steps)](#4--ultra-simple-guide-how-to-use-this-in-your-project-3-steps)
5. [Quick Launch & Environment Setup](#5-quick-launch--environment-setup)
6. [End-to-End Developer Workflow](#6-end-to-end-developer-workflow)
7. [Authentication & API Key Management](#7-authentication--api-key-management)
8. [Connecting Accounts (Developer Master SSO vs End-User Connect)](#8-connecting-accounts)
9. [Tool Discovery & Tool Explorer](#9-tool-discovery--tool-explorer)
10. [Programmatic Tool Execution](#10-programmatic-tool-execution)
   - [REST API (cURL / HTTP)](#rest-api-curl--http)
   - [Official TypeScript SDK](#official-typescript-sdk)
   - [Python & AI Agent Function Calling (OpenAI / Gemini / Claude)](#python--ai-agent-integration)
   - [Model Context Protocol (MCP) for Cursor / Claude Desktop](#model-context-protocol-mcp)
11. [Risk Governance & Human-in-the-Loop Approvals](#11-risk-governance--human-in-the-loop-approvals)
12. [Webhooks & Real-Time Event Subscriptions](#12-webhooks--real-time-event-subscriptions)
13. [Rate Limits & Usage Monitoring](#13-rate-limits--usage-monitoring)
14. [How to Add a New Integration or Tool](#14-how-to-add-a-new-integration-or-tool)
15. [API Reference & Troubleshooting](#15-api-reference--troubleshooting)

---

## 1. Core Mental Model & Architecture

### What problem does this platform solve?
Building direct integrations with external services (Gmail, GitHub, Salesforce, Canva, Google Drive, Slack, etc.) normally forces developers to:
- Implement separate OAuth 2.0 PKCE dance for every provider.
- Safely store refresh tokens in an encrypted vault.
- Handle token rotation, rate limits, and network retries.
- Map distinct API schemas and payloads into standard agent tools.

---

## 2. 🎯 Just Like Composio: Concept Mapping & 3-Step Integration

If you have used **Composio**, **Nango**, or **Merge.dev**, you will feel right at home. Here is how every concept in our platform maps 1:1 to Composio:

| Composio Concept | Our Platform Equivalent | What It Does In Your App |
| :--- | :--- | :--- |
| **`Composio(api_key="...")`** | **`new IntegrationClient({ apiKey: "pk_live_..." })`** | Initializes the SDK with your project API key |
| **`entity_id`** (e.g. `"user_123"`) | **`projectUserId`** (e.g. `"user_123"`) | Identifies which end-user's account is performing the action |
| **`composio.get_authorization_url()`** | **`POST /v1/connect/sessions`** | Generates a 1-click hosted OAuth onboarding link for your user |
| **`composio.get_tools(apps=['GMAIL'])`** | **`GET /v1/tools`** / `client.tools.list()` | Returns OpenAI / Gemini / Claude compatible tool JSON schemas |
| **`Action.GMAIL_SEND_EMAIL`** | **`toolSlug: "gmail.send_email"`** | Identifies the action to execute |
| **`composio.execute(...)`** | **`POST /v1/tools/execute`** / `client.tools.execute(...)` | Runs the external API call using tokens securely stored in AES-256-GCM Vault |
| **Triggers / Event Listeners** | **`POST /v1/webhooks`** | Delivers real-time execution & connection updates with HMAC-SHA256 signatures |
| **Composio CLI / MCP** | **`POST /v1/mcp`** / `bin/mcp-server.js` | Plugs directly into Cursor, Claude Desktop, and Zed |

---

### The 3-Step Composio-Style Workflow in Your Application:

```mermaid
sequenceDiagram
    autonumber
    actor User as Your App User (user_123)
    participant App as Your App Backend / AI Agent
    participant Plat as Integration Platform (Port 8080)
    participant LLM as OpenAI / Claude / Gemini
    participant Ext as Gmail / GitHub / Drive

    Note over User,Plat: STEP 1: Connect User Account (Once)
    User->>App: Clicks "Connect Gmail" inside your app
    App->>Plat: POST /v1/connect/sessions (projectUserId: "user_123", app: "gmail")
    Plat-->>App: Returns connectUrl (http://localhost:5173/connect?session=...)
    App-->>User: Redirects user to connectUrl
    User->>Ext: Authorizes Google OAuth screen
    Ext-->>Plat: Secure token saved in AES-256-GCM Vault

    Note over User,Plat: STEP 2: AI Agent Gets Tools
    App->>Plat: GET /v1/tools
    Plat-->>App: Returns tool definitions with JSON Schemas
    App->>LLM: Prompts model with tools + user query: "Draft an email to Bob"
    LLM-->>App: Returns tool_call: gmail.create_draft(to="bob@acme.com", subject="Meeting")

    Note over User,Plat: STEP 3: Execute Action
    App->>Plat: POST /v1/tools/execute (toolSlug, projectUserId: "user_123", args)
    Plat->>Ext: Makes authenticated Gmail API request with decrypted vault token
    Ext-->>Plat: Email draft created
    Plat-->>App: { status: "COMPLETED", output: { draftId: "r1289" } }
    App-->>User: "Your draft has been created in Gmail!"
```

#### Step 1: Connect your user's account (TypeScript Backend)
```typescript
// in your Express / Next.js API route: /api/connect-google
import { IntegrationClient } from '@integrationplatform/sdk';

const client = new IntegrationClient({
  apiKey: process.env.INTEGRATION_API_KEY! // pk_live_...
});

export async function handleConnect(req, res) {
  const currentUserId = req.session.userId; // e.g. "usr_abc123"

  // 1. Create a hosted connect session
  const session = await client.sessions.create({
    projectUserId: currentUserId,
    integrationSlug: 'gmail',
    redirectUrl: 'https://yourapp.com/dashboard/integrations'
  });

  // 2. Redirect your user to the hosted connection page
  return res.redirect(session.connectUrl);
}
```

#### Step 2: Pass tools to OpenAI & execute automatically (TypeScript AI Agent)
```typescript
import OpenAI from 'openai';
import { IntegrationClient } from '@integrationplatform/sdk';

const openai = new OpenAI();
const client = new IntegrationClient({ apiKey: process.env.INTEGRATION_API_KEY! });

async function runAgent(userPrompt: string, userId: string) {
  // 1. Fetch available platform tools formatted for OpenAI
  const availableTools = await client.tools.list();
  const toolsForOpenAI = availableTools.map(t => ({
    type: 'function' as const,
    function: {
      name: t.slug.replace('.', '__'), // e.g. "gmail__send_email"
      description: t.description,
      parameters: t.inputSchema
    }
  }));

  // 2. Send prompt to LLM
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: userPrompt }],
    tools: toolsForOpenAI,
    tool_choice: 'auto'
  });

  const toolCall = response.choices[0].message.tool_calls?.[0];
  if (!toolCall) {
    return response.choices[0].message.content;
  }

  // 3. Execute tool call on the Integration Platform just like Composio!
  const toolSlug = toolCall.function.name.replace('__', '.'); // e.g. "gmail.send_email"
  const args = JSON.parse(toolCall.function.arguments);

  const result = await client.tools.execute({
    toolSlug: toolSlug,
    projectUserId: userId, // user whose Gmail will be used!
    arguments: args
  });

  console.log('Action Output from External API:', result.output);
  return result.output;
}
```

---

## 3. 🏆 Why Our Platform is Better Than Composio (What is BEST in Our Platform)

While Composio is a closed, third-party cloud SaaS, our platform is built from the ground up for **complete data ownership, zero recurring cost, and friction-free developer experience**.

| Feature | Composio | Hamara Platform | Why Hamara Platform is Better |
| :--- | :--- | :--- | :--- |
| **Data Privacy & Control** | Your user's tokens reside on Composio's cloud servers | **100% Self-Hosted & Private** | **Zero Data Leakage:** Your OAuth tokens never leave your private VPC/database. |
| **Cost & Quotas** | **$29 to $299+/month** (Tier-based execution limits) | **$0 Free & Unlimited** | **No Hidden Fees:** Unlimited tool executions, unlimited connected accounts, zero billing headaches. |
| **Local Dev Experience** | Manual OAuth popups for each connector | **Master SSO 1-Click Workspace Trust** | **Zero OAuth Popups in Dev:** Log in once (`saurabh.devworks@gmail.com`) and all connectors auto-trust instantly. |
| **High-Risk Governance** | Programmatic hooks only (requires custom code) | **Built-in Visual Approvals UI** | **Human-in-the-Loop Tab:** Admins can view pending emails/actions and click Approve/Reject in real time. |
| **Credential Encryption** | Hosted Cloud KMS | **Bank-Grade AES-256-GCM Vault** | NIST SP 800-38D compliant with 12-byte random IVs and 128-bit authentication integrity tags. |
| **Zero-Docker Embedded Run** | Requires heavy setup or cloud lock-in | **1-Click Embedded Mode (`run.cmd`)** | Boots in seconds with embedded H2 local database (`./data/integrationdb`) — zero Docker required. |
| **Model Context Protocol (MCP)**| Relies on external CLI packages | **Direct `/v1/mcp` JSON-RPC Endpoint** | Native Claude Desktop, Cursor, and Zed support built right into the platform. |

---

## 4. 🚀 Ultra-Simple Guide: How to Use This in Your Project (3 Steps)

You don't need complicated setups to integrate this into your existing app or AI agent. Here is the easiest 3-step copy-paste workflow:

### Step 1: Start Platform & Grab Your API Key
1. Run `run.cmd` in the platform folder.
2. Open `http://localhost:5173`, connect your Master SSO account, go to **API Keys**, and click `＋ Generate New Key`.
3. Copy your key: `pk_live_your_key_here`.

---

### Step 2: Choose How Your Users Connect

#### Option A: Quick Testing & Personal Agent (Fastest — 0 seconds)
Use your Master SSO email (e.g. `saurabh.devworks@gmail.com`) as the `projectUserId`. All enabled connectors are already authorized!

#### Option B: For Users in Your SaaS App (Hosted 1-Click Redirect)
When a user clicks "Connect Gmail" in your app, generate an onboarding link:
```bash
curl -X POST http://localhost:8080/v1/connect/sessions \
  -H "X-API-Key: pk_live_..." \
  -H "Content-Type: application/json" \
  -d '{
    "projectUserId": "customer_456",
    "integrationSlug": "gmail",
    "redirectUrl": "https://yourapp.com/dashboard"
  }'
```
Redirect them to the returned `connectUrl`. When they finish Google OAuth, the platform automatically vaults the credentials!

---

### Step 3: Call Any Tool From Your Code

#### 💻 In TypeScript / Node.js Backend:
```typescript
import { IntegrationClient } from '@integrationplatform/sdk';

const client = new IntegrationClient({
  apiKey: 'pk_live_...',
  baseUrl: 'http://localhost:8080'
});

// Run any action for any user in 3 lines:
const result = await client.tools.execute({
  toolSlug: 'gmail.send_email',
  projectUserId: 'saurabh.devworks@gmail.com', // or "customer_456"
  arguments: {
    to: 'partner@acme.com',
    subject: 'Contract Approved',
    body: 'Hello, the agreement is signed!'
  }
});

console.log('Result:', result.output);
```

#### 🐍 In Python / LangChain / CrewAI:
```python
import requests

def run_tool(tool_slug, user_id, arguments):
    res = requests.post(
        "http://localhost:8080/v1/tools/execute",
        headers={"X-API-Key": "pk_live_...", "Content-Type": "application/json"},
        json={"toolSlug": tool_slug, "projectUserId": user_id, "arguments": arguments}
    )
    return res.json()

# Execute Canva, GitHub, Drive, or Gmail:
res = run_tool("google_drive.upload_file", "saurabh.devworks@gmail.com", {
    "name": "Report.pdf",
    "content": "data:application/pdf;base64,..."
})
print("Upload status:", res)
```

#### 🌐 Using Direct cURL / REST API:
```bash
curl -X POST http://localhost:8080/v1/tools/execute \
  -H "X-API-Key: pk_live_..." \
  -H "Content-Type: application/json" \
  -d '{
    "toolSlug": "github.create_issue",
    "projectUserId": "saurabh.devworks@gmail.com",
    "arguments": {
      "owner": "my-team",
      "repo": "webapp",
      "title": "Bug in billing page"
    }
  }'
```

---

## 5. Quick Launch & Environment Setup

### Prerequisites
- **Java 21 JDK** installed.
- **Node.js 20+** installed.
- **Maven 3.9+** (installed at `C:\Tools\apache-maven-3.9.16\bin\mvn.cmd` or in your system `PATH`).

### Starting Both Services (1-Click)
Run `run.cmd` or double-click `run-all.bat` from the project root:
```cmd
# From the root directory:
run.cmd
```
This launches:
1. **Backend Service** (Spring Boot 3.4.2 on port `8080`)
2. **Frontend Console** (Vite + React 18 on port `5173`)

### Service URL Endpoints:
| Interface | URL | Purpose |
| :--- | :--- | :--- |
| **Developer Dashboard** | `http://localhost:5173` | Manage keys, test tools, view logs & approvals |
| **Swagger UI / OpenAPI** | `http://localhost:8080/swagger-ui.html` | Interactive API documentation |
| **H2 Local Database Console** | `http://localhost:8080/h2-console` | View local tables & schemas (JDBC URL: `jdbc:h2:file:./data/integrationdb`) |
| **Actuator Health** | `http://localhost:8080/actuator/health` | Live platform health checks |
| **MCP JSON-RPC Endpoint** | `http://localhost:8080/v1/mcp` | Model Context Protocol stream for AI assistants |

---

## 6. End-to-End Developer Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Dev as Developer / AI Agent
    participant Dash as Dashboard (UI)
    participant API as Integration API (/v1)
    participant Ext as External SaaS (Gmail, Canva...)

    Dev->>Dash: 1. Sign in via Master SSO (Google or Email)
    Dev->>Dash: 2. Generate API Key (pk_live_...)
    Dev->>Dash: 3. Enable Connectors (Gmail, Canva, Drive...)
    Dev->>API: 4. Discover Tools (GET /v1/tools)
    API-->>Dev: Returns JSON Schema definitions
    Dev->>API: 5. Execute Action (POST /v1/tools/execute)
    API->>Ext: 6. Authenticated External Call using Vaulted Token
    Ext-->>API: Provider Response
    API-->>Dev: Unified JSON Result Envelope
```

---

## 7. Authentication & API Key Management

All programmatic requests to `/v1/*` must include your project API key.

### Accepted Request Headers:
You can pass the API key in either of the following standard headers:
```http
X-API-Key: pk_live_9a7c3b2e1f4d...
```
or
```http
Authorization: Bearer pk_live_9a7c3b2e1f4d...
```

### How to Generate an API Key:
1. Open the Dashboard at `http://localhost:5173`.
2. Connect your Master SSO account (required security check before keys can be issued).
3. Navigate to **API Keys** tab and click `＋ Generate New Key`.
4. Choose environment (`LIVE` or `TEST`), provide an optional label (e.g. `production-agent`), and click **Create Key**.
5. Copy the generated key (`pk_live_...`).

> **Security Guarantee:** Keys are hashed using SHA-256 before being stored in the database. The raw key is only shown to you once upon creation.

---

## 8. Connecting Accounts

The platform supports two account connection paradigms:

### Mode A: Developer Master SSO (Workspace Testing & Personal Agents)
When you log in via **Master SSO** (e.g., `saurabh.devworks@gmail.com`), your workspace automatically establishes master authorization across Google Workspace (Gmail, Calendar, Drive) and pre-configured connectors.
- **Zero popups needed** for testing.
- Your email (`saurabh.devworks@gmail.com`) acts as the default `projectUserId`.

### Mode B: Hosted Connect Flow (For End-Users of your SaaS)
When building a multi-tenant app where your customers connect their own accounts:
1. Call `POST /v1/connect/sessions` from your backend to generate a secure, short-lived session token:
   ```bash
   curl -X POST http://localhost:8080/v1/connect/sessions \
     -H "X-API-Key: pk_live_..." \
     -H "Content-Type: application/json" \
     -d '{
       "projectUserId": "customer_user_987",
       "integrationSlug": "github",
       "redirectUrl": "https://yourapp.com/integrations/callback"
     }'
   ```
2. The API responds with a hosted URL:
   ```json
   {
     "sessionToken": "cs_live_918273645",
     "connectUrl": "http://localhost:5173/connect?session=cs_live_918273645"
   }
   ```
3. Direct your user to `connectUrl`. They complete the OAuth consent screen securely without ever exposing their tokens to your servers.

---

## 9. Tool Discovery & Tool Explorer

Before executing an action, your application or AI agent can dynamically discover what tools are available, their parameter schemas, and risk levels.

### Discovering Tools via API:
```bash
curl -X GET http://localhost:8080/v1/tools \
  -H "X-API-Key: pk_live_..."
```

### Tool Definition Schema Example:
```json
[
  {
    "slug": "gmail.send_email",
    "name": "Send Email",
    "description": "Send a new email message to one or more recipients with optional HTML body",
    "integrationSlug": "gmail",
    "riskLevel": "HIGH",
    "requiresApproval": true,
    "inputSchema": {
      "type": "object",
      "required": ["to", "subject", "body"],
      "properties": {
        "to": { "type": "string", "description": "Recipient email address" },
        "subject": { "type": "string", "description": "Email subject line" },
        "body": { "type": "string", "description": "Message body content (plain text or HTML)" }
      }
    }
  },
  {
    "slug": "canva.create_design",
    "name": "Create New Design",
    "description": "Create a new Canva design project with specified dimensions and template type",
    "integrationSlug": "canva",
    "riskLevel": "LOW",
    "requiresApproval": false,
    "inputSchema": {
      "type": "object",
      "required": ["title"],
      "properties": {
        "title": { "type": "string", "description": "Design title" },
        "designType": { "type": "string", "description": "Template type e.g. presentation, social_media" },
        "width": { "type": "integer", "default": 1920 },
        "height": { "type": "integer", "default": 1080 }
      }
    }
  }
]
```

---

## 10. Programmatic Tool Execution

### REST API (cURL / HTTP)
To run an action on behalf of an authenticated user, send a `POST` request to `/v1/tools/execute`:

#### 1. Search Emails (Gmail)
```bash
curl -X POST http://localhost:8080/v1/tools/execute \
  -H "X-API-Key: pk_live_..." \
  -H "Content-Type: application/json" \
  -d '{
    "toolSlug": "gmail.search_emails",
    "projectUserId": "saurabh.devworks@gmail.com",
    "arguments": {
      "query": "is:unread label:inbox",
      "maxResults": 5
    }
  }'
```

#### 2. Create Issue (GitHub)
```bash
curl -X POST http://localhost:8080/v1/tools/execute \
  -H "X-API-Key: pk_live_..." \
  -H "Content-Type: application/json" \
  -d '{
    "toolSlug": "github.create_issue",
    "projectUserId": "saurabh.devworks@gmail.com",
    "arguments": {
      "owner": "devworks-org",
      "repo": "mobile-app",
      "title": "Fix login crash on iOS 18",
      "body": "Reported by automated error boundary."
    }
  }'
```

#### 3. Upload File (Google Drive)
```bash
curl -X POST http://localhost:8080/v1/tools/execute \
  -H "X-API-Key: pk_live_..." \
  -H "Content-Type: application/json" \
  -d '{
    "toolSlug": "google_drive.upload_file",
    "projectUserId": "saurabh.devworks@gmail.com",
    "arguments": {
      "name": "Quarterly-Report.pdf",
      "content": "data:application/pdf;base64,JVBERi0xLjQK..."
    }
  }'
```

#### 4. Create Design (Canva)
```bash
curl -X POST http://localhost:8080/v1/tools/execute \
  -H "X-API-Key: pk_live_..." \
  -H "Content-Type: application/json" \
  -d '{
    "toolSlug": "canva.create_design",
    "projectUserId": "saurabh.devworks@gmail.com",
    "arguments": {
      "title": "Instagram Product Launch",
      "designType": "social_media",
      "width": 1080,
      "height": 1080
    }
  }'
```

#### Standard Execution Response Envelope:
```json
{
  "executionId": "exec_8471a2b9",
  "toolSlug": "canva.create_design",
  "status": "COMPLETED",
  "output": {
    "designId": "DAF9x8_z1",
    "title": "Instagram Product Launch",
    "editUrl": "https://www.canva.com/design/DAF9x8_z1/edit"
  },
  "errorMessage": null,
  "executionTimeMs": 248,
  "executedAt": "2026-11-04T10:45:00Z"
}
```

---

### Official TypeScript SDK
Install the SDK into your Node.js or Next.js app:
```bash
npm install ./sdk/typescript
# or via npm registry: npm install @integrationplatform/sdk
```

#### TypeScript Usage Example:
```typescript
import { IntegrationClient } from '@integrationplatform/sdk';

const client = new IntegrationClient({
  apiKey: process.env.INTEGRATION_API_KEY!,
  baseUrl: 'http://localhost:8080' // Optional; defaults to localhost:8080
});

async function run() {
  // 1. List active tools
  const tools = await client.tools.list();
  console.log(`Available tools: ${tools.length}`);

  // 2. Execute a tool with type safety
  const result = await client.tools.execute({
    toolSlug: 'google_calendar.create_event',
    projectUserId: 'saurabh.devworks@gmail.com',
    arguments: {
      summary: 'Product Roadmap Review',
      startDateTime: '2026-11-05T14:00:00Z',
      endDateTime: '2026-11-05T15:00:00Z',
      attendees: ['alice@company.com', 'bob@company.com']
    }
  });

  if (result.status === 'COMPLETED') {
    console.log('Event created successfully:', result.output);
  } else if (result.status === 'PENDING_APPROVAL') {
    console.log(`Action requires human approval. ID: ${result.approvalId}`);
  }
}

run();
```

---

### Python & AI Agent Integration
To wire these tools directly into **OpenAI Assistant**, **LangChain**, or **Gemini Function Calling**:

```python
import os
import requests

API_KEY = os.getenv("INTEGRATION_API_KEY", "pk_live_...")
BASE_URL = "http://localhost:8080/v1"
HEADERS = {
    "X-API-Key": API_KEY,
    "Content-Type": "application/json"
}

def get_agent_tools():
    """Fetch tool definitions in format ready for LLM tool calling."""
    response = requests.get(f"{BASE_URL}/tools", headers=HEADERS)
    response.raise_for_status()
    raw_tools = response.json()
    
    openai_tools = []
    for tool in raw_tools:
        openai_tools.append({
            "type": "function",
            "function": {
                "name": tool["slug"].replace(".", "_"),
                "description": tool["description"],
                "parameters": tool["inputSchema"]
            }
        })
    return openai_tools

def execute_agent_call(function_name: str, arguments: dict, user_id: str):
    """Execute LLM function call against the integration platform."""
    # Convert 'gmail_send_email' back to 'gmail.send_email'
    slug = function_name.replace("_", ".", 1)
    
    payload = {
        "toolSlug": slug,
        "projectUserId": user_id,
        "arguments": arguments
    }
    
    response = requests.post(f"{BASE_URL}/tools/execute", json=payload, headers=HEADERS)
    return response.json()

# Example: executing an AI tool call
result = execute_agent_call(
    function_name="github_list_issues",
    arguments={"owner": "my-org", "repo": "backend-api"},
    user_id="saurabh.devworks@gmail.com"
)
print("Agent Tool Result:", result)
```

---

### Model Context Protocol (MCP)
If you use **Claude Desktop**, **Cursor IDE**, or **Zed**, you can mount all platform tools directly via the official MCP bridge:

Add this to your `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "integration-platform": {
      "command": "node",
      "args": ["d:/sau/other/integration-platform/sdk/typescript/bin/mcp-server.js"],
      "env": {
        "INTEGRATION_API_KEY": "pk_live_your_key_here",
        "INTEGRATION_BASE_URL": "http://localhost:8080",
        "INTEGRATION_USER_ID": "saurabh.devworks@gmail.com"
      }
    }
  }
}
```

---

## 11. Risk Governance & Human-in-the-Loop Approvals

Every tool definition specifies a `riskLevel`:
- **`LOW` Risk** (e.g. `search_emails`, `list_events`, `get_file`): Executed immediately.
- **`HIGH` Risk** (e.g. `send_email`, `delete_event`, `create_lead`):
  1. The execution enters `PENDING_APPROVAL` status.
  2. An approval ticket is created in the **Approvals** tab.
  3. The caller receives `{ "status": "PENDING_APPROVAL", "approvalId": "appr_123" }`.
  4. Once an admin approves it via the UI or `POST /v1/approvals/{id}/approve`, the action automatically executes and resumes.

---

## 12. Webhooks & Real-Time Event Subscriptions

Subscribe to platform events (e.g., `execution.completed`, `connection.created`, `approval.requested`).

### Registering an Endpoint:
```bash
curl -X POST http://localhost:8080/v1/webhooks \
  -H "X-API-Key: pk_live_..." \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://yourapp.com/api/webhooks/integrations",
    "events": ["execution.completed", "approval.requested"],
    "secret": "whsec_your_signing_secret"
  }'
```

### Verifying HMAC-SHA256 Signatures:
Every incoming webhook includes the header `X-Signature-SHA256`. Verify it using the SDK:
```typescript
import { IntegrationClient } from '@integrationplatform/sdk';

const isValid = IntegrationClient.verifyWebhookSignature({
  payload: rawRequestBodyString,
  signature: req.headers['x-signature-sha256'],
  secret: process.env.WEBHOOK_SECRET!
});

if (!isValid) {
  return res.status(401).send('Invalid signature');
}
```

---

## 13. Rate Limits & Usage Monitoring

- **Default Limit**: 60 requests per minute per API key (sliding window algorithm).
- **Rate Limit Headers Returned**:
  - `X-RateLimit-Limit`: `60`
  - `X-RateLimit-Remaining`: `57`
  - `X-RateLimit-Reset`: Unix timestamp in seconds.
- **Exceeding Limits**: Returns HTTP `429 Too Many Requests` with a JSON envelope specifying retry wait time.

---

## 14. How to Add a New Integration or Tool

Adding a brand new connector (e.g., Spotify, Notion, Stripe) takes 3 simple steps:

### Step 1: Database Migration (Flyway)
Add a new migration in `backend/src/main/resources/db/migration/` (e.g. `V9__add_spotify.sql`):
```sql
INSERT INTO integrations (slug, name, category, auth_type, default_scopes, documentation_url)
VALUES ('spotify', 'Spotify', 'ENTERTAINMENT', 'OAUTH2', 'user-read-playback-state user-modify-playback-state', 'https://developer.spotify.com/');

INSERT INTO tool_definitions (integration_id, slug, name, description, input_schema, required_scopes, risk_level, requires_approval)
SELECT id, 'spotify.play_track', 'Play Music Track', 'Start or resume playback on active Spotify device',
'{"type":"object","properties":{"uri":{"type":"string"}},"required":["uri"]}'::jsonb,
'user-modify-playback-state', 'LOW', false
FROM integrations WHERE slug = 'spotify';
```

### Step 2: Implement Java Connector Adapter
Create `backend/src/main/java/.../connector/SpotifyConnectorAdapter.java` implementing `ConnectorAdapter`.

### Step 3: Register in Frontend (`frontend/src/App.tsx`)
1. Place the SVG/PNG icon in `frontend/public/icons/spotify.svg`.
2. Add metadata to `DEFAULT_CONNECTORS` and `getConnectorDetails()`.

---

## 15. API Reference & Troubleshooting

### Summary of Public Endpoints (`/v1/*`):
| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/v1/tools` | `GET` | List all available tools with JSON Schemas |
| `/v1/tools/{slug}` | `GET` | Get single tool schema & parameters |
| `/v1/tools/execute` | `POST` | Execute a tool on behalf of an end-user |
| `/v1/connections` | `GET` | List active connected accounts |
| `/v1/connections/{id}` | `DELETE` | Disconnect / revoke provider access |
| `/v1/connect/sessions` | `POST` | Generate hosted OAuth connection session |
| `/v1/executions/{id}` | `GET` | Get execution audit details and output |
| `/v1/approvals` | `GET` | List pending high-risk approval requests |
| `/v1/approvals/{id}/approve` | `POST` | Approve a pending action |
| `/v1/approvals/{id}/reject` | `POST` | Reject a pending action |
| `/v1/webhooks` | `GET`, `POST` | Webhook subscription management |
| `/v1/usage/summary` | `GET` | Quotas, rate limit usage, and audit metrics |
| `/v1/mcp` | `POST` | Model Context Protocol JSON-RPC stream |

### Common Issues & Solutions:
1. **`401 Unauthorized` / `Invalid API Key`**:
   - Check that your header is formatted as `X-API-Key: pk_live_...`.
   - Ensure the key is toggled to **Active** in the Dashboard table.
2. **`403 Forbidden` / `Master SSO Registration Required`**:
   - Connect your Master SSO account in the Dashboard before generating keys or enabling connectors.
3. **`H2 AUTO_SERVER=TRUE` Database Error**:
   - Local H2 profile uses `jdbc:h2:file:./data/integrationdb;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH;DB_CLOSE_DELAY=-1`.
4. **Token Expired**:
   - The platform automatically triggers token refresh in the background via RFC 6749 refresh flow. If the user revoked consent at the provider, the status updates to `NEEDS_REAUTH`.
