# Security Architecture and Checklist

- Separate dashboard identity sessions from public project API keys.
- Hash passwords with Argon2id or BCrypt; never use fast hashes for passwords.
- Store only API-key hashes; show raw key once.
- Encrypt provider tokens using AES-256-GCM; keep key material outside the DB and plan key rotation.
- Bind OAuth state to the initiating project and end-user; enforce expiry and single use.
- Enforce organization/project/end-user ownership server-side on every operation.
- Validate all DTOs and JSON Schema inputs.
- Redact secrets and sensitive provider payloads from logs.
- Apply rate limits per project/key and provider.
- Protect webhook delivery from SSRF: block private, loopback, link-local and metadata IP ranges; revalidate DNS at connection time.
- Verify provider webhook signatures and deduplicate event IDs.
- Require approvals for configured sensitive actions and bind approval to an immutable action/argument hash.
- Add cross-tenant tests before public beta.
