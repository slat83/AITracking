# Dashboard API Token Management Runbook

This runbook defines the phase-2 dashboard API token operating model (registry-backed tokens with route scopes).

For repository-wide documentation placement and secret-handling rules, see [../security/storage-and-worker-policy.md](../security/storage-and-worker-policy.md).

## Scope

- Dashboard API auth for:
  - `/api/keywords`
  - `/api/threads`
  - `/api/posts`
- Registry table: `DashboardApiToken`
- Token CLI: `npm run dashboard:tokens -- <command>`

## Token model

- Raw bearer tokens are never stored in the database.
- Stored value: `tokenHash` (SHA-256).
- Each token has:
  - `id` (revocation handle)
  - `label`
  - `scopes` (`dashboard:read`, `dashboard:write`)
  - optional `workspaceId` (reserved for future workspace scoping)
  - optional metadata (`consumerId`, `notes`)
  - `lastUsedAt`
  - `revokedAt`

## Scope policy

- `dashboard:read`: required for `GET` dashboard routes.
- `dashboard:write`: required for `POST` and `DELETE` dashboard routes.
- `dashboard:write` implicitly grants read behavior.

## Issue a token

Example (write-capable token):

```bash
npm run dashboard:tokens -- issue \
  --label "agent-batch-writer" \
  --scopes dashboard:write \
  --consumer "agent:batch-writer"
```

Example (read-only token):

```bash
npm run dashboard:tokens -- issue \
  --label "analytics-reader" \
  --scopes dashboard:read \
  --consumer "job:analytics"
```

The command returns JSON including the raw token once. Move that token into approved secret storage immediately.

## List active tokens

```bash
npm run dashboard:tokens -- list
```

Include revoked records:

```bash
npm run dashboard:tokens -- list --include-revoked
```

## Revoke a token by id

```bash
npm run dashboard:tokens -- revoke --id <token-id>
```

Revocation is immediate for new requests.

## Rotation procedure

1. Create a tracked issue with owner and rollback owner.
2. Issue a new token with the same or narrowed scope as the current consumer.
3. Distribute only through approved secret channels.
4. Update consumers to the new token.
5. Verify successful requests and monitor telemetry (`dashboard_token_auth`) for failures.
6. Confirm `lastUsedAt` progresses for the new token.
7. Revoke the old token by id after migration is stable.

## Migration notes (phase-1 env token -> phase-2 registry)

1. Deploy migration `20260513141000_add_dashboard_api_token_registry`.
2. Bootstrap registry entries for existing env tokens while they are still in secure local operator context:

```bash
npm run dashboard:tokens -- issue \
  --label "legacy-primary-bootstrap" \
  --scopes dashboard:write \
  --token "$DASHBOARD_API_TOKEN"
```

If `DASHBOARD_API_TOKEN_PREVIOUS` is still in use, bootstrap it as a second token with a distinct label.

3. Confirm API auth with registry-backed token ids in telemetry (`source=registry`).
4. Remove legacy env-token reliance from active consumers.
5. Revoke superseded registry tokens when cutover is complete.

## Rollback

Use rollback only if service impact occurs and cannot be corrected quickly.

1. Keep at least one known-good prior token active until cutover is complete.
2. If the new token causes failures, switch affected consumers back to the known-good token.
3. Revoke only the failing token id.
4. Record incident summary and follow-up actions in the tracked issue.

## Verification checklist

- Authorized read token succeeds on `GET` routes.
- Read-only token is rejected (`403`) on write routes.
- Authorized write token succeeds on `POST`/`DELETE` routes.
- Revoked token is rejected (`401`).
- `lastUsedAt` updates on successful registry-backed requests.
- Telemetry includes `outcome`, `requiredScope`, `source`, and `tokenId`.

## Security notes

- Never commit tokens to git, docs, or issue comments.
- Never paste tokens in CI logs or screenshots.
- Keep raw token handoff material only in approved local private paths.
