# Scenario Reassignment And Escalation Handoff

## Handoff Metadata

- Handoff title: Scenario reassignment and escalation controls for the workspace action rail
- Related issue: [AIT-144](/AIT/issues/AIT-144)
- Owner: UX Designer
- Engineering owner: CTO UI implementation owner
- Reviewer: CTO
- Status: accepted
- Last updated: 2026-05-11

## Outcome

Define the first implementation contract for reassignment and escalation from the scenario workspace action rail in `src/app/app/page.tsx`.

The operator should be able to move ownership or request higher-level intervention without leaving the existing scenario shell, while preserving audit visibility and making blocked or read-only cases obvious.

## Scope

- In scope:
  - action-rail placement and card structure for `Escalate or reassign`
  - desktop and mobile behavior inside the existing workspace shell
  - field set, validation rules, and confirmation states for reassignment and escalation
  - permission-denied, read-only, empty, and post-action audit states
- Out of scope:
  - new navigation, standalone management screens, or a new information architecture
  - deep permissions matrices beyond the UI affordances needed for the first implementation
  - automatic routing logic or SLA policy design beyond the labels exposed in the card

## Primary User And Job

- Primary user or operator: scenario owner or operations lead working from the scenario workspace
- Job to be done: keep the scenario moving when the current owner is wrong or the current path needs intervention
- Trigger or entry point: the `Escalate or reassign` card in the right-side action rail
- End state: ownership or escalation is submitted, visible in audit history, and reflected in the card summary

## Canonical Flow

1. Operator opens a scenario and scans the action rail after `Next best action`, `Blockers`, `Approvals`, and `Required proof`.
2. Operator reaches the `Escalate or reassign` card and chooses one of two explicit actions: `Reassign owner` or `Escalate`.
3. The card expands inline instead of navigating away. Only one form is open at a time.
4. Operator selects the target person or role, enters a required reason, and reviews the short consequence summary before submit.
5. On submit, show an inline confirmation state in the card and append a visible timeline event with actor, previous owner or level, new owner or target, timestamp, and reason summary.
6. After success, collapse back to a summary card that shows the latest ownership or escalation state plus a `View latest audit note` anchor into the timeline.

## State And Ownership Model

| Object or step | Operator label | Owner | Meaning | Exit criteria |
| --- | --- | --- | --- | --- |
| Default card | Escalate or reassign | Current scenario owner | No form is open. The card shows current owner, current escalation state if any, and the two available actions. | Operator chooses `Reassign owner` or `Escalate`. |
| Reassignment form | Reassign owner | Current scenario owner or authorized lead | Transfer day-to-day ownership of the scenario without changing scenario identity. | Valid target and reason submitted successfully or cancelled. |
| Escalation form | Escalate | Current scenario owner or authorized lead | Request higher-level intervention while keeping the scenario in the same workspace. | Valid target and reason submitted successfully or cancelled. |
| Confirmation state | Update recorded | System with operator-visible audit | Mutation succeeded and the card confirms what changed. | Card collapses to the default summary state. |
| Read-only state | You cannot change ownership | Unauthorized viewer | The operator can see current owner and escalation status but cannot mutate them. | Operator leaves the card or receives broader access. |
| Empty target state | No eligible targets available | System/admin gap | The action exists conceptually, but the user cannot complete it because no valid assignee or escalation target is configured. | Admin config is fixed or the operator uses another route. |

## Minimum Required Data

### Required fields

- shared for both actions:
  - scenario id
  - current owner
  - acting user
  - reason
- reassignment:
  - new assignee
- escalation:
  - escalation target or destination team
  - escalation owner if different from the destination label

### Required validations or blockers

- `Reason` is required for both actions and should enforce a minimum useful length of one short sentence, not a one-word note.
- Disable submit until a valid target and reason exist.
- Prevent no-op reassignment to the current owner.
- If the scenario is already in a pending escalation state, keep `Escalate` available only as `Update escalation` when policy allows it; otherwise show a read-only status message.
- If the operator lacks permission, do not show enabled controls that fail only after submit. Show a read-only explanation immediately.
- If no eligible target list exists, show an empty state instead of an empty select control.

