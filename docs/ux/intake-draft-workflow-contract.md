# Intake And Draft Workflow Contract

This document is the canonical UX contract for the first operator-facing workflow slice behind [AIT-4](/AIT/issues/AIT-4) and [AIT-5](/AIT/issues/AIT-5).

It defines:

- the primary operator path from opportunity capture through draft approval
- the operator-facing labels and meanings for core states
- the minimum metadata required at each handoff
- the edge cases engineering must handle before this workflow is used by non-engineering operators
- the review expectations UX will use before merge or release

## Scope

In scope for this contract:

- opportunity intake
- triage and prioritization
- conversion from opportunity to draft
- draft review and approval handoff

Out of scope for this contract:

- downstream distribution assignment
- analytics and automation rules beyond what the operator needs to understand the workflow
- advanced collaboration patterns such as concurrent editing or threaded commenting

## Primary User And Job

Primary user for the first slice: internal operator responsible for capturing content opportunities, clarifying them, and moving the strongest ones into draft review.

Primary job to be done:

`Take a raw content opportunity, qualify it quickly, turn it into a draftable brief, and move it through review without ambiguity about ownership or next action.`

## Primary Flow

1. Operator creates an opportunity from the intake form or queue entrypoint.
2. Opportunity lands in `Intake` until the required capture fields are present.
3. Operator reviews the opportunity in triage, confirms it is worth acting on, and sets priority plus owner.
4. Opportunity moves to `Ready for draft` only when the brief is specific enough for another operator to draft without reinterpreting strategy.
5. Operator creates a draft from that opportunity.
6. Draft starts in `Drafting` (`OUTLINE` in the schema) while the first pass is being written.
7. Draft moves to `In review` when the writer is explicitly asking for reviewer feedback or approval.
8. Reviewer either sends the draft back for changes or approves it.
9. Approved draft becomes the handoff point for the later distribution workflow.

## Workflow Objects

### Opportunity

The opportunity record is the intake and triage object. It exists to answer two questions fast:

- Is this worth acting on now?
- If yes, what exactly should the draft cover?

### Draft

The draft record is the content workspace object. It exists to answer:

- What is being produced from this opportunity?
- Who owns the next step?
- Is the draft still being written, under review, approved, or blocked?

## Operator-Facing State Contract

### Opportunity states

| System state | Operator label | Meaning | Exit criteria |
| --- | --- | --- | --- |
| `INTAKE` | Intake | Newly captured or incomplete opportunity that still needs basic qualification context. | Required capture fields are present and an operator can judge quality. |
| `TRIAGE` | In triage | Opportunity is being reviewed for priority, ownership, and actionability. | Operator chooses either `Ready for draft` or `Archived`. |
| `READY_FOR_DRAFT` | Ready for draft | Opportunity is approved for drafting and contains enough brief detail for handoff. | Draft is created or opportunity is later archived. |
| `ARCHIVED` | Archived | Opportunity will not move forward now. | No further action unless manually restored in a later version. |

### Draft states

| System state | Operator label | Meaning | Exit criteria |
| --- | --- | --- | --- |
| `OUTLINE` | Drafting | First-pass draft work is in progress. | Writer submits for review or draft is intentionally closed later. |
| `IN_REVIEW` | In review | Draft is awaiting reviewer decision or change request. | Reviewer approves it or sends it back to drafting. |
| `APPROVED` | Approved | Draft is ready for downstream distribution planning. | Distribution workflow begins in a later slice. |
| `SCHEDULED` | Scheduled later | Reserved for future distribution planning. Do not expose in the first AIT-5 UI unless distribution work is also present. | Future scope. |
| `PUBLISHED` | Published later | Reserved for future publish/completion reporting. Do not expose in the first AIT-5 UI. | Future scope. |

## Required Data By Stage

### Minimum opportunity capture fields

- title
- source
- priority
- why it matters now
- suggested asset or distribution angle
- owner

These fields align to the manual operating rules and are the minimum needed for a useful intake queue. `source URL`, tags, and notes can be optional in the first slice, but the UI should make it obvious when they are absent.

### Minimum `Ready for draft` brief fields

