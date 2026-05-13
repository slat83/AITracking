# Dashboard API Endpoints

This document covers the dashboard tracking API routes used by the community monitoring dashboard.

Base path: `/api`

## Access and Auth

- All dashboard endpoints require authenticated access.
- Agent/integration access: `Authorization: Bearer <DASHBOARD_API_TOKEN>`.
- Signed-in operator access: NextAuth session cookie with `EDITOR` or `ADMIN` role.
- Bearer tokens are validated with constant-time comparison against `process.env.DASHBOARD_API_TOKEN`.
- If a bearer token is sent and `DASHBOARD_API_TOKEN` is not configured, the API returns `500` with `{ "ok": false, "error": "DASHBOARD_API_TOKEN is not configured." }`.
- Unauthorized response: `401` with `{ "ok": false, "error": "Authentication is required." }`
- Forbidden response (session role below `EDITOR`): `403` with `{ "ok": false, "error": "Editor access is required." }`

### Authorization decision order

For protected dashboard routes, authorization executes in this order:

1. Parse `Authorization` and accept only `Bearer <token>` with one token segment.
2. If a bearer token is present:
3. Read `DASHBOARD_API_TOKEN` from env.
4. Return `500` if token config is missing.
5. Return `401` if token does not match.
6. Treat request as authenticated `EDITOR` principal when token matches.
7. If bearer token is absent:
8. Resolve NextAuth server session.
9. Return `401` when no session/user exists.
10. Return `403` when session role is below `EDITOR`.
11. Otherwise allow the request with session principal context.

### Operational constraints

- The token model is currently a single shared secret per environment.
- There is no in-app token rotation, token registry, or fine-grained scope model yet.
- Keep `DASHBOARD_API_TOKEN` out of git, docs, and ticket attachments.

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
