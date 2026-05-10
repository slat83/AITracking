# Content Ops Foundation

This repository now contains the initial application foundation for the content opportunity, drafting, and distribution workflow system described in the planning docs.

## Stack

- Next.js 16 with the App Router
- PostgreSQL with Prisma
- Credentials-based auth with role-aware route protection
- Database-backed background job seam
- Docker Compose for local database
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
npx prisma db push
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

6. Visit `/sign-in` and use the seeded admin credentials from `.env`.

Set `NEXT_PUBLIC_SITE_URL` to the canonical public origin when testing metadata, `robots.txt`, and `sitemap.xml`.

## Vercel deployment

This app is compatible with Vercel's Node.js runtime. Before the first deployment:

1. Add `DATABASE_URL` in the Vercel project environment settings.
2. Add `AUTH_SECRET` and keep `AUTH_TRUST_HOST=true`.
3. Add `CRON_SECRET` with a random value of at least 16 characters.
4. Set `NEXT_PUBLIC_SITE_URL` to the deployed canonical origin.
5. Run `npx prisma db push` against the target database before expecting auth, dashboard, jobs, or analytics routes to work.

The repo includes a Hobby-compatible Vercel cron in [vercel.json](./vercel.json) that calls `/api/cron/daily` once per day at `05:00 UTC`. That endpoint is secured with `CRON_SECRET`, aggregates the previous UTC day's AI visibility events, and drains any due database jobs.

Vercel Hobby cron jobs are limited to once per day and can arrive any time within the scheduled hour. The reporting pipeline is intentionally idempotent to tolerate that behavior.

The database-backed routes in `/app`, `/api/auth`, `/api/analytics/visibility`, and `/api/cron/daily` are pinned to the Node.js runtime and should not be moved to Edge without revisiting the Prisma and auth setup.

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
