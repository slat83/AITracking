# CRM Product Concept And UX Paradigm

This document defines the replacement CRM concept requested in [AIT-60](/issues/AIT-60). It reviews the current product framing and sets the intended UX paradigm for the next product phase.

## Executive Summary

The current CRM is caught between two identities:

- a launch-specific EpicVIN content-ops tool
- a broader scenario-first workflow CRM

The replacement concept should commit fully to the second identity.

The product should become an operator cockpit for managing reputation, demand, support, trust, and distribution scenarios from first signal through outcome. Content drafts, approvals, evidence, and execution tasks remain important, but they should behave as child modules inside one long-lived scenario record.

## 1. Diagnosis: What Feels Outdated In The Current Concept

### 1. Product framing is still launch-artifact-first instead of CRM-first

The live root experience still presents `Content Ops Foundation` and public EpicVIN marketing pages as the primary identity. That makes the product feel like a campaign site or proof-of-concept microsite rather than the CRM itself.

### 2. The workflow still starts from intake objects instead of decision objects

The current authenticated workflow is still heavily anchored to `opportunity` intake and draft handoff. That is useful for one slice of work, but it is too narrow to act as the main product model for support, trust, escalation, comparison, approval, and follow-up scenarios.

### 3. The interface is organized around records, not operating judgment

The current workspace direction introduces scenario detail, but the overall concept still does not fully center the core operator questions:

1. What changed?
2. What matters now?
3. What is the next best action?
4. What is blocking it?
5. What proof or approval is missing?
6. What happened after we acted?

Without those questions driving the shell, the product risks collapsing into a queue plus detail pages instead of a real decision system.

### 4. Launch-specific language leaks into global structure

EpicVIN is a valid launch pack, but the current framing still leaks vertical-specific language and assumptions into the shell. That makes the product feel narrower than the company goal and weakens the CRM story.

### 5. Secondary modules are not yet first-class enough

The intended model depends on blockers, approvals, evidence, ownership, and outcomes being queryable, visible, and stable across scenarios. Today they still read more like supporting metadata than core workflow objects.

### 6. The shell lacks a durable operating rhythm

The current concept implies pages and states, but it does not yet express a strong closed loop:

`signal -> classify -> decide -> prepare -> approve -> execute -> observe -> learn`

That loop should be the product's backbone.

## 2. Proposed Product Concept

### Product definition

The CRM is a scenario orchestration system.

Its job is to help operators capture a meaningful business scenario, understand what is happening, decide the next best action, coordinate the right people and artifacts, and record whether the action changed the outcome.

### Core object model

- `Scenario`: the durable system-of-record object
- `Signal`: the originating intake, trigger, or event that created or updated the scenario
- `Action`: the recommended or assigned next move
- `Task`: a concrete unit of work owned by a person
- `Artifact`: a draft, response, brief, FAQ, policy note, or other output created for the scenario
- `Evidence`: proof that supports or restricts an action
- `Approval`: a formal decision gate on a task, artifact, or scenario
- `Outcome`: the observed result of the last completed action

### Product promise

The CRM should answer:

- what is happening
- why it matters
- what should happen next
- what is required before that action is safe to take
- what changed after the action

## 3. UX Paradigm

### Primary paradigm: Scenario-first operator cockpit

The new CRM should feel less like a list of records and more like a control surface for active scenarios.

The dominant interaction is:

1. scan the queue
2. open a scenario
3. understand its state in one screen
4. take or assign the next best action
5. observe the outcome and continue or close

### Secondary paradigm: Child-work modules, not page identity

Tasks, drafts, approvals, and artifacts should never become the primary identity of the workspace. They are modules inside the scenario, not replacements for it.

### Tertiary paradigm: Recommendation with explanation

The interface should recommend the next action, but it must always show the reason. The product should not feel like an opaque automation engine. Operators need to trust why a scenario is blocked, urgent, ready, or routed to approval.

## 4. Core User Journeys

### Journey 1: Triage a new signal

1. Operator sees a new signal in the queue.
2. Operator opens the scenario and reviews summary, urgency, and context.
3. Operator classifies the scenario and confirms owner.
4. Product recommends the next best action: archive, gather proof, draft response, request approval, or assign execution.

### Journey 2: Prepare a response or asset

1. Operator opens a live scenario from `My work`.
2. Action rail points to the required output.
3. Scenario context stays visible while the operator creates or updates the artifact.
4. Artifact is linked back to the scenario with explicit proof requirements and approval state.

