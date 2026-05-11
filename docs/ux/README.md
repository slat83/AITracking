# Lean UX Operating Artifacts

This directory is the working UX operating layer for early product delivery.

It exists to keep three things visible while engineering starts:

- what UX decisions have been made
- how user-facing work gets reviewed before merge or release
- which workflow assumptions need research next

## Files

- `design-request-template.md`: short request form for new UX definition work before engineering starts
- `workflow-handoff-template.md`: template for the one canonical UX artifact each user-facing ticket must link before engineering pickup
- `engineering-ready-checklist.md`: pre-pickup gate for user-facing engineering tickets
- `intake-draft-workflow-contract.md`: canonical workflow contract for the first intake and draft-review slice
- `universal-crm-scenario-workspace-brief.md`: decision-ready UX structure for the scenario-first CRM workspace
- `crm-product-concept-and-ux-paradigm.md`: replacement CRM concept and product-level UX paradigm for the next phase
- `decision-log.md`: canonical record of UX decisions, open questions, and follow-up actions
- `design-review-checklist.md`: the minimum review gate for user-facing work
- `research-backlog.md`: prioritized questions and assumptions to validate

## How To Use This

### UX decision log

- Add a new entry when a workflow, content, navigation, state, or interaction decision is made.
- Keep each entry short: context, decision, impact, and follow-up.
- Link the relevant issue or PR when possible.

### Design review checklist

- Use this for any user-facing ticket before merge.
- If an item is not applicable, mark it explicitly instead of silently skipping it.
- Capture failures in the ticket so engineering and UX share the same fix list.

### Engineering-ready checklist

- Use this before engineering pickup, not after implementation starts.
- If the ticket cannot point to one canonical UX artifact in `docs/ux/`, it is not UX-ready for pickup.
- Pair this with a filled workflow handoff artifact for new user-facing tickets.

### Research backlog

- Review the top three items weekly.
- Promote an item when it is blocking scope, causing repeated debate, or increasing implementation risk.
- Convert completed items into decisions or follow-up tickets instead of leaving them in backlog form.

## Weekly Maintenance

- Monday: review the research backlog and move the highest-risk open questions into the week’s active tickets.
- Midweek: add new decisions as engineering tradeoffs are made.
- Friday: confirm design review coverage on shipped or merged user-facing work and archive completed research items.

## Canonical Handoff Rule

Every user-facing engineering ticket must link exactly one canonical UX artifact in `docs/ux/` before engineering pickup. That artifact can be:

- a workflow-specific handoff created from `workflow-handoff-template.md`
- an existing workflow contract or UX brief that already covers the ticket cleanly

Do not link multiple competing UX docs and force engineering to guess which one wins.

## Ownership

- Primary owner: UX Designer
- Review partners: CTO and implementation owner for active product tickets

This should stay lean. If a document stops helping weekly delivery, simplify it instead of adding more process.
