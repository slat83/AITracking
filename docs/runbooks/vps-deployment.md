# VPS Deployment Runbook

This runbook covers the Docker Compose based VPS deployment for the Flowvory application stack.

The private VPS is the only approved production deployment target for this repository. Do not use Vercel for production deploys, cron execution, or environment management.

Before adding host notes, deployment transcripts, or credentials to the workspace, follow [../security/storage-and-worker-policy.md](../security/storage-and-worker-policy.md). Public runbooks stay in `docs/runbooks/`; sensitive VPS notes belong in ignored local paths such as `ops/local/` or `private/`.

## Scope

- Next.js application container
- PostgreSQL container
- Prisma schema migrations
- Daily cron execution for reporting and due jobs
- Backup and restore procedures

## Tradeoffs

- This setup is optimized for a single VPS and a single application replica.
- The application runs `prisma migrate deploy` on boot by default. That is pragmatic and safe for a single app container, but if the stack is later scaled horizontally, move migrations into a one-shot release step.
- TLS termination is handled by the `traefik` service in `docker-compose.prod.yml`, which keeps the ingress path in-repo and removes the need for a separate host proxy bootstrap.

## Server prerequisites

Install these on the VPS before the first deploy:

- Docker Engine with the Compose plugin
- `curl`
- a hostname on a domain we control, with a public DNS `A` record for `APP_HOST` pointing at the VPS public IPv4 address

Recommended baseline:

1. Create an application user.
2. Create an app directory such as `/opt/flowvory`.
3. Clone the repository into `/opt/flowvory`.
4. Lock down inbound access so only `80` and `443` are public.
5. Confirm the hostname in `APP_HOST` already resolves to the VPS before starting the stack so ACME validation can succeed on first boot.

Do not depend on a provider-managed fallback hostname if that provider does not permit or reliably issue public certificates for it. The steady-state production hostname must live under a domain we control so DNS and certificate issuance are predictable.

Before the first deploy, harden the VPS access path with [vps-access-hardening.md](./vps-access-hardening.md). The approved steady state is key-based SSH through a named admin user with root SSH login disabled.

## Environment setup

1. Copy `.env.production.example` to `.env.production`.
2. Replace every placeholder secret.
3. Set `NEXT_PUBLIC_SITE_URL` to the final public origin.
4. Set `APP_HOST` to the hostname Traefik should route. Use a hostname under a domain we control, not a shared provider fallback domain.
5. Set `LETSENCRYPT_EMAIL` to the mailbox that should receive certificate expiry and ACME notices.
6. Keep `DATABASE_URL` pointed at the internal Compose hostname `db`.

Do not commit `.env.production`, backup outputs, or host-specific shell transcripts.

Example:

```bash
cp .env.production.example .env.production
```

Do not store the real `.env.production`, SSH key material, or root credential rotation notes anywhere in tracked files.

## First deploy

Run from the repository root on the VPS:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

What happens:

- Traefik starts on ports `80` and `443`.
- Traefik requests and renews a Let's Encrypt certificate for `APP_HOST`.
- PostgreSQL starts first.
- The app container waits for the DB service to become healthy.
- The app container runs `prisma migrate deploy`.
- The Next.js server starts on port `3000` and is exposed only through Traefik using `APP_HOST`.

## Optional first admin seed

Only do this on an empty environment where sample bootstrap data is acceptable:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml exec app npm run db:seed
```

Set `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` in `.env.production` before running the seed.

If production data should remain clean, create the first admin through a dedicated admin bootstrap flow instead of running the seed script.

## Verification

Check container state:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml ps
```

Check shallow health:

```bash
curl -fsS http://127.0.0.1:3000/api/health
```

Check trusted TLS on the public hostname:

```bash
curl -fsSI "https://${APP_HOST}"
```

Check DB-aware health:

```bash
curl -fsS http://127.0.0.1:3000/api/health?deep=1
```

Check recent logs:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml logs --tail=200 app db
```

## Daily cron setup

The app does not rely on a platform scheduler on a VPS. Configure a host cron job that calls the secured daily endpoint.

Example crontab entry:

```cron
5 5 * * * cd /opt/flowvory && ./scripts/run-cron-daily.sh >> /var/log/flowvory-cron.log 2>&1
```

This triggers:

- previous UTC day AI visibility aggregation
- due background job processing

## Backups

Create an on-demand database backup:

```bash
./scripts/backup-postgres.sh
```

Recommended host cron example:

```cron
20 2 * * * cd /opt/flowvory && ./scripts/backup-postgres.sh >> /var/log/flowvory-backup.log 2>&1
```

Store generated backups off the VPS as part of the broader disaster recovery plan.
Do not commit generated backup files to git.

## Restore

Restore from a gzip-compressed backup:

```bash
./scripts/restore-postgres.sh ./backups/postgres-YYYYMMDDTHHMMSSZ.sql.gz
```

The restore script is destructive for the target database. Stop the app first or restore into a fresh environment.

## Routine deploys

For normal upgrades:

```bash
git status --short
git fetch origin
git checkout main
git pull --ff-only origin main
git rev-parse HEAD
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

Then verify:

```bash
curl -fsS http://127.0.0.1:3000/api/health?deep=1
```

Routine deploy guardrails:

- only deploy commits that are already on `origin/main`
- stop if `git status --short` shows a dirty server checkout
- use `git pull --ff-only` so the VPS cannot create a merge commit during release
- record the result in the deployment issue or operational log together with the deployed commit SHA

For the full source-control and release policy, see [github-deploy-process.md](./github-deploy-process.md).

## Rollback

If a deploy is unhealthy:

1. Roll the git checkout back to the last known-good commit recorded in the deployment issue or operational log.
2. Re-run `docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build`.
3. If the issue is schema-related, restore the database from the most recent safe backup before reopening traffic.

## systemd boot integration

An example unit file is available at `ops/systemd/flowvory-compose.service`.

Install it with:

```bash
sudo cp ops/systemd/flowvory-compose.service /etc/systemd/system/flowvory-compose.service
sudo systemctl daemon-reload
sudo systemctl enable --now flowvory-compose.service
```

Adjust the `docker` binary path in the unit file if the VPS distribution installs it somewhere else.

## Related operating policy

For ownership, recurring routines, and production change control, see [vps-operations.md](./vps-operations.md).
