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

## UXD-002: Treat intake-to-approval as one canonical operator flow

- Date: 2026-05-10
- Related issue: [AIT-40](/AIT/issues/AIT-40)
- Status: accepted
- Owner: UX Designer

### Context

[AIT-4](/AIT/issues/AIT-4) and [AIT-5](/AIT/issues/AIT-5) can drift quickly if engineering treats intake, triage, draft creation, and review as separate local screens without a shared workflow contract. The current schema also exposes a few later-stage states that do not belong in the first operator-facing draft UI.

### Decision

Define one canonical path from opportunity intake through draft approval in `docs/ux/intake-draft-workflow-contract.md`, and treat the operator-facing labels in that document as the product contract for the first implementation slice.

Specifically:

- opportunity states are `Intake`, `In triage`, `Ready for draft`, and `Archived`
- draft states for the first slice are `Drafting`, `In review`, and `Approved`
- `Scheduled` and `Published` remain future-facing implementation states and should not shape the first draft workflow UI
- review returns should move the draft back into drafting with the reviewer note preserved visibly

### Impact

- Engineering has one reference for labels, transitions, required metadata, and edge cases.
- The first workflow slice stays focused on intake and review clarity instead of prematurely exposing later distribution states.
- Any deviation from the contract now requires an explicit UX decision instead of silent drift in code.

### Follow-up

- Use the workflow contract during UX review for [AIT-4](/AIT/issues/AIT-4) and [AIT-5](/AIT/issues/AIT-5).
- Add a follow-up decision if engineering needs a dedicated `changes requested` or `blocked` draft state.

## UXD-003: Make the CRM workspace scenario-first, with tasks and artifacts as child modules

- Date: 2026-05-10
- Related issue: [AIT-49](/issues/AIT-49)
- Status: accepted
- Owner: UX Designer

### Context

The updated product plan in `plans/ait-36-universal-crm-plan.md` redefines the product as a workflow CRM organized around scenarios instead of a content-first tool. The current repo UI is still anchored to the intake queue in `src/app/app/opportunities/page.tsx`, so engineering needs a clear workspace model before extending the shell.

### Decision

Define the primary CRM workspace as a scenario-first split view with:

- a queue for scenario selection and prioritization
- a center-column scenario detail workspace for durable context and timeline
- a right-rail action surface for next action, blockers, approvals, and proof requirements

Tasks, drafts, responses, and other artifacts remain visible, but they should appear as child modules within the scenario instead of becoming the page's primary identity.

EpicVIN-specific launch material should live as templates and seeded playbooks inside the broader shell, not as hard-coded navigation or permanent taxonomy.

The canonical structure is documented in `docs/ux/universal-crm-scenario-workspace-brief.md`.

### Impact

- Engineering can evolve the current opportunity-first UI into a reusable scenario workspace without losing the existing intake flow.
- The product shell now has a clear separation between scenario context, task context, blockers, approvals, and evidence.
- EpicVIN can stay the launch pack without narrowing the long-term product model.

### Follow-up

- Use the scenario workspace brief as the UX contract for future workspace implementation tickets.
- Record any deviation from the split-view and right-rail decision before merge if engineering finds a stronger pattern.

## UXD-004: Keep scenario status separate from blocker, evidence, approval, and outcome state

- Date: 2026-05-10
- Related issue: [AIT-49](/issues/AIT-49)
- Status: accepted
- Owner: UX Designer

### Context

The scenario workspace needs to explain not just where a scenario sits in the queue, but why it can or cannot move. A single status label cannot reliably express progress, proof readiness, approval state, and execution result at the same time.

### Decision

Use one scanable scenario-level workflow status in the queue, then model supporting state dimensions separately for:

- blocker state
- evidence readiness
- approval status
- outcome state

The action rail and queue badges should combine these dimensions selectively instead of collapsing them into one overloaded label.

### Impact

- Engineering can keep queue sorting simple while still surfacing next-action prerequisites.
- The next-best-action module can explain why an operator is blocked or cleared to proceed.
- Future automation and reporting can query each state dimension independently.

### Follow-up

- Validate which two or three supporting badges belong in queue rows before implementation.
- Keep the full supporting state detail inside the scenario workspace instead of mirroring every state in list views.

## UXD-005: Define the CRM as a scenario-first operator cockpit, not an intake-first content tool

