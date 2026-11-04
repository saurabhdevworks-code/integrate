# Database Design

The initial Flyway migration creates the Milestone 1 foundation. Additional entities are intentionally deferred until their owning workflows are implemented.

## Initial ERD
```mermaid
erDiagram
  USERS ||--o{ ORGANIZATION_MEMBERS : joins
  ORGANIZATIONS ||--o{ ORGANIZATION_MEMBERS : has
  ORGANIZATIONS ||--o{ PROJECTS : owns
  PROJECTS ||--o{ PROJECT_ENVIRONMENTS : configures
  PROJECTS ||--o{ API_KEYS : issues
  USERS ||--o{ AUDIT_LOGS : performs
  ORGANIZATIONS ||--o{ AUDIT_LOGS : scopes

  USERS {
    uuid id PK
    varchar email UK
    varchar password_hash
    varchar status
    timestamptz created_at
    timestamptz updated_at
  }
  ORGANIZATIONS {
    uuid id PK
    varchar name
    varchar slug UK
    timestamptz created_at
    timestamptz updated_at
  }
  ORGANIZATION_MEMBERS {
    uuid id PK
    uuid organization_id FK
    uuid user_id FK
    varchar role
    timestamptz created_at
  }
  PROJECTS {
    uuid id PK
    uuid organization_id FK
    varchar name
    varchar slug
    timestamptz created_at
    timestamptz updated_at
  }
  PROJECT_ENVIRONMENTS {
    uuid id PK
    uuid project_id FK
    varchar name
    timestamptz created_at
  }
  API_KEYS {
    uuid id PK
    uuid project_id FK
    varchar name
    varchar key_prefix
    varchar key_hash
    varchar environment
    timestamptz expires_at
    timestamptz revoked_at
    timestamptz created_at
  }
```

## Security notes
- API keys store a one-way hash; raw secrets should be displayed once only.
- Provider access/refresh tokens must be encrypted with authenticated encryption and a key kept outside the database.
- Use explicit tenant predicates in repository queries and test cross-tenant denial.
