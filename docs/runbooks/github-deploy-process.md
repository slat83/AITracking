# GitHub Branch, Commit, And Deploy Process

This runbook defines the repository workflow that connects issue execution, GitHub review, and VPS deployment. The goal is to keep `main` deployable, make every production change traceable, and avoid unreviewed or half-processed commits on long-lived branches.

Read this together with [vps-deployment.md](./vps-deployment.md), [vps-operations.md](./vps-operations.md), and [../security/storage-and-worker-policy.md](../security/storage-and-worker-policy.md).

## Hard rules

- `main` is the only production deployment branch.
- Do not deploy from a feature branch or a detached commit that is not on `main`.
- Every implementation change must map to a tracked issue.
- Every production-bound merge must pass CI before it is deployed.
- Every deploy must record the exact commit SHA that reached the VPS.
- Direct pushes to `main` are not part of the approved workflow.
- Do not hot-edit application code on the VPS. Production code reaches the server only through immutable release bundles created by GitHub Actions.

## Branch model

Use a short-lived branch per issue or tightly scoped fix.

Recommended naming:

- `feat/ait-43-github-deploy-process`
- `fix/ait-99-health-route-timeout`
- `chore/ait-120-ci-hardening`

Rules:

- Branch from the latest `origin/main`.
- Keep one branch focused on one issue or one release-safe unit of work.
- Rebase or merge `origin/main` into the branch before final review if it has drifted.
- Delete the branch after merge so stale work does not accumulate.

## Commit rules

Commits should be small enough to review and large enough to keep the branch coherent.

Required expectations:

- Write commits that describe the actual behavior change.
- Include the issue identifier in the commit subject or body.
- Do not mix unrelated refactors into the same branch.
- Do not commit secrets, `.env` files, VPS notes, or backup artifacts.

Recommended commit style:

```text
AIT-43 define GitHub and deploy process
AIT-43 require clean server worktree before deploy
```

If a branch becomes messy, clean it up before merge. The target is a reviewable branch and a clean merge to `main`, not a pile of unrelated checkpoint commits.

## Required verification

Run the repo verification suite before opening or merging a pull request:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Additional required checks when relevant:

- run database setup and seed flow when auth or data bootstrapping changes are touched
- verify Prisma migrations against a non-production database before merge
- verify the deploy or rollback steps in `docs/runbooks/vps-deployment.md` when infra files change

CI on GitHub is the enforcement backstop, not the first time the branch is tested.

## Pull request and review contract

Before merge, the pull request should state:

- linked issue
- user or operator impact
- deploy risk
- rollback plan
- whether schema, secrets, cron, or VPS config are affected

Review expectations:

- no unresolved review comments
- CI green on the final commit
- at least one reviewer for production-impacting changes once the engineering team is staffed for that checkpoint

If a branch changes materially after review, re-review it. Do not treat earlier approval as permanent.

## Merge policy

The approved path is: issue branch -> reviewed pull request -> `main` -> VPS deploy.

Rules:

- Merge only after CI passes on the final branch head.
- Keep `main` linear and readable. Prefer squash merge for small issue branches unless preserving multiple commits materially helps rollback or audit.
- After merge, confirm the resulting `main` commit is the one intended for deploy.
- If the merge includes migrations or operational changes, call that out in the deployment issue before release.

## Deploy readiness gate

Do not start a VPS deploy until all of the following are true:

- the target commit is already on `origin/main`
- GitHub CI is green for that commit
- the deployment issue includes a rollback note
- a current backup exists for high-risk deploys
- the operator knows whether the change touches schema, secrets, cron, or reverse proxy behavior

## GitHub Actions deploy workflow

Routine production deploys should run through the repository workflow at `.github/workflows/deploy.yml`.

Behavior:

- triggers automatically only after `CI` succeeds for a push to `main`
- supports manual `workflow_dispatch` for an approved redeploy or rollback follow-through
- uses the GitHub `production` environment so approvals and secret scoping can be enforced there
- uploads the repo contents as a tarball artifact for the target commit SHA
- unpacks the tarball into `VPS_APP_DIR/releases/<git-sha>`
- symlinks `VPS_APP_DIR/current` to the new release and links in `VPS_APP_DIR/shared/.env.production`
- rebuilds the Compose stack and runs the deep health check before marking the workflow successful

Required repository secrets:

- `VPS_HOST`
- `VPS_PORT`
- `VPS_USER`
- `VPS_APP_DIR`
- `VPS_SSH_PRIVATE_KEY`
- `VPS_SSH_KNOWN_HOSTS`

Bootstrap path:

