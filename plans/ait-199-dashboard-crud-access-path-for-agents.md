# AIT-199 Dashboard CRUD Access Path for Agents

## Scope

Evaluate how agents can perform CRUD on dashboard tracking resources (`keywords`, `threads`, `posts`) without breaking operator workflows.

## Current Access Paths

| Path | Client type | Auth mechanism | Authorization result |
| --- | --- | --- | --- |
| Session path | Signed-in operator UI | NextAuth session cookie | `EDITOR` or `ADMIN` can CRUD |
| Token path | Agents/integrations/scripts | `Authorization: Bearer <DASHBOARD_API_TOKEN>` | Valid token maps to editor-level CRUD |

Protected endpoints:

- `GET/POST/DELETE /api/keywords`
- `GET/POST/DELETE /api/threads`
- `GET/POST/DELETE /api/posts`

## Findings

1. Agent CRUD path exists and is functional through bearer token auth.
2. Operator dashboard CRUD path remains functional through session-role auth.
3. The two paths are now explicitly handled in one guard: `requireDashboardEditor(request)`.
4. The current token model is intentionally coarse-grained (single shared secret, editor-level scope only).

## Key Risks

| Risk | Impact | Likelihood | Notes |
| --- | --- | --- | --- |
| Single shared token compromise | High | Medium | No per-consumer isolation or revocation |
| No read/write scope separation | Medium | Medium | Any valid token can execute full CRUD |
| No formal rotation runbook | Medium | Medium | Recovery/rollover speed depends on ad-hoc ops |

## Decision

Keep a hybrid auth model now:

- Session auth for the operator UI.
- Token auth for agent and script automation.

Reason: this preserves current product behavior while enabling machine-to-machine CRUD access with minimal implementation cost.

## Recommended Next Steps

### Next 30 Days

1. Add token rotation runbook (including overlap window and rollback steps).
2. Add basic usage telemetry for dashboard token requests (endpoint, outcome, timestamp, caller fingerprint where feasible).

### Next 90 Days

1. Introduce token registry (hashed tokens, per-consumer metadata, revoke-by-id).
2. Add scoped permissions (`dashboard:read`, `dashboard:write`) and enforce at route level.
3. Add optional workspace scoping if multi-workspace agent operations become a requirement.
