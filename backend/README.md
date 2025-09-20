# Backend Proxy Server

Secure Express + TypeScript proxy to Azure DevOps REST API. Holds the Personal Access Token (PAT) server-side and exposes minimal endpoints for the frontend.

## Features
- Environment validation (PAT + org required)
- CORS allow‑list
- Helmet security headers
- Structured request logging (morgan)
- Error handling middleware
- Placeholder rate limiter (extend later)
- Work Items query endpoint via WIQL
- Health endpoint `/health`
- Azure AD (Microsoft Entra ID) JWT validation (Authorization Code + PKCE tokens from frontend)

## Environment Variables (.env)
Copy `.env.example` to `.env` and fill values.

| Variable | Required | Description |
|----------|----------|-------------|
| AZDO_PAT | Yes | Azure DevOps Personal Access Token (scope: Work Items (Read) minimum) |
| AZDO_ORG | Yes | Azure DevOps organization name (the part after https://dev.azure.com/) |
| AZDO_PROJECT | No | Default project name (optional – can be overridden per request) |
| AAD_CLIENT_ID | Yes | Application (client) ID of your SPA / registered app issuing tokens |
| AAD_TENANT_ID | Yes | Directory (tenant) ID for authority & JWKS discovery |
| AAD_ALLOWED_AUDIENCES | No | Comma separated additional accepted audiences (client ID always allowed) |
| AAD_ISSUER | No | Override issuer (default derived: https://login.microsoftonline.com/{tenant}/v2.0) |
| PORT | No | Default 4000 |
| ALLOWED_ORIGINS | No | Comma separated list of allowed origins for CORS |
| LOG_LEVEL | No | Future use for structured logging |

## Install & Run
```bash
npm install
npm run dev   # ts-node + nodemon
# or build & start
npm run build
npm start
```

## Endpoints
### GET /health
Returns simple status.

### POST /api/workitems/query
Body:
```json
{
  "wiql": "SELECT [System.Id] FROM WorkItems WHERE [System.TeamProject] = 'MyProject' ORDER BY [System.ChangedDate] DESC",
  "project": "OptionalDifferentProject"
}
```
Response:
```json
{
  "count": 12,
  "items": [ { /* work item fields */ } ]
}
```

## Authorization Handling
The PAT is injected as a Basic header: `Basic base64(':' + PAT)`. This keeps username empty as recommended for Azure DevOps.

### Azure AD (Entra ID) Protection
Frontend obtains tokens using MSAL (Authorization Code + PKCE). Tokens are sent as `Authorization: Bearer <token>` to backend `/api/*` routes. Backend validates:
* Signature via JWKS (`/discovery/v2.0/keys`)
* `iss` matches configured / derived issuer
* `aud` is one of configured audiences (always includes `AAD_CLIENT_ID`)
* Expiry / nbf

On success, decoded claims are attached at `req.user`. Failure returns `401` JSON `{ error: 'Unauthorized' }`.

## Security Notes / Hardening Next Steps
- Replace placeholder rate limiter with `express-rate-limit` or Redis sliding window.
- Add request body size enforcement (currently 1mb JSON limit applied).
- Consider structured logger (pino/winston) with log level from `LOG_LEVEL`.
- Add input validation (e.g. zod) for WIQL payload.
- Consider endpoint allow‑list + auth (e.g. JWT from Entra ID) instead of fully open proxy.
- Add CI step to scan dependencies (npm audit / GitHub Dependabot).
 - Introduce role/group based authorization using `req.user.roles` or `req.user.groups`.
 - Optionally implement On-Behalf-Of flow for downstream Graph / Azure DevOps without PAT.

## Example curl
```bash
curl -X POST http://localhost:4000/api/workitems/query \
  -H "Content-Type: application/json" \
  -d '{"wiql": "SELECT [System.Id] FROM WorkItems WHERE [System.TeamProject] = \'MyProject\'"}'
```

## Frontend Integration Example (fetch)
```ts
async function queryWorkItems(wiql: string) {
  const res = await fetch('/api/workitems/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ wiql })
  });
  if (!res.ok) throw new Error(`Query failed: ${res.status}`);
  return res.json();
}
```

## License
Private / Internal use.
