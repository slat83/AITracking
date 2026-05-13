# Dashboard API Endpoints

This document covers the dashboard tracking API routes used by the community monitoring dashboard.

Base path: `/api`

## Access and Auth

- All dashboard endpoints require authenticated access.
- Agent/integration access: `Authorization: Bearer <token>`.
- Signed-in operator access: NextAuth session cookie with `EDITOR` or `ADMIN` role.
- Unauthorized response: `401` with `{ "ok": false, "error": "Authentication is required." }`
- Forbidden response (session role below `EDITOR`): `403` with `{ "ok": false, "error": "Editor access is required." }`
- Forbidden response (API token missing route scope): `403` with `{ "ok": false, "error": "Token scope <scope> is required." }`

### Authorization decision order

For protected dashboard routes, authorization executes in this order:

1. Parse `Authorization` and accept only `Bearer <token>` with one token segment.
2. If a bearer token is present:
3. Attempt legacy env-token match (`DASHBOARD_API_TOKEN`, `DASHBOARD_API_TOKEN_PREVIOUS`) for compatibility during migration.
4. Otherwise resolve token from `DashboardApiToken` registry by SHA-256 hash (`tokenHash`) and reject revoked tokens.
5. Return `401` if no active token matches.
6. Enforce route scope requirement:
7. Return `403` when token is valid but missing required scope.
8. Record `lastUsedAt` for registry-backed token matches.
9. If bearer token is absent:
10. Resolve NextAuth server session.
11. Return `401` when no session/user exists.
12. Return `403` when session role is below `EDITOR`.
13. Otherwise allow the request with session principal context.

### Scope model

- `dashboard:read`: required for read routes (`GET`)
- `dashboard:write`: required for mutating routes (`POST`, `DELETE`), and implicitly grants `dashboard:read`

Scope mapping by route:

| Route | Required scope |
| --- | --- |
| `GET /api/keywords` | `dashboard:read` |
| `POST /api/keywords` | `dashboard:write` |
| `DELETE /api/keywords` | `dashboard:write` |
| `GET /api/threads` | `dashboard:read` |
| `POST /api/threads` | `dashboard:write` |
| `DELETE /api/threads` | `dashboard:write` |
| `GET /api/posts` | `dashboard:read` |
| `POST /api/posts` | `dashboard:write` |
| `DELETE /api/posts` | `dashboard:write` |

### Token registry model

`DashboardApiToken` stores:

- `id` (revoke-by-id handle)
- `label` (consumer label)
- `tokenHash` (SHA-256 hash only; raw token is never stored)
- `scopes` (`dashboard:read`, `dashboard:write`)
- optional `workspaceId` (reserved for future workspace-scoped enforcement)
- optional consumer metadata (`consumerId`, `notes`)
- `lastUsedAt`
- `revokedAt`

### Issuance and revocation operations

Use the token management CLI:

- `npm run dashboard:tokens -- issue --label "<consumer>" --scopes dashboard:write`
- `npm run dashboard:tokens -- list`
- `npm run dashboard:tokens -- revoke --id <token-id>`

Raw token values are shown only at issuance time and must be moved into approved secret storage immediately.

### Optional workspace scoping design (future-ready)

Current dashboard tracking routes operate on a default workspace. For multi-workspace operations, use this extension path:

1. Require `workspaceId` on token records intended for scoped use.
2. Resolve request workspace context (header, route segment, or explicit payload field).
3. Enforce `token.workspaceId === request.workspaceId` for scoped tokens.
4. Keep `workspaceId = null` as global tokens for system-level automation during migration.

This design keeps compatibility while allowing gradual tenant isolation without a full auth rewrite.

### Bearer token telemetry

Bearer token authentication attempts emit structured logs with event name `dashboard_token_auth` and fields:

- `timestamp`
- `method`
- `pathname`
- `outcome` (`authenticated`, `invalid_token`, `insufficient_scope`)
- `requiredScope`
- `source` (`registry`, `legacy_env`, `null`)
- `tokenId`
- `tokenLabel`
- `tokenFingerprint` (redacted SHA-256 prefix)
- `callerFingerprint` (redacted SHA-256 prefix from request source metadata when available)
- `matchedTokenSlot` (`primary`, `previous`, or `null`)

## `GET /api/keywords`

Returns tracked keywords.

- Method: `GET`
- Success: `200`
- Response:

```json
{
  "ok": true,
  "keywords": [
    {
      "id": "ckw_123",
      "keyword": "carfax alternative",
      "createdAt": "2026-05-11T10:15:00.000Z",
      "updatedAt": "2026-05-11T10:15:00.000Z"
    }
  ]
}
```

## `POST /api/keywords`

Creates or upserts tracked keywords. Supports JSON and workbook upload.

- Method: `POST`
- Success: `201`
- Error: `400` with `Invalid keyword payload.`

Accepted payloads:

```json
{ "keyword": "carfax alternative" }
```

```json
{ "keywords": ["carfax alternative", "epicvin review"] }
```

```json
{ "keywords": ["carfax alternative", "epicvin review"], "mode": "replace" }
```

