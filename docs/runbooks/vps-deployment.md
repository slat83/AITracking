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
- Immutable release directories managed by GitHub Actions

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
3. Create `/opt/flowvory/shared` for long-lived runtime files such as `.env.production`.
4. Create `/opt/flowvory/releases` for immutable release bundles.
5. Lock down inbound access so only `80` and `443` are public.
6. Confirm the hostname in `APP_HOST` already resolves to the VPS before starting the stack so ACME validation can succeed on first boot.

Do not depend on a provider-managed fallback hostname if that provider does not permit or reliably issue public certificates for it. The steady-state production hostname must live under a domain we control so DNS and certificate issuance are predictable.

Before the first deploy, harden the VPS access path with [vps-access-hardening.md](./vps-access-hardening.md). The approved steady state is key-based SSH through a named admin user with root SSH login disabled.

## Release layout

The approved server layout is:

- `APP_DIR/shared/.env.production` for the canonical runtime env file
- `APP_DIR/releases/<git-sha>` for unpacked immutable releases
- `APP_DIR/current` as a symlink to the active release

Do not edit code inside `current` or any historical release directory on the VPS. All code changes must come from a new GitHub Actions deploy.

## Environment setup

1. Copy `.env.production.example` to `APP_DIR/shared/.env.production`.
2. Replace every placeholder secret.
3. Set `NEXT_PUBLIC_SITE_URL` to the final public origin.
4. Set `APP_HOST` to the hostname Traefik should route. Use a hostname under a domain we control, not a shared provider fallback domain.
5. Set `LETSENCRYPT_EMAIL` to the mailbox that should receive certificate expiry and ACME notices.
6. Keep `DATABASE_URL` pointed at the internal Compose hostname `db`.

Do not commit `.env.production`, backup outputs, or host-specific shell transcripts.

Example:

```bash
install -d /opt/flowvory/shared
cp .env.production.example /opt/flowvory/shared/.env.production
```

Do not store the real `.env.production`, SSH key material, or root credential rotation notes anywhere in tracked files.

## First deploy

The first release should come through `.github/workflows/deploy.yml` after the GitHub `production` environment is bootstrapped. The workflow uploads the repository as a tarball, expands it into `APP_DIR/releases/<git-sha>`, symlinks `APP_DIR/current`, and starts the Compose stack from that release.

Before triggering the first deploy, verify:

- `APP_DIR/shared/.env.production` exists on the VPS
- the GitHub `production` environment secrets are populated
- `APP_HOST` already resolves to the VPS public IP

If the workflow has not run yet, use GitHub Actions `workflow_dispatch` on `Deploy VPS` after `main` contains the intended commit.

What happens:

- GitHub Actions uploads the release tarball to the VPS.
- The VPS unpacks it into `APP_DIR/releases/<git-sha>`.
- The release gets a symlink to `APP_DIR/shared/.env.production`.
- `APP_DIR/current` is atomically repointed to the new release.
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

From the VPS, use the active release path for checks:

```bash
cd /opt/flowvory/current
```

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
5 5 * * * cd /opt/flowvory/current && ./scripts/run-cron-daily.sh >> /var/log/flowvory-cron.log 2>&1
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
20 2 * * * cd /opt/flowvory/current && ./scripts/backup-postgres.sh >> /var/log/flowvory-backup.log 2>&1
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

Routine production releases should run through GitHub Actions, not by updating code in place on the VPS.

Normal operator sequence:

```bash
cd /opt/flowvory
readlink current
ls releases
docker compose --env-file shared/.env.production -f current/docker-compose.prod.yml ps
```

Then trigger or observe the `Deploy VPS` workflow for the target `main` commit and verify on the VPS:

```bash
cd /opt/flowvory/current
curl -fsS http://127.0.0.1:3000/api/health?deep=1
```

Routine deploy guardrails:

- only deploy commits that are already on `main` and have passed CI
- do not hot-edit files inside `current`, `releases/`, or `shared/.env.production` during release execution
- record the deployed release SHA, the `current` symlink target, and the health check result in the deployment issue or operational log
- keep at least the current and previous known-good release directories until the new deploy is proven stable

For the full source-control and release policy, see [github-deploy-process.md](./github-deploy-process.md).

## Rollback

If a deploy is unhealthy:

1. Identify the previous known-good release directory recorded in the deployment issue or operational log, for example `APP_DIR/releases/<previous-sha>`.
2. Repoint `APP_DIR/current` to that release.
3. Re-run Compose against `current/docker-compose.prod.yml` with `shared/.env.production`.
4. Verify `/api/health?deep=1`.
5. If the issue is schema-related, restore the database from the most recent safe backup before reopening traffic.

Example:

```bash
cd /opt/flowvory
ln -sfn /opt/flowvory/releases/<previous-sha> current
docker compose --env-file shared/.env.production -f current/docker-compose.prod.yml up -d --build --remove-orphans
curl -fsS http://127.0.0.1:3000/api/health?deep=1
```

## systemd boot integration

An example unit file is available at `ops/systemd/flowvory-compose.service`.

Install it with:

```bash
sudo cp ops/systemd/flowvory-compose.service /etc/systemd/system/flowvory-compose.service
sudo systemctl daemon-reload
sudo systemctl enable --now flowvory-compose.service
```

The example unit assumes:

- `WorkingDirectory=/opt/flowvory/current`
- env file at `/opt/flowvory/shared/.env.production`
- Compose file at `/opt/flowvory/current/docker-compose.prod.yml`

Adjust those paths and the `docker` binary location if the VPS uses a different layout.

## Related operating policy

For ownership, recurring routines, and production change control, see [vps-operations.md](./vps-operations.md).
