# Production Deployment & Hardening Guide

This document specifies the operational, security, and deployment procedures for deploying the **Integration-as-a-Service Platform** to production environments.

---

## 1. System Architecture

```
                    ┌─────────────────────────┐
                    │     Clients & SDKs      │
                    │  (Node, Next.js, Python) │
                    └───────────┬─────────────┘
                                │ HTTPS / Bearer API Key
                                ▼
                    ┌─────────────────────────┐
                    │   Reverse Proxy (Nginx/ │
                    │   Cloudflare / Ingress) │
                    └───────────┬─────────────┘
                                │
        ┌───────────────────────┴───────────────────────┐
        ▼                                               ▼
┌───────────────────────────────┐       ┌───────────────────────────────┐
│ Spring Boot Backend Instance 1│       │ Spring Boot Backend Instance 2│
│  - AES-256-GCM Vault          │       │  - AES-256-GCM Vault          │
│  - 15-Step Execution Engine   │       │  - 15-Step Execution Engine   │
│  - Webhook Dispatcher Engine  │       │  - Webhook Dispatcher Engine  │
│  - Sliding Window Rate Limiter│       │  - Sliding Window Rate Limiter│
│  - MCP Server Bridge          │       │  - MCP Server Bridge          │
└───────────────┬───────────────┘       └───────────────┬───────────────┘
                │                                       │
                └───────────────────┬───────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │   Managed PostgreSQL 16+      │
                    │   (AWS RDS / GCP Cloud SQL /  │
                    │    Neon / Supabase)           │
                    └───────────────────────────────┘
```

---

## 2. Production Environment Configuration

All production secrets **must** be injected via environment variables and never committed to source control:

| Variable | Description | Requirement |
|---|---|---|
| `DB_URL` | JDBC Connection String | `jdbc:postgresql://<host>:5432/<db>?sslmode=require` |
| `DB_USERNAME` | Production DB User | Restricted privileges |
| `DB_PASSWORD` | Production DB Password | High entropy secret |
| `JWT_SECRET` | 256-bit Hex JWT Secret Key | Minimum 64 hex characters (32 bytes) |
| `VAULT_MASTER_KEY` | AES-256-GCM Master Key | Exactly 64 hex characters (32 bytes) |
| `CORS_ALLOWED_ORIGINS` | Permitted Console Domains | Explicit domain list (e.g. `https://app.yourdomain.com`) |

### AWS Secrets Manager / KMS Key Integration Example
For enterprise compliance, wrap `VAULT_MASTER_KEY` inside AWS KMS or HashiCorp Vault using envelope encryption:
```bash
aws kms encrypt \
  --key-id alias/integration-vault-key \
  --plaintext fileb://vault-master-key.bin \
  --output text --query CiphertextBlob
```

---

## 3. Production Docker Compose Setup

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_DB: integration_platform
      POSTGRES_USER: ${DB_USERNAME}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USERNAME} -d integration_platform"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: always
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      SPRING_PROFILES_ACTIVE: prod
      DB_URL: jdbc:postgresql://postgres:5432/integration_platform?sslmode=disable
      DB_USERNAME: ${DB_USERNAME}
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      VAULT_MASTER_KEY: ${VAULT_MASTER_KEY}
    ports:
      - "8080:8080"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
      interval: 15s
      timeout: 5s
      retries: 3

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    restart: always
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  pgdata:
```

---

## 4. Kubernetes Deployment Manifest

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: integration-platform-backend
  namespace: production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
        - name: backend
          image: your-registry/integration-platform-backend:1.0.0
          resources:
            requests:
              memory: "512Mi"
              cpu: "250m"
            limits:
              memory: "1024Mi"
              cpu: "1000m"
          ports:
            - containerPort: 8080
          envFrom:
            - secretRef:
                name: integration-platform-secrets
          readinessProbe:
            httpGet:
              path: /actuator/health/readiness
              port: 8080
            initialDelaySeconds: 20
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /actuator/health/liveness
              port: 8080
            initialDelaySeconds: 30
            periodSeconds: 15
```