1. Copy `ops/github/production-secrets.env.example` to the ignored local path `private/github-production-secrets.env`.
2. Fill in the real values locally.
3. Optionally validate the command and local secret file shape first with `./ops/github/bootstrap-production-environment.sh --repo <owner/repo> --dry-run`.
4. Authenticate the GitHub CLI with `gh auth login`.
5. Run `./ops/github/bootstrap-production-environment.sh --repo <owner/repo>`.

The bootstrap script:

- creates or updates the GitHub `production` environment
- configures it for protected branches only by default
- uploads the deploy secrets from the local ignored file
- supports `--dry-run` without GitHub auth so operators can validate the local manifest and generated commands before a live run

If `main` is not protected yet, the default environment policy will block deploys. Protect `main` first or run the bootstrap script with `--skip-branch-policy` and tighten the policy immediately afterward.

Do not commit the populated secret file. Keep host-specific notes and secret collection details in `private/` or `ops/local/`, not in tracked docs.

## Production environment bootstrap checklist

Use this sequence to complete the GitHub-side setup for the VPS deploy workflow.

1. Install GitHub CLI on the operator machine.
2. Copy `ops/github/production-secrets.env.example` to `private/github-production-secrets.env`.
3. Replace every placeholder in `private/github-production-secrets.env` with real production values.
4. Run `./ops/github/bootstrap-production-environment.sh --repo <owner/repo> --dry-run`.
5. Confirm the dry run prints one `gh api` environment call and six `gh secret set` calls.
6. Authenticate with `gh auth login`.
7. If `main` is not branch-protected yet, either protect it first or plan a one-time run with `--skip-branch-policy`.
8. Run `./ops/github/bootstrap-production-environment.sh --repo <owner/repo>`.
9. Open GitHub and verify `Settings -> Environments -> production` exists.
10. Confirm the `production` environment contains these secrets:

- `VPS_HOST`
- `VPS_PORT`
- `VPS_USER`
- `VPS_APP_DIR`
- `VPS_SSH_PRIVATE_KEY`
- `VPS_SSH_KNOWN_HOSTS`

This bootstrap is complete only when the `Deploy VPS` workflow can use the `production` environment without missing-secret failures.

Rules:

- `VPS_USER` must be the hardened non-root admin user created through `docs/runbooks/vps-access-hardening.md`, never `root`.
- `VPS_SSH_KNOWN_HOSTS` must contain the pinned host key entry for the VPS. Do not replace host verification with opportunistic `ssh-keyscan` inside the workflow.
- `VPS_APP_DIR` must point at the release root on the server, for example `/opt/flowvory`, with `shared/`, `releases/`, and `current` managed underneath it.
- Manual workflow runs are not a bypass for CI on unmerged branches. The approved target is still the commit already on `main`.

## VPS release procedure

Routine releases should be triggered from GitHub Actions, then verified on the VPS. From the server:

```bash
cd /opt/flowvory
readlink current
ls releases
docker compose --env-file shared/.env.production -f current/docker-compose.prod.yml ps
curl -fsS http://127.0.0.1:3000/api/health?deep=1
```

Rules:

- The release target must already be on `main` and have a green `CI` run.
- Record the deployed release SHA and the `current` symlink target in the linked issue or operating log.
- Do not modify files inside a release directory to "patch" production. Ship a new release instead.
- If health checks fail, stop and decide between rollback and forward-fix before more changes land on the server.

## Rollback procedure

Every deploy must leave enough evidence to return to the last known-good release quickly.

Minimum rollback record:

- last known-good release SHA
- backup confirmation when the release included risky data changes
- whether the release ran schema migrations

If rollback is required:

1. Identify the last known-good release directory under `VPS_APP_DIR/releases`.
2. Repoint `VPS_APP_DIR/current` to that release.
3. Re-run `docker compose --env-file VPS_APP_DIR/shared/.env.production -f VPS_APP_DIR/current/docker-compose.prod.yml up -d --build --remove-orphans`.
4. Restore the database only if the failure cannot be corrected at the application layer and the rollback plan explicitly requires it.
5. Record the rollback result in the issue before any new deploy attempt.

## Follow-on enforcement

## Optional local release verification

To mirror CI locally before opening or updating a production-impacting pull request, run:

```bash
./scripts/pre-push-verify-release.sh
```

Optional: add this as `.git/hooks/pre-push` to enforce verification on local pushes.

This runbook defines process. Engineering should keep these enforcement controls in place:

- branch protection on `main`
- required CI checks before merge
- the `Deploy VPS` workflow restricted to the `production` environment
- pull request template with deploy and rollback fields
- optional local hooks for pre-push verification

Apply the branch protection policy with:

```bash
./ops/github/enforce-release-policy.sh --repo <owner/repo>
```

Use `--dry-run` first when validating in a new repository.