`multipart/form-data` payload:

- `workbook`: file (required)
- `sheetName`: string (optional)
- `mode`: `append` (default) or `replace` (optional)

Keyword import modes:

- `append`: add/update provided keywords and keep existing tracked keywords
- `replace`: replace the tracked keyword set with only the provided keywords

Success response:

```json
{
  "ok": true,
  "mode": "append",
  "importedCount": 2,
  "keywords": []
}
```

`mode` reflects the mode applied by the API (`append` default or `replace` when requested).

## `DELETE /api/keywords`

Removes tracked keywords by id/keyword, single or batch.

- Method: `DELETE`
- Success: `200`
- Error: `400` with `Invalid keyword delete payload.`

Accepted payloads:

```json
{ "id": "ckw_123" }
```

```json
{ "keyword": "carfax alternative" }
```

```json
{ "ids": ["ckw_123", "ckw_456"] }
```

```json
{ "keywords": ["carfax alternative", "epicvin review"] }
```

Success response:

```json
{ "ok": true, "keywords": [] }
```

## `GET /api/threads`

Returns tracked Reddit thread list.

- Method: `GET`
- Success: `200`

Response:

```json
{
  "ok": true,
  "threads": [
    {
      "id": "crt_123",
      "url": "https://www.reddit.com/r/askcarsales/comments/abc123/example",
      "title": "Example title",
      "createdAt": "2026-05-11T10:15:00.000Z",
      "updatedAt": "2026-05-11T10:15:00.000Z"
    }
  ]
}
```

## `POST /api/threads`

Appends tracked threads. Re-adding the same URL creates an additional tracking record (it does not overwrite history).

- Method: `POST`
- Success: `201`
- Error: `400` with `Invalid thread payload.`

Accepted payloads:

```json
{ "url": "https://www.reddit.com/r/askcarsales/comments/abc123/example", "title": "Example title" }
```

```json
{
  "threads": [
    { "url": "https://www.reddit.com/r/askcarsales/comments/abc123/example", "title": "Example title" }
  ]
}
```

Success response:

```json
{ "ok": true, "threads": [] }
```

## `DELETE /api/threads`

Removes tracked threads by id/url, single or batch.

- Method: `DELETE`
- Success: `200`
- Error: `400` with `Invalid thread delete payload.`

Accepted payloads:

```json
{ "id": "crt_123" }
```

```json
{ "url": "https://www.reddit.com/r/askcarsales/comments/abc123/example" }
```

```json
{ "ids": ["crt_123", "crt_456"] }
```

```json
{ "urls": ["https://www.reddit.com/r/askcarsales/comments/abc123/example"] }
```

Success response:

```json
{ "ok": true, "threads": [] }
```

## `GET /api/posts`

Returns tracked posts split by answer state.

- Method: `GET`
- Success: `200`

Response:

```json
{
  "ok": true,
  "postsToAnswer": [
    {
      "id": "crp_123",
      "url": "https://www.reddit.com/r/whatcarshouldIbuy/comments/abc123/example",
      "title": "Example question",
      "subreddit": "whatcarshouldIbuy",
      "author": "throwaway123",
      "answeredAt": null,
      "createdAt": "2026-05-11T10:15:00.000Z",
      "updatedAt": "2026-05-11T10:15:00.000Z"
    }
  ],
  "answeredPosts": []
}
```

## `POST /api/posts`

Appends tracked posts. Re-adding the same URL creates a new unanswered tracking record (it does not overwrite history).

- Method: `POST`
- Success: `201`
- Error: `400` with `Invalid post payload.`

Accepted payloads:

```json
{
  "url": "https://www.reddit.com/r/whatcarshouldIbuy/comments/abc123/example",
  "title": "Example question",
  "subreddit": "whatcarshouldIbuy",
  "author": "throwaway123"
}
```

```json
{
  "posts": [
    {
      "url": "https://www.reddit.com/r/whatcarshouldIbuy/comments/abc123/example",
      "title": "Example question"
    }
  ]
}
```

Success response:

```json
{ "ok": true, "postsToAnswer": [], "answeredPosts": [] }
```

## `DELETE /api/posts`

Marks posts as answered by id/url, single or batch.

- Method: `DELETE`
- Success: `200`
- Error: `400` with `Invalid post delete payload.`

Accepted payloads:

```json
{ "id": "crp_123" }
```

```json
{ "url": "https://www.reddit.com/r/whatcarshouldIbuy/comments/abc123/example" }
```

```json
{ "ids": ["crp_123", "crp_456"] }
```

```json
{ "urls": ["https://www.reddit.com/r/whatcarshouldIbuy/comments/abc123/example"] }
```

Success response:

```json
{ "ok": true, "postsToAnswer": [], "answeredPosts": [] }
```

## Validation and Server Errors

- Validation failures return `400` with:

```json
{
  "ok": false,
  "error": "Invalid ... payload.",
  "issues": {}
}
```

- Unexpected failures return `500` with:

```json
{ "ok": false, "error": "Failed to ..." }
```
