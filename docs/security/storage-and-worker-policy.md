# Storage And Worker Policy

This policy defines where sensitive material belongs, what may live in tracked repository content, and how workers handle operational documentation and secrets.

It applies to every contributor, operator, and automated worker touching this repository.

## Goals

- keep secrets and private operator context out of tracked git history
- make the allowed home for public documentation obvious
- make worker handoffs reproducible without leaking credentials or internal-only notes

## Canonical storage locations

### Public, tracked documentation

These locations are allowed in git as long as the content is redacted and safe for broad repo access:

- `README.md` for contributor-facing setup and policy summaries
- `docs/adr/` for architecture decisions
- `docs/runbooks/` for redacted operating procedures
- `docs/ux/` for product and UX operating artifacts
- `ops/` for reusable public operational assets such as unit files, templates, and scripts

Tracked documentation must not contain:

- real secrets, credentials, API tokens, cookies, or connection strings
- hostnames, IPs, usernames, or file paths that expose private infrastructure unless they are already intentionally public and low risk
- internal-only incident notes, ad hoc handoff context, or operator scratchpads
- backup artifacts, database dumps, or exported customer data

### Local-only private documentation

Use these ignored paths for sensitive working material that must stay in the workspace but out of git:

- `private/` for private notes, incident logs, vendor details, redacted screenshots, or handoff material that should not be committed
- `ops/local/` for host-specific operational notes, one-off command transcripts, or machine-specific deployment context

Anything in those directories is local-only by policy. If a note needs to become canonical team guidance, rewrite it into `docs/` or `ops/` in redacted form.

### Secrets and runtime configuration

- `.env` is the local development secret file and must stay untracked
- `.env.production` is the VPS runtime secret file and must stay untracked on the server
- `.env.example` and `.env.production.example` may contain placeholders only

Do not store real secret values anywhere else in the repository tree, including markdown files, scripts, issue exports, or backup filenames.

## Worker process rules

### 1. Default to public only

Workers should assume any new tracked file is public to the repository unless it is explicitly placed in an ignored private path.

### 2. Redact before promoting

If a private note becomes useful as durable process documentation, promote it by rewriting it into a redacted public document instead of moving the original file into `docs/`.

### 3. Never hand off secrets through git

Workers must not commit secrets, paste them into tracked docs, or embed them in code comments, fixtures, screenshots, or issue summaries.

### 4. Keep handoffs reproducible but sanitized

Issue comments, ADRs, and runbooks should capture:

- what changed
- why it changed
- where the public operating instructions live
- which private artifact exists, if one exists

They should not contain the sensitive artifact itself.

### 5. Treat backups and exports as sensitive

Database dumps, ad hoc CSV exports, and other operational artifacts belong in ignored local storage such as `backups/` or `private/`, never in tracked git content.

### 6. Escalate suspected leakage immediately

If a worker finds committed sensitive material, they should:

1. stop propagating it into new files or comments
2. remove it from the working tree if safe to do so
3. open or update the relevant issue with remediation steps
4. rotate the exposed secret if the value was real

## Current repository enforcement

The repository now ignores:

- `.env.production`
- `.env.*.local`
- `backups/`
- `private/`
- `ops/local/`
- common private key and certificate bundle extensions

This is baseline hygiene, not a substitute for judgment. A redacted doc can still be too detailed for tracked storage if it exposes sensitive operational context.
