# VPS Operations Rules And Routines

This document defines the operating rules for the private VPS deployment path. Use it to keep production changes controlled, reversible, and visible.

For repository-wide documentation placement and worker handling rules, see [../security/storage-and-worker-policy.md](../security/storage-and-worker-policy.md).

## Hard rules

- Production for this repository runs on the private VPS only.
- Do not create or use Vercel configuration, environment variables, cron jobs, or deployment hooks for this app.
- Every production change must be reversible with a known rollback path.
- Database schema changes must ship through Prisma migrations committed to the repo.
- Daily cron, backups, and health checks are required operating controls, not optional cleanup work.
- Secrets live in `.env.production` on the server and must never be committed to git.
- SSH access must go through the hardened non-root admin path defined in `docs/runbooks/vps-access-hardening.md`.
- Sensitive operator notes, deploy transcripts, and incident scratchpads belong in ignored local paths such as `ops/local/` or `private/`, not in tracked docs.

## Ownership

- CTO: deployment policy, architecture, rollback standards, and operational review
- Engineering: implementation changes, migration safety, and release execution
- Operators: VPS access, reverse proxy, cron wiring, backup retention, and incident response

If one person holds multiple roles, they still follow the same checkpoints.

## Required workflows

### 1. Production change workflow

1. Confirm the change has a tracked issue and a rollback plan.
2. Review whether the change affects schema, cron behavior, secrets, or reverse proxy config.
3. Take or verify a current backup before high-risk deploys.
4. Deploy with `docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build`.
5. Run shallow and deep health checks.
6. Check logs for the app and database.
7. Record the deploy result in the issue before closing it.

### 2. Database change workflow

1. Commit the Prisma migration.
2. Verify the migration against a non-production database first.
3. Confirm rollback expectations before deploy.
4. Deploy and let `prisma migrate deploy` run as part of startup.
5. Check `/api/health?deep=1` after the deploy.

### 3. Incident workflow

1. Mark the active issue or incident thread with current impact.
2. Stop further production changes until the system is stable.
3. If a credential may be exposed, rotate it immediately and disable the compromised access path before routine deploy work resumes.
4. Decide whether rollback is faster and safer than forward-fixing.
5. Restore service.
6. Record root cause, mitigation, and any follow-up issue.

## Operating routines

### Daily

- Verify the previous cron run succeeded.
- Check app and DB health.
- Review recent logs for repeating failures.

### Weekly

- Confirm a recent backup can be located and is the expected size.
- Review container restarts and failed jobs.
- Check pending migrations and open production-impacting issues.

### Monthly

- Perform a restore drill in a non-production environment.
- Rotate any secrets that are due for rotation.
- Review VPS package updates, Docker version, and reverse proxy health.
- Verify root SSH login is still disabled and the admin access path still matches `vps-access-hardening.md`.

## Minimum evidence to keep

- deploy timestamp
- deployed commit or branch
- backup confirmation for risky changes
- health check result
- rollback decision if an incident occurred

Store that evidence in the linked issue or operational log so the change history is auditable.
When the evidence includes private infrastructure details, store the sensitive raw notes locally and publish only a redacted summary into the tracked issue or runbook.
