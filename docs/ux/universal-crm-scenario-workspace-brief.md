# Universal CRM Scenario Workspace UX Brief

This document defines the operator-facing workspace structure for [AIT-49](/issues/AIT-49). It translates the scenario-centric product direction from `plans/ait-36-universal-crm-plan.md` into a decision-ready information architecture for engineering.

## Outcome

The primary CRM surface should shift from an opportunity-only queue into a scenario workspace that answers three questions quickly:

1. What happened?
2. What should happen next?
3. What proof, blocker, or approval is preventing progress?

The `scenario` becomes the long-lived workspace object. Intake records, tasks, artifacts, and outcomes remain visible inside the scenario, but none of them should replace it as the system of record.

## Primary User Questions

The interface must answer these questions without forcing the operator to inspect every child task:

1. What happened, and why does this scenario exist now?
2. How urgent or risky is it for the business?
3. What should happen next?
4. Who owns that next action?
5. What proof, approval, or dependency is still missing?
6. What has already been tried, and what changed as a result?

## Primary Navigation Model

The broader product shell should use this top-level navigation:

- `Workspace`: the active scenario queue and detail workspace
- `Evidence`: reusable proof assets, source links, and policy references
- `Playbooks`: scenario types, recommended actions, and prerequisites
- `Templates`: reusable launch packs and artifact templates
- `Reporting`: outcome and workflow health views
- `Settings`: permissions, approved channels, and taxonomy management

`Workspace` is the default landing area. It should open on the queue, not on a dashboard full of detached metrics.

## Workspace Information Architecture

The workspace should use a split view:

- left column: primary queue
- center column: scenario detail
- right column: action rail

On narrower screens, this becomes a stacked flow in the same order: queue, scenario detail, action rail.

### 1. Primary queue

The queue is the operator's control surface for finding the next scenario to move. It should support:

- tabs or saved views by `My work`, `Needs triage`, `Waiting on approval`, `Blocked`, and `Recently updated`
- filters for scenario type, urgency, account, owner, channel, and last-updated age
- sort by urgency, SLA risk, evidence readiness, approval risk, and last activity

Each queue row should show:

- scenario title
- scenario type
- account or brand context
- current stage
- next best action
- owner
- blocker or approval badge when present
- freshness signal such as `updated 2h ago`

The queue row should not try to expose every task. It exists to help operators choose which scenario needs intervention next.

### 2. Scenario detail workspace

The center column is the main reading surface. It should have five ordered sections:

#### Scenario header

- scenario title
- account and market context
- scenario type
- priority and urgency
- current owner
- current stage
- lifecycle health badge such as `on track`, `at risk`, or `blocked`

#### Situation summary

This is the "what happened" area. It should include:

- short operator-written summary
- originating signal or signals
- why this matters now
- affected channel or surface
- last meaningful outcome

#### Context timeline

This section should show the ordered record of:

- signal intake
- classification changes
- evidence attached or invalidated
- task creation and completion
- approvals requested or decided
- artifacts created
- outcome updates

Use one shared timeline instead of separate activity widgets so operators can reconstruct the scenario without hunting.

#### Scenario context block

This is where the durable scenario facts live. It should include:

- user problem or demand
- target audience or affected customer segment
- business risk or upside
- scenario-level hypothesis
- relevant playbook
- attached evidence summary
- reusable notes that apply across multiple tasks or artifacts

#### Task and artifact lane

Show child workflow objects as linked modules, not as the primary page identity:

- open tasks grouped into `Now`, `Waiting`, and `Done`
- artifacts grouped by type such as draft, response, FAQ, support macro, or brief
- explicit relationship labels such as `created from this scenario` or `requires approval before use`

### 3. Action rail

The right rail should remain stable while the center content changes. It should contain:

- `Next best action` card
- `Required proof` checklist
- `Approvals` module
- `Blockers` module
- `Escalate or reassign` controls

This rail is where operators decide what to do next without scanning the full detail view again.

## Core Reusable Modules

### Next best action card

This module should always appear above the fold. It needs:

- recommended action label
- why this is the recommendation
- recommended owner role
- required prerequisites
- one primary CTA
- one secondary CTA to dismiss, reassign, or override with reason

### Evidence panel

Evidence should appear as a reusable module, not as freeform notes inside tasks. The panel should separate:

- confirmed proof
- pending proof requests
- stale or disputed proof