- Date: 2026-05-10
- Related issue: [AIT-60](/issues/AIT-60)
- Status: accepted
- Owner: UX Designer

### Context

The current CRM direction is split between a launch-specific content-ops framing and a broader scenario-first workflow model. Engineering needs one product-level concept that explains the shell, object hierarchy, and core operator loop before deeper implementation continues.

### Decision

Define the CRM as a scenario-first operator cockpit. The `scenario` remains the durable system-of-record object, while signals, tasks, artifacts, approvals, evidence, and outcomes operate as linked child modules.

The product's defining interaction is no longer `capture opportunity -> make draft`. It becomes `understand scenario -> decide next best action -> satisfy proof and approvals -> execute -> observe outcome`.

The canonical concept brief is documented in `docs/ux/crm-product-concept-and-ux-paradigm.md`.

### Impact

- The signed-in product should be described and organized as a workflow CRM, not a vertical-specific content tool.
- Intake remains an important entry surface, but it should not define the global product identity.
- Future implementation tickets can evaluate whether they strengthen or weaken the scenario-first cockpit model.

### Follow-up

- Use the concept brief as the product-level reference for future CRM UX tickets.
- Validate the naming and approval-scope questions with leadership before locking external positioning.

## UXD-006: Require one canonical UX handoff artifact before user-facing engineering pickup

- Date: 2026-05-11
- Related issue: [AIT-108](/AIT/issues/AIT-108)
- Status: accepted
- Owner: UX Designer

### Context

The delivery-org operating plan now requires every user-facing engineering ticket to reference one canonical UX artifact, but the current queue still relies mostly on generic UX review language. That creates a predictable failure mode: engineering gets a review owner, but not a single source of truth for states, handoffs, fields, and edge cases before implementation starts.

### Decision

Require every user-facing engineering ticket to link exactly one canonical UX artifact in `docs/ux/` before engineering pickup.

Use the following operating documents together:

- `docs/ux/design-request-template.md` when a new UX decision needs to be framed
- `docs/ux/workflow-handoff-template.md` when a workflow-specific artifact must be created
- `docs/ux/engineering-ready-checklist.md` as the pre-pickup gate
- `docs/ux/design-review-checklist.md` as the pre-merge or pre-release gate

Existing artifacts such as `docs/ux/intake-draft-workflow-contract.md` or `docs/ux/universal-crm-scenario-workspace-brief.md` should be reused when they already define the ticket cleanly. Do not create duplicate UX sources for the same workflow.

### Impact

- Engineering gets a stable pre-pickup contract instead of only a later review gate.
- CTO can audit queue readiness by checking for one linked UX artifact, not by inferring readiness from broad acceptance language.
- UX review moves from reactive cleanup toward explicit workflow handoff and edge-state definition.

### Follow-up

- Link the exact handoff artifact from each active implementation issue before pickup.
- Reject pickup when a ticket still points to multiple competing UX sources.

## UXD-007: Keep scenario reassignment and escalation inside the action rail as separate inline flows

- Date: 2026-05-11
- Related issue: [AIT-144](/AIT/issues/AIT-144)
- Status: accepted
- Owner: UX Designer

### Context

The scenario workspace shell already reserves a right-rail surface for `Escalate or reassign`, but engineering still lacks a concrete contract for how reassignment differs from escalation, what fields are required, how the mobile stack should behave, and where audit history should appear after a change.

### Decision

Keep reassignment and escalation inside the existing action rail as two separate inline actions that expand in place instead of navigating to a new screen or opening a detached management flow.

Use the workflow contract in `docs/ux/ait-144-scenario-reassignment-escalation-handoff.md` as the canonical implementation artifact. Require mandatory reason capture for both actions, explicit permission and empty-target states, and post-action audit visibility in both the scenario timeline and the collapsed rail summary.

### Impact

- Engineering can implement the current shell without inventing new IA or modal-heavy workflow detours.
- Operators keep blocker, approval, and ownership context visible while making the change.
- The product preserves a clear distinction between day-to-day ownership transfer and higher-level escalation.

### Follow-up

- Link the handoff from [AIT-127](/AIT/issues/AIT-127) before implementation resumes.
- Validate the final target-list schema against the UI distinction between `escalation target` and `escalation owner`.