- target audience and question
- target scenario
- asset type
- key evidence or proof requirement
- target CTA or desired next step
- owner
- due date

An opportunity must not be moved to `Ready for draft` if these fields are missing. The UI should block the transition and name the missing items plainly.

### Minimum draft review metadata

- draft title
- draft body or content area
- linked source opportunity
- draft owner
- reviewer
- most recent review note or decision

## Queue And Detail View Expectations

### Intake queue

The queue should let operators scan and sort by:

- status
- priority
- owner
- date captured or last updated
- source

The queue must make the primary next action obvious. For the first slice that usually means:

- complete missing intake fields
- start triage
- move to `Ready for draft`
- archive low-value items

### Opportunity detail view

The detail view should separate:

- source context
- prioritization context
- brief-readiness fields
- ownership and due-date metadata

The state control should not be a naked enum. It should explain what the next state means and why an operator would choose it.

### Draft list or linked view

For AIT-5, an operator must be able to distinguish at a glance:

- drafts still being written
- drafts waiting on review
- drafts approved for the next workflow
- drafts sent back for revision

If the implementation does not add a distinct blocked or changes-requested enum yet, the UI must still communicate that condition through review status, notes, or a visible return-to-drafting action.

## Transition Rules

### Opportunity transition rules

- `Intake` to `In triage`: allowed when the capture fields exist.
- `In triage` to `Ready for draft`: allowed only when the draft brief fields are complete.
- `In triage` to `Archived`: allowed when the opportunity is weak, off-scenario, vague, or not actionable now.
- `Ready for draft` back to `In triage`: allowed if a reviewer or operator discovers the brief is still ambiguous.

### Draft transition rules

- `Drafting` to `In review`: allowed only when a reviewer has been assigned.
- `In review` to `Approved`: reviewer confirms the content is ready for downstream use.
- `In review` back to `Drafting`: reviewer requests changes, clarification, or missing proof.

## Edge Cases Engineering Must Handle

- Empty queue: explain that no opportunities exist yet and point to the create action.
- No results after filtering: preserve the current filters and offer a clear reset action.
- Missing required fields on save or transition: show field-level guidance and name the blocked transition.
- Attempt to move to `Ready for draft` without a usable brief: stop the transition and list the missing brief inputs.
- Draft submitted for review without a reviewer: stop the transition and require reviewer assignment.
- Draft returned from review: keep the reviewer note visible in the drafting state so the writer does not have to reconstruct context.
- Archived opportunities: make them clearly non-active and exclude them from the default working queue.
- Long text or evidence notes: preserve formatting enough that proof requirements and reviewer notes remain scannable.

## UX Writing Rules

- Use `opportunity` for the intake object and `draft` for the content object. Do not rename them per page.
- Prefer action labels that describe the outcome: `Move to triage`, `Mark ready for draft`, `Send for review`, `Approve draft`.
- Avoid exposing raw implementation terms such as enum keys, internal IDs, or database-oriented field names.
- When blocking a transition, explain both the problem and the next step.

## Known Gaps And Decisions

- The current schema does not include a dedicated draft `blocked` or `changes requested` enum. Until engineering adds one, the UI must make returned-review work explicit through notes and a visible state change back to drafting.
- `Scheduled` and `Published` exist in the schema but belong to a later workflow stage. They should not shape the first draft-review UI.
- Restore-from-archive behavior is not required for the first slice and can remain an explicit follow-up if engineering needs it later.

## Review Expectations For AIT-4 And AIT-5

Before merge or release of user-facing work in these tickets:

1. Review against [docs/ux/design-review-checklist.md](./design-review-checklist.md).
2. Confirm the build matches the state labels and transition rules in this contract.
3. Record any intentional deviation from this contract in [docs/ux/decision-log.md](./decision-log.md) before release.

### Ticket-specific review focus

For `AIT-4`:

- intake form completeness and validation clarity
- triage queue scanability
- state and priority labels
- opportunity detail-page next-action clarity

For `AIT-5`:

- create-draft handoff from opportunity context
- reviewer assignment and review submission path
- returned-for-revision clarity
- approval visibility and downstream readiness cues