## Field-Level Contract

### Reassign owner

- Primary trigger: `Reassign owner`
- Fields:
  - `New owner`
  - `Reason for reassignment`
- Helper copy:
  - `Use reassignment when the scenario should stay active, but a different operator should own the next step.`
- Confirmation copy pattern:
  - `Scenario reassigned to {name}. Timeline updated.`

### Escalate

- Primary trigger: `Escalate`
- Fields:
  - `Escalation target`
  - `Escalation owner`
  - `Reason for escalation`
- Helper copy:
  - `Use escalation when the current path cannot proceed without higher authority, cross-team action, or exception handling.`
- Confirmation copy pattern:
  - `Scenario escalated to {target}. Timeline updated.`

## Placement And Layout Decisions

- Keep the card in the existing right rail under `Required proof` and below blocker and approval context.
- Desktop:
  - show a collapsed summary by default
  - expand the chosen form inline inside the same card
  - keep the primary submit action pinned to the bottom of the open card section
- Mobile or stacked layout:
  - keep the `Escalate or reassign` card in the same action-rail order as desktop
  - preserve the collapsed summary near the top action modules; do not push it below the full timeline
  - when expanded, let the form take full card width with stacked inputs and the submit action visible without horizontal scrolling
- Do not move this flow into a modal for the first implementation. The rail already carries the surrounding context the operator needs.

## UX States To Cover

- empty state:
  - `No eligible owners are available right now. Ask an admin to update scenario routing.`
- loading or busy state:
  - disable inputs and show inline progress text inside the open card section
- validation failure state:
  - inline field message under the missing or invalid input
- success confirmation:
  - short success banner inside the card plus timeline entry
- exception or recovery state:
  - keep the form open, preserve entered text, and show a concise failure message with retry affordance
- permission-denied state:
  - `You can view ownership history, but only authorized leads can reassign or escalate this scenario.`
- read-only scenario state:
  - if the scenario is closed, archived, or otherwise immutable, show the latest owner and escalation status without action buttons

## Audit Visibility

- Every successful reassignment or escalation must create a timeline event in the main scenario timeline.
- The event should include:
  - actor
  - previous owner or prior escalation state
  - new owner or escalation target
  - timestamp
  - reason summary
- The collapsed rail card should show the latest audit summary in one line, for example:
  - `Last changed 2h ago by Alex: reassigned to Morgan`
- Include a `View latest audit note` anchor that scrolls to the timeline item when possible.

## Notes For Engineering

- Preserve the scenario-first shell in `src/app/app/page.tsx`; this flow is an inline action-rail mutation, not a route change.
- Keep reassignment and escalation as distinct actions with distinct labels. Do not collapse them into one generic `change owner` action.
- The first implementation can use simple target lists and inline form state, but the query layer must expose enough data to render the latest audit summary and read-only reasons.
- If engineering cannot support both `escalation target` and `escalation owner` separately in the first pass, prefer storing both fields in the data contract even if they initially point to the same entity. The UI distinction matters.

## Review Gate

- Engineering-ready check: [docs/ux/engineering-ready-checklist.md](./engineering-ready-checklist.md)
- Pre-merge or pre-release check: [docs/ux/design-review-checklist.md](./design-review-checklist.md)
- Ticket-specific review focus:
  - reason capture stays mandatory for both actions
  - mobile stacked layout keeps urgent ownership controls visible
  - audit visibility appears in both the timeline and the collapsed card summary
  - permission-denied and no-target states are explicit, not silent failures

## References

- [AIT-127](/AIT/issues/AIT-127)
- [AIT-144](/AIT/issues/AIT-144)
- `src/app/app/page.tsx`
- [universal-crm-scenario-workspace-brief.md](./universal-crm-scenario-workspace-brief.md)