### Journey 3: Resolve blockers

1. Scenario appears in a blocked or at-risk view.
2. Operator sees the blocker type, owner, age, and affected action immediately.
3. Operator either resolves the dependency, escalates it, or re-routes the next action.

### Journey 4: Approval and decision

1. Scenario enters a waiting-on-approval state.
2. Approval module shows exactly what is under review and by whom.
3. Decision returns to the same scenario with context preserved.
4. The next best action updates automatically to revision, execution, or closure.

### Journey 5: Outcome logging and follow-up

1. An action completes.
2. Operator records observed result, confidence, and follow-up need.
3. Scenario moves to observation, resolved, partially resolved, or branched.
4. If needed, a new child task or branched scenario is created without losing the original history.

## 5. Information Architecture

### Top-level navigation

- `Workspace`: active scenario queue and detail workspace
- `Evidence`: reusable proof assets and source records
- `Playbooks`: scenario types, rules, and recommended actions
- `Templates`: launch packs, seeded checklists, and artifact templates
- `Reporting`: workflow health and outcome visibility
- `Settings`: taxonomy, permissions, policies, and integrations

### Workspace structure

- left column: queue and saved views
- center column: scenario detail workspace
- right column: action rail

### Queue views

- `My work`
- `Needs triage`
- `Ready for action`
- `Waiting on approval`
- `Blocked`
- `Recently updated`

### Scenario detail sections

- scenario header
- situation summary
- context timeline
- durable scenario context
- task and artifact lane
- outcomes and follow-up

### Action rail modules

- next best action
- required proof
- approvals
- blockers
- ownership and SLA
- escalate or reassign

## 6. Workflow Model

### Canonical scenario loop

1. `Signal captured`
2. `Scenario triaged`
3. `Action defined`
4. `Proof gathered`
5. `Artifact or task prepared`
6. `Approval requested when needed`
7. `Execution completed`
8. `Outcome observed`
9. `Scenario resolved, branched, or recycled into a next action`

### Recommended scenario-level states

- `Needs triage`
- `Ready for action`
- `In progress`
- `Waiting on approval`
- `Blocked`
- `In observation`
- `Done`

### Supporting state dimensions

Keep these separate from the main scenario state:

- blocker state
- evidence readiness
- approval state
- outcome state

This prevents the queue from using one overloaded status to represent unrelated conditions.

## 7. Interaction Model And Defining Screens

### 1. Scenario workspace

This is the defining screen of the product. It should be the default signed-in destination and the place where operators spend most of their time.

### 2. Signal intake and conversion screen

This screen captures new raw inputs and either merges them into an existing scenario or creates a new one. It should remain important, but it should no longer define the whole product.

### 3. Evidence manager

Operators need a dedicated way to attach, validate, refresh, and restrict proof without burying those decisions inside notes or tasks.

### 4. Approval surface

Approvals should be visible as a first-class workflow surface, not as hidden task metadata. The screen must show what is awaiting decision, why, by whom, and by when.

### 5. Outcome and reporting views

The product needs a way to review what moved, what stalled, and what patterns are emerging across scenarios. Reporting should reinforce the scenario loop, not just count artifacts.

## 8. Product Principles

- Keep the scenario as the page identity.
- Make the next best action obvious.
- Always show the reason behind urgency, blockage, or approval.
- Separate durable scenario context from temporary task context.
- Treat evidence and approvals as workflow infrastructure, not optional metadata.
- Keep launch-pack specifics in templates and seeded data, not in global shell language.
- Preserve one canonical timeline per scenario.

## 9. Open Questions For Board Confirmation

1. Should `scenario` remain the canonical product term, or does leadership prefer `case` or `workflow` for external positioning?
2. How broad should the first supported scenario families be beyond content and trust work: support, reputation, partner, community, lifecycle, or all of them?
3. What actions require formal approval in v1, and which can stay operator-driven?
4. Should the default signed-in landing page be the scenario workspace immediately, or should intake remain the first stop during transition?
5. How opinionated should the `next best action` engine be at launch: rule-based recommendation only, or recommendation plus auto-created tasks?
6. Which reporting outcomes matter most in the first release: throughput, blocker age, proof readiness, approval latency, or scenario resolution?

## 10. Immediate Direction For AIT-59

The parent CRM concept should describe the product as:

`A scenario-first workflow CRM that helps operators move from signal to approved action to outcome with clear context, proof, and accountability.`

That framing is broad enough for the company mission, specific enough for engineering, and stronger than the current content-ops-first concept.
