# Engineering-Ready Checklist

Use this before engineering pickup for any user-facing ticket.

This is the pre-implementation gate. `docs/ux/design-review-checklist.md` remains the pre-merge or pre-release gate.

## Required Ticket Inputs

- One canonical UX artifact in `docs/ux/` is linked directly from the ticket.
- The business outcome and priority are stated plainly.
- The primary user or operator is named.
- The workflow slice or surface in scope is explicit.
- The primary next action or job to be done is described in operator language.
- Entry point and end state are both defined.
- Required states, transitions, and ownership handoffs are named.
- Minimum required fields and validation rules are listed for the flow.
- Empty, loading, success, and failure states are called out where relevant.
- Dependencies, blockers, and prerequisite non-UX work are linked as tickets.
- Out-of-scope items or deferred follow-ups are named so engineering does not guess.
- Review owner and review trigger are stated.

## Engineering-Ready Decision

Mark the ticket engineering-ready only when every item below is true:

- The canonical UX artifact answers the implementation questions without requiring hidden verbal context.
- Any operating-rule ambiguity has an owner outside engineering.
- Any required infra, access, data, or deployment setup is already ticketed.
- The implementation owner can start the happy path and key edge states without inventing labels, fields, or handoff rules.

## If The Ticket Fails The Gate

- Keep it in `todo` or move it to `blocked` if another ticket truly prevents progress.
- Add the missing UX artifact or update the existing one.
- Create follow-up tickets for prerequisite non-UX work instead of burying those tasks in implementation notes.
