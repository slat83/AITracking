# ADR 0001: Initial application foundation

## Status

Accepted

## Decision

Use a single TypeScript monolith built with Next.js, Prisma, and PostgreSQL.

The first version includes:

- one web application with server-rendered operator routes and API handlers
- Prisma as the relational schema and migration workflow
- credentials-based authentication with role checks for baseline access control
- a database-backed job queue seam for reminders and workflow automation
- Docker and CI as the first delivery baseline

## Rationale

- The product is greenfield and needs fast iteration more than service decomposition.
- The next issues depend on shared entities across opportunity intake, drafts, and distribution.
- A relational model gives clear ownership, audit history, and workflow transitions without introducing premature platform complexity.
- A database-backed job seam is enough for reminders and state transitions before dedicated infra or queue tooling is justified.

## Consequences

- We keep architecture simple now and accept that some modules will need extraction if load or integration complexity grows.
- UX polish remains intentionally limited until dedicated design judgment is available.
- Credentials auth is acceptable for the foundation, but external identity providers can be added later without replacing the domain model.
