# UX Decision Log

Use this file as the canonical record for workflow and interface decisions that affect delivery.

## Entry Template

```md
## UXD-00X: Short decision title

- Date:
- Related issue:
- Status: proposed | accepted | superseded
- Owner:

### Context

What problem or ambiguity required a decision?

### Decision

What was decided?

### Impact

What changes in scope, implementation, content, or review because of this decision?

### Follow-up

- Action item
```

## Decisions

## UXD-001: Keep the initial UX operating layer in `docs/ux/`

- Date: 2026-05-10
- Related issue: [AIT-23](/issues/AIT-23)
- Status: accepted
- Owner: UX Designer

### Context

The repository had planning artifacts in `plans/`, but no durable home for operating UX documents that need weekly updates during engineering delivery.

### Decision

Store the lean UX operating artifacts in `docs/ux/` and treat that directory as the canonical working area for UX governance during early implementation.

### Impact

- UX artifacts remain separate from one-time planning documents.
- Engineering has one stable location for review expectations and open UX questions.
- Future workflow maps, acceptance criteria, or usability summaries can be added without reshaping the planning directory.

### Follow-up

- Add links to these files from future implementation tickets that introduce user-facing flows.
- Create the first workflow-specific decision entries as soon as active product tickets define screens or states.
