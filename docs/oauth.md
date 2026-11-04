# OAuth Lifecycle — Design

1. Authenticated project owner selects an integration and configured OAuth model.
2. Backend validates project membership and provider configuration.
3. Backend creates a cryptographically random, single-use state value bound to project, end-user, provider, redirect URI, and expiry.
4. Where supported, backend creates PKCE verifier/challenge.
5. Browser is redirected to the provider authorization endpoint.
6. Callback validates state, expiry, single-use status, project binding, and exact registered redirect URI.
7. Backend exchanges authorization code server-to-server.
8. Token response is encrypted before persistence; raw tokens never reach browser or logs.
9. Refresh is serialized to avoid concurrent refresh races.
10. Disconnect revokes provider token where supported and removes/invalidates local credentials.

OAuth provider credentials and redirect URI registration are external prerequisites. This document is a design, not evidence of a live OAuth integration.
