# Flowvory App

This repository contains the canonical Next.js application for Flowvory. It includes the operator workflow CRM foundation described in the planning docs: opportunity intake, drafting, review, and approved distribution across reputation and demand scenarios.

Documentation and secret-handling rules live in [docs/security/storage-and-worker-policy.md](./docs/security/storage-and-worker-policy.md). Read that policy before adding new runbooks, operator notes, or environment files.
Dashboard tracking endpoint details live in [docs/api/dashboard-endpoints.md](./docs/api/dashboard-endpoints.md).

## Stack

- Next.js 16 with the App Router
- PostgreSQL with Prisma
- Credentials-based auth with role-aware route protection
- Database-backed background job seam
- Docker Compose for local database
- GitHub Actions for CI
- GitHub Actions for CI

## Quick start

1. Copy `.env.example` to `.env`.
2. Start PostgreSQL:

```bash
docker compose up -d
```

3. Install dependencies and initialize the schema:

```bash
npm install
npx prisma migrate dev
npm run db:seed
```

4. Process the seeded jobs, including the initial AI visibility daily report:

```bash
npm run jobs:run
```

5. Start the app:

```bash
npm run dev
```

6. Visit `/sign-in` and use the local seeded admin credentials from your untracked `.env`.

Set `NEXT_PUBLIC_SITE_URL` to the canonical public origin when testing metadata, `robots.txt`, and `sitemap.xml`.

## Deployment policy

The supported production deployment target is a private VPS that we control. Vercel is no longer an approved runtime for this repository, and this app is the only approved production surface.

Use these documents as the source of truth:

- [docs/runbooks/github-deploy-process.md](./docs/runbooks/github-deploy-process.md) for branch rules, commit verification, pull request expectations, and the approved GitHub-to-VPS release flow
- [docs/runbooks/vps-deployment.md](./docs/runbooks/vps-deployment.md) for first deploys, routine deploys, rollback, backups, and restore
- [docs/runbooks/vps-access-hardening.md](./docs/runbooks/vps-access-hardening.md) for the approved SSH access path and exposed-root-credential response flow
- [docs/runbooks/vps-operations.md](./docs/runbooks/vps-operations.md) for operating rules, ownership, daily and weekly routines, and change control
- [docs/runbooks/dashboard-api-token-rotation.md](./docs/runbooks/dashboard-api-token-rotation.md) for dashboard token issuance, revocation, rotation, rollback, and auth telemetry verification
- [docs/adr/0002-private-vps-deployment.md](./docs/adr/0002-private-vps-deployment.md) for the architectural decision behind the policy
- [docs/security/storage-and-worker-policy.md](./docs/security/storage-and-worker-policy.md) for documentation placement, private-note handling, and secrets rules

For GitHub-side deploy bootstrap, use `ops/github/bootstrap-production-environment.sh` together with `ops/github/production-secrets.env.example` and the deploy-process runbook. Populate the real secrets only in an ignored local file under `private/`.

The database-backed routes in `/app`, `/api/auth`, `/api/analytics/visibility`, and `/api/cron/daily` are pinned to the Node.js runtime and should not be moved to Edge-style runtimes without revisiting the Prisma and auth setup.

## VPS deployment

The repo now includes a single-VPS Docker Compose deployment path with:

- `docker-compose.prod.yml` for the app and PostgreSQL
- `.env.production.example` for production configuration
- Prisma migrations in `prisma/migrations`
- `scripts/start-production.sh` to run `prisma migrate deploy` before boot
- backup, restore, and cron helper scripts in `scripts/`
- immutable release directories on the VPS at `shared/`, `releases/`, and `current`
- an operator runbook at `docs/runbooks/vps-deployment.md`

For a first deploy on a VPS:

```bash
install -d /opt/flowvory/shared
cp .env.production.example /opt/flowvory/shared/.env.production
```

Then bootstrap the GitHub `production` environment and run the `Deploy VPS` GitHub Actions workflow so the server receives a new immutable release under `/opt/flowvory/releases/<git-sha>` and repoints `/opt/flowvory/current`.

Set `NEXTAUTH_SECRET` to the same value as `AUTH_SECRET`, set `NEXTAUTH_URL` to the same canonical origin as `NEXT_PUBLIC_SITE_URL`, and set `LETSENCRYPT_EMAIL` plus `APP_HOST` before the first boot so Traefik can provision a trusted certificate. `APP_HOST` should be on a domain we control rather than a provider-managed fallback hostname.

## Deferred after convergence

This runtime convergence intentionally does not rewrite every legacy public surface yet.
The following remain deferred to follow-on product-positioning issues:

- legacy public marketing and comparison routes still seeded around the earlier thesis
- existing seed data and reporting examples that are still branded around prior scenarios
- broader Flowvory messaging, information architecture, and onboarding copy updates

Those items should not reopen production runtime ownership. The canonical production answer is still this Next.js app on the private VPS path above.

Use the runbook for the rest of the operating flow, including cron wiring, backups, restore, and rollback.

## Core directories

- `src/app`: routes, UI shell, and API handlers
- `src/content`: public AI visibility page records that drive templates, metadata, and schema
- `src/server/analytics`: first-party AI visibility event capture and daily rollup logic
- `src/server/auth`: auth configuration and role checks
- `src/server/db`: Prisma client
- `src/server/jobs`: job enqueue/claim/process seam
- `prisma`: schema and seed
- `docs/adr`: architecture decisions

## Verification commands

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Keyword Workbook Import

To import workbook keywords through the authenticated dashboard API:

```bash
DASHBOARD_API_TOKEN=... \
tsx scripts/import-keyword-workbook.ts ./keywords.xlsx --sheet "All Keywords"
```

Use `--replace` to replace the tracked keyword set instead of appending:

```bash
DASHBOARD_API_TOKEN=... \
tsx scripts/import-keyword-workbook.ts ./keywords.xlsx --replace
```

Optional: set `DASHBOARD_API_BASE_URL` (or pass `--api-base-url`) when the API is not at `http://localhost:3000/api`.

## Dashboard Token Operations

Use the registry-backed token CLI:

```bash
npm run dashboard:tokens -- list
npm run dashboard:tokens -- issue --label "agent-writer" --scopes dashboard:write
npm run dashboard:tokens -- revoke --id <token-id>
```

Use a token value returned by `issue` as `DASHBOARD_API_TOKEN` in scripts or runtime secrets.
