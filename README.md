# Integration-as-a-Service (IaaS) Platform

A full-stack, multi-tenant Integration-as-a-Service (IaaS) SaaS platform (similar to Composio). Connect your end users' external accounts across Gmail, GitHub, and Google Calendar, and execute actions programmatically through one unified API, official TypeScript SDK, and Model Context Protocol (MCP) server for AI assistants.

---

## 🌟 Key Capabilities

- **Strict Multi-Tenancy**: Organizations, projects, and environments (LIVE vs. TEST) with cryptographic isolation.
- **Enterprise Credential Vault**: Authenticated AES-256-GCM encryption with NIST SP 800-38D compliant 12-byte random IVs and 128-bit integrity tags. Provider tokens never exposed to the frontend or logs.
- **OAuth 2.0 PKCE Engine**: RFC 7636 S256 code challenge/verifier flow, 256-bit cryptographic state tokens, automatic token refresh, and instant revocation.
- **Unified Central Execution Engine**: 15-step pipeline with idempotency caching, JSON Schema input validation, and high-risk action approval gating.
- **Live Connectors**:
  - **Gmail**: `search_emails`, `get_email`, `create_draft`, `send_email`, `list_labels` (with RFC 2822 Base64URL MIME encoding).
  - **GitHub**: `list_repositories`, `list_issues`, `get_issue`, `create_issue`, `create_issue_comment`, `list_pull_requests`.
  - **Google Calendar**: `list_events`, `get_event`, `create_event`, `update_event`, `delete_event`, `get_free_busy`.
- **Hosted Connect Experience**: Out-of-the-box user connection page (`/connect?session=...`) for zero-friction end-user onboarding.
- **Public REST API (`/v1/*`)**: Versioned HTTP endpoints for integrations, tools, executions, connections, sessions, and webhooks.
- **Official TypeScript SDK (`@integrationplatform/sdk`)**: Standalone client library for Node.js, Next.js, and TypeScript backends.
- **Model Context Protocol (MCP) Server**: JSON-RPC 2.0 endpoint (`/v1/mcp`) and stdio bridge for Claude Desktop, Cursor, and Zed.
- **Webhooks & Operational Limits**: HMAC-SHA256 signature verification, automated delivery logging, usage metering, and sliding window rate limiting (60 req/min per key) with HTTP 429 defense.

📖 **Looking for the Developer Guide?** Check out [DEVELOPER_GUIDE.md](file:///d:/sau/other/integration-platform/DEVELOPER_GUIDE.md) for complete architecture, cURL/SDK/Python code examples, AI agent integration, and tool execution guides.

---

## 🏗️ Architecture & Technology Stack

- **Backend**: Java 21, Spring Boot 3.4.2, Spring Security 6, Spring Data JPA, PostgreSQL, Flyway, Spring Boot Actuator, OpenAPI / Swagger UI.
- **Frontend**: React 18, TypeScript, Vite, custom responsive CSS dashboard.
- **Security**: BCrypt (cost factor 12), SHA-256 API key hashing, AES-256-GCM credential vault, PKCE S256, constant-time HMAC verification.
- **Infrastructure**: Docker Compose, Flyway migration versioning (V1 through V6).

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Java 21 JDK (`C:\Program Files\Eclipse Adoptium\jdk-21...` or equivalent)
- Apache Maven 3.9+
- Node.js 20+
- Docker Desktop with Docker Compose

### 2. Running Without Docker (Embedded Mode — Zero Setup)

You do **not** need Docker to run this platform! We configured an embedded local profile that saves data to `./data/integrationdb` and auto-seeds all tools and integrations:

```powershell
# In Terminal 1: Run Backend (No Docker needed)
cd d:\sau\other\integration-platform\backend
& "C:\Tools\apache-maven-3.9.16\bin\mvn.cmd" spring-boot:run -Dspring-boot.run.profiles=local

# In Terminal 2: Run Frontend Dashboard
cd d:\sau\other\integration-platform\frontend
npm.cmd run dev
```

- **Dashboard Console**: `http://localhost:5173`
- **Swagger UI & OpenAPI Docs**: `http://localhost:8080/swagger-ui.html`
- **Embedded Database Console**: `http://localhost:8080/h2-console`
- **Health Checks**: `http://localhost:8080/actuator/health`

---

### 3. Alternative: Running With Docker (PostgreSQL)

If you prefer using Docker:
```powershell
# 1. Start PostgreSQL in Docker
docker compose up -d postgres

# 2. Run Backend
cd d:\sau\other\integration-platform\backend
$env:DB_URL="jdbc:postgresql://localhost:5432/integration_platform"
$env:DB_USERNAME="platform"
$env:DB_PASSWORD="platform_dev_password"
$env:JWT_SECRET="404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970"
$env:VAULT_MASTER_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
& "C:\Tools\apache-maven-3.9.16\bin\mvn.cmd" spring-boot:run
```

---

### 4. Alternative: Running With Free Cloud PostgreSQL (Neon / Supabase — No Docker)

You can also connect to a free remote PostgreSQL database without installing Docker:
1. Create a free database at [neon.tech](https://neon.tech) or [supabase.com](https://supabase.com).
2. Set the connection variables:
```powershell
$env:DB_URL="jdbc:postgresql://<neon-host>/neondb?sslmode=require"
$env:DB_USERNAME="<neon-user>"
$env:DB_PASSWORD="<neon-password>"
cd d:\sau\other\integration-platform\backend
& "C:\Tools\apache-maven-3.9.16\bin\mvn.cmd" spring-boot:run
```

### 5. Run Frontend Dashboard
```powershell
cd d:\sau\other\integration-platform\frontend
npm.cmd install
npm.cmd run dev
```
- Dashboard Console: `http://localhost:5173`
- Hosted Connect Page: `http://localhost:5173/connect?session=<sessionId>`

---

## 💻 TypeScript SDK Quick Start

```typescript
import { IntegrationClient } from '@integrationplatform/sdk';

const client = new IntegrationClient({
  apiKey: process.env.INTEGRATION_API_KEY!, // Project API Key (ip_live_...)
  baseUrl: 'http://localhost:8080'
});

// 1. Create a hosted connection session for your user
const session = await client.sessions.create({
  integrationSlug: 'gmail',
  projectUserId: 'user_123',
  returnUrl: 'https://myapp.com/dashboard'
});
console.log('Direct user to connect URL:', session.connectUrl);

// 2. Execute any tool programmatically
const result = await client.tools.execute({
  projectUserId: 'user_123',
  tool: 'gmail.search_emails',
  input: {
    query: 'is:unread label:INBOX',
    maxResults: 5
  }
});
console.log('Tool output:', result.output);
```

---

## 🤖 Model Context Protocol (MCP) Setup

Add to your `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "integration-platform": {
      "command": "node",
      "args": ["d:/sau/other/integration-platform/sdk/typescript/bin/mcp-server.js"],
      "env": {
        "INTEGRATION_API_KEY": "ip_live_xxxxxxxx_your_api_key",
        "INTEGRATION_USER_ID": "user_123",
        "INTEGRATION_BASE_URL": "http://localhost:8080"
      }
    }
  }
}
```

---

## 📚 Project Documentation

- [PROGRESS_REPORT.md](PROGRESS_REPORT.md): Chronological milestone breakdown and test verification report.
- [PROJECT_STATUS.md](PROJECT_STATUS.md): Current completion status across all 7 milestones.
- [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md): Completed tasks checklist.
- [DEPLOYMENT.md](DEPLOYMENT.md): Production Kubernetes, Docker, TLS, Prometheus alerts, and disaster recovery guide.