Each evidence item should show source, trust level, last validation date, and which actions depend on it.

### Blockers module

Blockers should be first-class and visible in both queue and detail views. The module needs:

- blocker summary in plain language
- blocker type such as missing evidence, missing approval, channel restriction, or external dependency
- named owner for unblocking
- timestamp for when the blocker was raised
- direct link to the blocking object or approval

### Approvals module

Approvals belong beside blockers, not buried in artifact detail. The module should show:

- approval type
- current status
- approver
- what is being approved
- decision deadline or SLA
- latest decision note

### Approval and blocker hierarchy

The action rail should answer one operator question before anything else: what is stopping progress right now, who owns the unblock, and what resolves it.

Recommended action-rail order:

1. `Next best action`
2. `Blockers`
3. `Approvals`
4. `Required proof`
5. `Escalate or reassign`

Hierarchy rules:

- If an active blocker exists, show the blocker module immediately below `Next best action`.
- Keep approvals directly below blockers because approval gates are a common blocking path and need to be read in the same scan.
- Do not place `Required proof` above blockers or approvals when proof state is only supporting context for an already-blocked action.
- Lead each module with the human decision, not the system label. Prefer `Legal review is blocking launch copy` over generic headings like `Approval state` or `Blocker`.

Minimum metadata priority inside each card:

- first line: plain-language blocker or approval summary
- second line: owner or approver, plus blocker type or approval type
- third line: age signal such as raised time, requested time, or deadline/SLA
- fourth line: approval target or linked blocking object
- fifth line: latest decision note or unblock instruction

This means engineering needs the workspace query layer to expose blocker owner, blocker type, raised timestamp, linked blocking object, approval target, approver, and latest decision note as first-class module fields. If those fields are absent, the rail cannot support fast operator decisions.

### Outcome panel

This module should sit below the task and artifact lane. It should capture:

- last action taken
- observed result
- confidence level
- whether follow-up is required
- link to the next scenario or next task if the work branched

## Scenario Context Versus Task Context

The workspace must make this distinction obvious:

### Scenario context

Scenario context is durable and should persist across multiple actions. It includes:

- the customer or market problem
- why it matters
- which playbook applies
- which evidence matters
- what success looks like

### Task context

Task context is temporary and action-specific. It includes:

- the single action being executed now
- assignee
- due date
- task-specific notes
- completion state

### UX rule

Scenario context should live in the center-column summary and context sections. Task context should live in the task lane and action rail. Do not let task forms overwrite or visually crowd out the scenario summary, or the product will collapse back into a task tracker.

## EpicVIN Launch Template Placement

EpicVIN-specific material should live inside `Templates`, not inside global navigation labels or hard-coded queue taxonomies.

Recommended structure:

- `Templates`
- `Launch packs`
- `EpicVIN`
- `Trust`
- `Comparison`
- `Budget / low-cost`
- `VIN decoder`

Each launch template should include:

- seeded scenario definitions
- default evidence checklist
- recommended playbook
- preferred artifact templates
- channel guidance
- launch-specific outcome metrics

Inside the scenario detail view, template provenance should appear as a small badge such as `Template: EpicVIN / Trust` with a link back to the source template. That keeps launch specificity visible without turning the whole product shell into an EpicVIN-only interface.

## Recommended Operator Flows

### Triage flow

1. Operator scans the queue and opens a scenario.
2. Scenario header and summary explain the situation in under one screen.
3. Action rail recommends `Classify`, `Attach evidence`, `Assign draft`, or another concrete next step.
4. If prerequisites are missing, the blocker and evidence modules explain why progress is stopped.

### Execution flow

1. Operator or specialist opens the scenario from `My work`.
2. The next best action card points to the active task or artifact.
3. The task lane shows related child work without hiding scenario-level context.
4. The outcome panel prompts the operator to record what changed once the action is complete.

### Approval flow

1. Scenario appears in `Waiting on approval`.
2. Approval module names the approver and decision scope.
3. The artifact or action under review is visible in the task and artifact lane.
4. Decision result updates the next best action and either clears the blocker or sends the scenario back with context preserved.

## States And Labels

Use operator-facing labels that work across content, support, trust, and community scenarios:

- `Needs triage`
- `Ready for action`
- `In progress`
- `Waiting on approval`
- `Blocked`
- `Done`

Task- and artifact-level states can remain more specific, but the queue should prioritize these scenario-level working states for scanability.

