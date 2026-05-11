# Canonical Workflow Handoff Template

Use this template to create the one canonical UX artifact that every user-facing engineering ticket must link before pickup.

Store the filled artifact in `docs/ux/` and name it after the workflow or ticket, for example:

- `docs/ux/intake-draft-workflow-contract.md`
- `docs/ux/ait-57-scenario-workspace-handoff.md`

If an existing artifact already covers the ticket cleanly, link that one instead of creating a duplicate.

## Handoff Metadata

- Handoff title:
- Related issue:
- Owner:
- Engineering owner:
- Reviewer:
- Status: draft | accepted | superseded
- Last updated:

## Outcome

What operator outcome or workflow change does this handoff define?

## Scope

- In scope:
- Out of scope:

## Primary User And Job

- Primary user or operator:
- Job to be done:
- Trigger or entry point:
- End state:

## Canonical Flow

1. Step 1
2. Step 2
3. Step 3

## State And Ownership Model

| Object or step | Operator label | Owner | Meaning | Exit criteria |
| --- | --- | --- | --- | --- |
| Example | Example | Example | Example | Example |

## Minimum Required Data

### Required fields

- field
- field

### Required validations or blockers

- validation
- validation

## UX States To Cover

- empty state
- loading or busy state
- validation failure state
- success confirmation
- exception or recovery state

## Notes For Engineering

- labels or writing rules that must stay stable
- known schema or implementation constraints
- approved compromises or explicit non-goals

## Review Gate

- Engineering-ready check: [docs/ux/engineering-ready-checklist.md](./engineering-ready-checklist.md)
- Pre-merge or pre-release check: [docs/ux/design-review-checklist.md](./design-review-checklist.md)
- Ticket-specific review focus:
  - focus item
  - focus item

## References

- linked plan, issue, or prior UX artifact
