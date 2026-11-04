# Public API — Initial Contract

The public API will be versioned under `/v1`. These routes are the planned contract; only implemented routes should be advertised as available.

| Method | Route | Purpose | Status |
|---|---|---|---|
| GET | `/actuator/health` | Runtime health | Starter included |
| POST | `/v1/auth/register` | Developer registration | Pending |
| POST | `/v1/auth/login` | Dashboard login | Pending |
| GET | `/v1/organizations` | List caller's organizations | Pending |
| POST | `/v1/organizations` | Create organization | Pending |
| GET | `/v1/projects` | List accessible projects | Pending |
| POST | `/v1/projects` | Create project | Pending |
| POST | `/v1/projects/{projectId}/api-keys` | Create project API key | Pending |
| GET | `/v1/integrations` | List integrations | Pending |
| GET | `/v1/tools` | Discover tools | Pending |
| POST | `/v1/tools/execute` | Execute authorized tool | Pending |

## API conventions
- JSON request/response bodies.
- UTC timestamps in ISO-8601 format.
- Stable error envelope with code, message, traceId.
- Cursor or page-based pagination for collection endpoints.
- Dashboard session authentication is separate from project API-key authentication.