## Supporting State Model

The queue-level scenario status is not enough on its own. The workspace also needs explicit supporting states for blockers, evidence, approvals, and outcomes so the next-best-action module can explain itself.

### Blocker states

- `clear`: no active blocker
- `at risk`: work can continue, but a missing dependency or approaching SLA could stop the scenario soon
- `blocked`: progress is stopped by a concrete dependency
- `escalated`: blocked condition has been handed to a named owner outside the current operator flow

Each active blocker should also carry:

- blocker type
- named unblock owner
- raised timestamp
- linked blocking object, task, or approval

### Evidence readiness states

- `missing`: no acceptable proof is attached for the recommended action
- `partial`: some proof exists, but one or more required items are still missing
- `ready`: required proof exists and is current
- `stale`: proof exists, but it needs refresh or revalidation before use
- `restricted`: proof exists, but policy or channel limits prevent unrestricted use

Evidence readiness should be visible in both the queue and the action rail because it changes what the operator is allowed to do next.

### Approval states

- `not required`: the next action does not need approval
- `required`: approval is needed before execution can proceed
- `requested`: approval request is active and awaiting a decision
- `approved`: the action or artifact is cleared for use
- `changes requested`: the approver rejected the current version but expects a revision
- `denied`: the action should not proceed in its current form
- `expired`: a prior approval existed, but its policy or time window is no longer valid

Approval state should always identify the approval target so operators can tell whether the decision applies to the scenario, a task, or an artifact.

### Mobile and stacked behavior

The stacked layout must preserve the action rail as a high-priority surface instead of letting it fall below the full detail workspace.

- On narrow screens, keep the action rail above lower-priority detail modules, or pin a compact urgent-state summary near the top before the user scrolls.
- Preserve the same order on mobile as desktop: `Next best action`, `Blockers`, `Approvals`, `Required proof`, then `Escalate or reassign`.
- The first mobile viewport should expose blocker owner, blocker type, blocker age, approval target, approver, and latest decision note without requiring a long scroll through timeline or artifact content.
- If the rail must collapse, collapse proof and escalation detail before hiding blocker or approval context.
- Test the stacked layout with an active blocker and a pending approval at the same time. The design fails if the user has to scroll past the queue and scenario detail before seeing why work is stopped.

### Outcome states

- `not started`: no execution outcome exists yet
- `in observation`: an action was taken and the scenario is waiting for a measurable result
- `resolved`: the scenario goal was met with no immediate follow-up required
- `partially resolved`: progress was made, but another scenario step or follow-up action is still needed
- `no effect`: the last action did not change the scenario materially
- `regressed`: the situation worsened after the last action
- `branched`: the work created a follow-up scenario, escalation, or downstream task

Outcome state should sit below the action modules so operators can compare the last recommendation against the actual result.

## Engineering Guidance

- Keep the queue focused on scenario-level status, not artifact counts alone.
- Preserve one canonical scenario timeline instead of separate history per child object.
- Treat `opportunity` as an intake source that can roll up into a scenario, not as the permanent primary object.
- Make blockers and approvals queryable, because they drive both queue views and the action rail.
- Keep EpicVIN launch templates as seeded data and template references, not route structure or hard-coded enums.

## Open UX Risks And Research Questions

- Operators may disagree on where a scenario ends and a new scenario begins after an outcome or escalation. This needs an explicit object-boundary decision during implementation.
- `Next best action` logic may feel opaque if the recommendation does not show the prerequisite reasoning clearly enough.
- The right-rail model depends on reliable blocker and approval metadata. If engineering cannot model that cleanly, the workspace will lose its core decision advantage.
- Mobile behavior needs intentional prioritization. The stacked layout should preserve the action rail near the top, or urgent next steps will become hidden.
- Cross-functional terminology still needs validation. Teams may prefer `case`, `workflow`, or `work item` over `scenario`, but the product should not rename the object inconsistently by surface.
- Queue scanability may degrade if evidence, blocker, and approval states compete visually. The implementation should test badge priority before adding every state to the row.

## Immediate Follow-up For Engineering

1. Introduce a `Scenario`-level page shell before broadening artifact-specific screens.
2. Model blockers, approvals, and evidence as first-class modules in the scenario schema and query layer.
3. Keep the current opportunity queue as an intake entry view, but route approved items into the scenario workspace instead of extending the opportunity page indefinitely.