---

## 5. Security Hardening Checklist

- [x] **No Plaintext Provider Tokens**: Access and refresh tokens encrypted with AES-256-GCM authenticated cipher before DB persistence.
- [x] **Strict Tenant Scoping**: Every API request checks `project_id` and organizational tenant membership; impossible to query or execute another tenant's tools.
- [x] **API Key SHA-256 Hashing**: Programmatic API keys (`ip_live_...`) hashed with SHA-256 at rest; secrets only revealed once on generation.
- [x] **PKCE OAuth Verification**: RFC 7636 S256 code challenge and code verifier verification on all provider callbacks to eliminate code interception attacks.
- [x] **HMAC-SHA256 Webhook Signatures**: All outgoing webhooks signed with per-webhook secret; constant-time verification protects against timing attacks.
- [x] **Sliding Window Rate Limiter**: Automatic 60 requests/minute defense per API key returning HTTP 429 with `Retry-After`.
- [x] **Idempotency Protection**: Non-idempotent actions (emails, calendar mutations) enforce client-supplied idempotency keys.
- [x] **Zero Secret Leakage in Logs**: Log formatters and event stores redact OAuth tokens, authorization headers, and credential secrets.

---

## 6. Monitoring & Alerting (Prometheus & Grafana)

The platform includes Spring Boot Actuator with Micrometer Prometheus metrics:
- **Health Endpoint**: `GET /actuator/health`
- **Metrics Endpoint**: `GET /actuator/prometheus`

### Critical Alerting Thresholds:
1. **Error Rate Alert**: `rate(http_server_requests_seconds_count{status=~"5.."}[5m]) > 0.05` (More than 5% 5xx errors over 5 minutes).
2. **High Latency Alert**: `histogram_quantile(0.95, sum(rate(http_server_requests_seconds_bucket[5m])) by (le)) > 2.0` (p95 latency exceeds 2 seconds).
3. **Database Connection Pool Exhaustion**: `hikaricp_connections_pending > 5` for 2 consecutive minutes.
4. **Rate Limit 429 Spikes**: `sum(rate(http_server_requests_seconds_count{status="429"}[5m])) > 50`.

---

## 7. Database Backup & Disaster Recovery (PITR)

### Automated Daily Snapshots
```bash
# Automated pg_dump backup
pg_dump -h <host> -U <user> -F c -b -v -f "/backup/integration_db_$(date +%Y%m%d_%H%M%S).dump" integration_platform
```

### Point-In-Time Recovery (PITR)
- Enable PostgreSQL WAL archiving (`wal_level = replica`, `archive_mode = on`).
- Store WAL segments in Amazon S3 or Google Cloud Storage with versioning and 30-day lifecycle retention.
- Disaster recovery target: RPO < 5 minutes, RTO < 30 minutes.

---

## 8. Public Beta Readiness Checklist

| Category | Verification Item | Status |
|---|---|:---:|
| **Identity & Security** | BCrypt password hashing (cost factor 12) | ✅ Verified |
| **Authentication** | Dual auth (Bearer JWT for console + Bearer API Key for REST/MCP) | ✅ Verified |
| **Integrations** | Gmail, GitHub, and Google Calendar live provider execution | ✅ Verified |
| **OAuth** | Automated token refresh with AES-256-GCM re-encryption | ✅ Verified |
| **Tenant Isolation** | Penetration test suite verifying cross-tenant rejection | ✅ Verified |
| **Developer DX** | Public REST API (`/v1/*`), OpenAPI docs, TypeScript SDK | ✅ Verified |
| **AI Integrations** | Model Context Protocol (MCP) JSON-RPC 2.0 endpoint & stdio bridge | ✅ Verified |
| **Operations** | Webhook delivery engine with HMAC-SHA256 & sliding window rate limiter | ✅ Verified |
