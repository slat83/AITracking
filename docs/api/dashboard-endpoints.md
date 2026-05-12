# Dashboard API Endpoints

This document covers the dashboard tracking API routes used by the community monitoring dashboard.

Base path: `/api`

Auth session model reference: [agent-api-auth-session-model.md](./agent-api-auth-session-model.md)

## Access and Auth

- All dashboard endpoints require an authenticated session.
- Required role: `EDITOR` or higher.
- Unauthorized response: `401` with `{ "ok": false, "error": "Authentication is required." }`
- Forbidden response: `403` with `{ "ok": false, "error": "Editor access is required." }`

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

`multipart/form-data` payload:

- `workbook`: file (required)
- `sheetName`: string (optional)

Success response:

```json
{
  "ok": true,
  "importedCount": 2,
  "keywords": []
}
```

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

Creates or upserts tracked threads.

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

Creates or upserts tracked posts. If an existing post is re-added, it is reset to unanswered (`answeredAt = null`).

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
