# Agent API Auth Session Model

This document defines how authenticated API calls work for the Flowvory operator-facing API routes under `/api`.

## Scope

- In scope: session-based auth for server routes that use `requireDashboardEditor()`.
- In scope: role enforcement for `VIEWER`, `EDITOR`, `ADMIN`.
- Out of scope: cron bearer auth (`/api/cron/daily`) and public unauthenticated routes.

## Decision Summary

- Authentication model: NextAuth credentials provider with JWT session strategy.
- Session transport: HTTP-only session cookie managed by NextAuth.
- Authorization model: role hierarchy check at route entry.
- API protection contract: unauthenticated requests receive `401`; insufficient role receives `403`.

## Session Data Model

### Source of truth

- User credentials are verified against the `User` record in PostgreSQL via Prisma.
- Password verification uses `bcrypt.compare`.

### Role model

Role hierarchy is enforced by rank:

- `ADMIN` (3)
- `EDITOR` (2)
- `VIEWER` (1)

A role satisfies access when `roleRank[userRole] >= roleRank[requiredRole]`.

### JWT/session shape

On successful login:

1. `authorize()` returns `{ id, email, name, role }`.
2. `jwt` callback stores `role` in the token.
3. `session` callback maps token values into `session.user`.

Resulting server session shape:

```ts
session.user = {
  id: string;
  email?: string | null;
  name?: string | null;
  role?: "ADMIN" | "EDITOR" | "VIEWER";
}
```

## Request Authorization Flow (Protected API Routes)

For each protected route:

1. Route calls `requireDashboardEditor()`.
2. Helper resolves server session with `getServerSession(authOptions)`.
3. If no session/user: return `401` JSON.
4. If role is below `EDITOR`: return `403` JSON.
5. Otherwise request proceeds with authenticated session context.

Standard error payloads:

```json
{ "ok": false, "error": "Authentication is required." }
```

```json
{ "ok": false, "error": "Editor access is required." }
```

## Session Lifecycle

1. User submits credentials at sign-in flow.
2. Credentials provider validates email/password against DB.
3. NextAuth issues JWT-backed session cookie.
4. Browser/client includes session cookie on subsequent same-origin API requests.
5. Server validates cookie and reconstructs session on each request.
6. Session ends on sign-out or cookie/session invalidation.

## Auth Route Boundary

Session creation and termination are handled by NextAuth routes under `/api/auth/*`:

- `POST /api/auth/callback/credentials`: validates credentials and establishes the session.
- `GET /api/auth/session`: returns current session payload when a valid session cookie is present.
- `POST /api/auth/signout`: terminates the active session.

Protected business endpoints under `/api/keywords`, `/api/threads`, and `/api/posts` do not process credentials directly. They only consume the already-established session context via `getServerSession(authOptions)`.

## Operational Constraints and Tradeoffs

- This is a browser-session model, not a long-lived API key model.
- Best fit: operator dashboard and same-origin app API calls.
- Not ideal for external machine-to-machine integrations without a browser session.
- Role checks are centralized and consistent, but coarse-grained (role-level, not resource-level).

## Security Posture (Current)

- Passwords are hashed (bcrypt) and never compared in plaintext.
- Session cookies are HTTP-only and managed by NextAuth.
- Authorization is enforced server-side on every protected request.

## Known Gaps

- No dedicated service-account or token-based auth path for non-browser agents.
- Session introspection is implicit via NextAuth (`/api/auth/session`) rather than a product-specific contract.
- No fine-grained per-resource authorization model yet.

## Recommended Next Steps

If the API must support external agents (not signed-in operators), add a parallel auth track:

1. Introduce service principals with scoped API tokens.
2. Keep current session auth for operator UI routes.
3. Apply route-level auth policy per endpoint type:
   - operator endpoints: session + role
   - agent endpoints: token scope + optional workspace scoping

## Code References

- Auth config: `src/server/auth/config.ts`
- Session helpers: `src/server/auth/index.ts`
- Role model: `src/server/auth/roles.ts`
- Protected API guard: `src/server/dashboard/api-auth.ts`
- Session typing: `src/types/next-auth.d.ts`
- Protected route examples:
  - `src/app/api/keywords/route.ts`
  - `src/app/api/threads/route.ts`
  - `src/app/api/posts/route.ts`
