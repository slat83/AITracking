# Agent API Auth Access Model

This document defines how authenticated API calls work for the Flowvory operator-facing API routes under `/api`.

## Scope

- In scope: hybrid auth for server routes that use `requireDashboardEditor(request)`.
- In scope: role enforcement baseline of editor-level access for dashboard routes.
- Out of scope: cron bearer auth (`/api/cron/daily`) and public unauthenticated routes.

## Decision Summary

- Authentication model: dual path.
- Path A (agent/integration): static bearer token per environment (`Authorization: Bearer <token>`).
- Path B (operator UI): NextAuth session cookie with `EDITOR` or `ADMIN` role.
- API protection contract: unauthenticated requests receive `401`; insufficient session role receives `403`.

## Token Configuration

- Environment variable: `DASHBOARD_API_TOKEN`
- The value must be a long random secret and must not be committed.
- Requests are authenticated by constant-time token comparison.

## Request Authorization Flow (Protected Dashboard API Routes)

For each protected route:

1. Route calls `requireDashboardEditor(request)`.
2. Helper checks for a bearer token in the `authorization` header.
3. If bearer token is present:
4. Read `DASHBOARD_API_TOKEN` from env.
5. If config is missing, return `500` JSON.
6. If token does not match, return `401` JSON.
7. If token matches, proceed with authenticated token principal context.
8. If bearer token is not present:
9. Resolve NextAuth server session.
10. If session/user is missing, return `401` JSON.
11. If session role is below `EDITOR`, return `403` JSON.
12. Otherwise request proceeds with authenticated session principal context.

Standard error payloads:

```json
{ "ok": false, "error": "Authentication is required." }
```

```json
{ "ok": false, "error": "DASHBOARD_API_TOKEN is not configured." }
```

```json
{ "ok": false, "error": "Editor access is required." }
```

## Operational Constraints and Tradeoffs

- This is a hybrid model: browser clients can use operator session auth, while agents/integrations can use bearer token auth.
- Best fit for current stage: preserves existing operator UX while unlocking non-browser automation.
- Current token model remains single-secret and coarse-grained (no per-resource or per-action scopes).

## Security Posture (Current)

- Token validation uses constant-time comparison.
- Authorization checks run server-side on every protected dashboard request.
- Session role checks enforce `EDITOR`+ for route-level writes and reads.

## Known Gaps

- No token rotation workflow in-app yet.
- No per-consumer token registry or revocation list yet.
- No fine-grained scope model (read vs write, resource scoping).

## Recommended Next Steps

If multiple integrations or tighter controls are needed:

1. Add token registry in DB with hashed token storage.
2. Add named scopes (`dashboard:read`, `dashboard:write`) and enforce per route.
3. Add rotation and revocation runbook with overlap windows.

## Code References

- Dashboard API token guard: `src/server/dashboard/api-auth.ts`
- Protected route examples:
  - `src/app/api/keywords/route.ts`
  - `src/app/api/threads/route.ts`
  - `src/app/api/posts/route.ts`
- Browser session auth (separate path):
  - `src/server/auth/config.ts`
  - `src/server/auth/index.ts`
