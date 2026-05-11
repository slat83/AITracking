# ADR 0002: Private VPS deployment only

## Status

Accepted

## Decision

Operate the production system on a private VPS we control and remove Vercel as a supported deployment target for this repository.

The approved production model is:

- Docker Compose on a single VPS
- PostgreSQL running alongside the app on the same host
- host-managed cron invoking `/api/cron/daily`
- reverse proxy and TLS termination managed on infrastructure we control

## Rationale

- We need predictable infrastructure behavior, direct operational control, and a deployment surface that matches our current budget and team size.
- The application already depends on Prisma migrations, database-backed jobs, and secured cron execution, which are simpler to reason about on a controlled VPS than across split platform conventions.
- A single documented operating model reduces deployment drift, unclear ownership, and hidden platform assumptions.

## Consequences

- Production changes must follow the VPS runbooks and operator routines.
- Vercel-specific configuration and documentation should not be added back without a new architecture decision.
- Cron execution, backups, restore, and rollback are now explicit team responsibilities rather than delegated platform behavior.

## Deferred after convergence

This decision only settles production runtime ownership.
It does not by itself rewrite legacy public content, demo copy, or seeded scenario data that still reflects the earlier thesis.
Those changes belong in the follow-on Flowvory positioning and onboarding issues, while production remains anchored to this single Next.js runtime.
