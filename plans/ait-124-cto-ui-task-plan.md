# AIT-124 CTO UI Task Plan

Owner: CTO
Prepared by: Business Analyst
Date: 2026-05-11
Related issues: [AIT-124](/AIT/issues/AIT-124), [AIT-36](/AIT/issues/AIT-36), [AIT-49](/AIT/issues/AIT-49)
Related artifacts: [docs/ux/universal-crm-scenario-workspace-brief.md](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/docs/ux/universal-crm-scenario-workspace-brief.md), [docs/ux/intake-draft-workflow-contract.md](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/docs/ux/intake-draft-workflow-contract.md), [plans/content-ops-workflow-requirements.md](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/plans/content-ops-workflow-requirements.md)

## Purpose

Convert the broad "CTO UI" ask into an implementation-ready task set for the existing CRM shell.

The repo already contains the correct high-level product direction:

- scenario-first workspace
- reusable evidence, playbooks, templates, reporting, and settings surfaces
- explicit proof and approval gates
- manual, accountable execution instead of opaque channel automation

This plan identifies what is already live, what is still missing, and which CTO-owned UI tasks should be opened next.

## Scope Guardrails

The UI should support legitimate workflow coordination, not covert distribution behavior.

Do keep:

- opportunity intake and triage
- scenario context and next-best-action guidance
- proof, approval, blocker, and ownership visibility
- approved-channel and approved-account governance

Do not encode as product behavior:

- fake-neutral posting flows
- fabricated review workflows
- autonomous public-channel publishing
- UI language that treats deceptive influence tactics as a normal system capability

This follows the repo's existing product direction in [AIT-36](/AIT/issues/AIT-36) and the system-logic guidance in [plans/ait-83-system-logic-documentation.md](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/plans/ait-83-system-logic-documentation.md).

## Current Repo Baseline

The current app already covers much of the intended shell:

- `Workspace` queue, detail view, and action rail in [src/app/app/page.tsx](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/src/app/app/page.tsx)
- saved workspace views and scenario selection logic in [src/server/scenarios/workspace.ts](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/src/server/scenarios/workspace.ts)
- evidence library in [src/app/app/evidence/page.tsx](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/src/app/app/evidence/page.tsx)
- playbooks in [src/app/app/playbooks/page.tsx](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/src/app/app/playbooks/page.tsx)
- launch packs and seeded templates in [src/app/app/templates/page.tsx](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/src/app/app/templates/page.tsx)
- reporting in [src/app/app/reporting/page.tsx](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/src/app/app/reporting/page.tsx)
- settings and execution-target visibility in [src/app/app/settings/page.tsx](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/src/app/app/settings/page.tsx)

The CTO work should therefore focus on closing the remaining workflow gaps rather than rebuilding the shell from scratch.

## Gaps That Still Need CTO UI Work

### 1. Navigation and landing-page convergence

Current state:

- the main shell still exposes `Dashboard` and `Pilots` as first-class nav items in [src/components/app-shell-nav.tsx](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/src/components/app-shell-nav.tsx)
- the UX brief says `Workspace` should be the default control surface and the shell should not lead with detached metrics

Required outcome:

- the global shell reflects the scenario-workspace model first
- legacy or secondary views are demoted, relabeled, or moved behind role-aware secondary navigation

### 2. Queue filters, sorting, and saved-view depth

Current state:

- saved views exist
- filter depth is still shallow compared to the UX brief

Missing controls:

- scenario type
- urgency
- account
- owner
- channel
- last-updated age
- sort by SLA risk, proof readiness, approval risk, and recent activity

### 3. Workspace action-rail mutations

Current state:

- the action rail explains next action, proof, approvals, blockers, and escalation context
- the reassign and escalate area is still read-only

Required outcome:

- operators can explicitly reassign ownership
- operators can escalate a blocker with an auditable reason
- actions stay permission-gated and avoid hidden workflow jumps

### 4. Approval and blocker detail depth

Current state:

- approval and blocker sections show status
- they do not yet show the full decision context the UX brief expects

Missing metadata:

- approval type
- approver
- decision deadline or SLA
- latest decision note
- blocker type
- blocker owner
- blocker age
- direct link to the blocking object

### 5. Intake-to-scenario and scenario-to-artifact handoff

Current state:

- opportunity intake and scenario workspace both exist
- the shell still presents them as adjacent surfaces instead of one visibly continuous operator flow

Required outcome:

- queue users can move from intake to active scenario work without context loss
- draft and downstream artifact handoff reads as a child workflow of the scenario, not a separate product lane

### 6. Public-channel guardrails and permissions

Current state:

- the repo direction already favors approved targets, proof gates, and manual review
- role controls are still coarse and some legacy labels remain channel-specific

Required outcome:

- product settings expose who may approve, publish, respond, or reassign by channel
- public/community actions remain manual or explicitly approval-gated
- EpicVIN launch templates stay seeded content, not hard-coded product ontology

## CTO Task Breakdown

### Task 1. Align the shell around the scenario workspace

Why:

- the product direction is already scenario-first, but the top-level shell still leaks older navigation assumptions

Acceptance signals:

- `Workspace` remains the default landing route
- primary nav matches the universal CRM brief
- dashboard-style metrics no longer compete with the queue as the main operating entrypoint

### Task 2. Add real queue filters and stronger sort controls

Why:

- the saved views are useful, but operators still need stronger queue control to run the system day to day

Acceptance signals:

- operators can filter and combine by scenario type, urgency, owner, account, and freshness
- sorting supports operational decision-making instead of only chronological scanning

### Task 3. Implement actionable ownership, reassignment, and escalation flows

Why:

- the action rail exposes context, but the system still lacks the mutations needed to move work cleanly

Acceptance signals:

- reassignment is explicit and audited
- escalation captures reason, owner, and target object
- state transitions do not hide blocked work

### Task 4. Expand approvals and blockers into first-class operator modules

Why:

- approvals and blockers are central to the product promise, and thin status pills are not enough

Acceptance signals:

- operators can identify who is blocking progress, why, since when, and what must resolve next
- approval modules show enough information to support a real decision without opening unrelated records

### Task 5. Unify intake, workspace, and artifact handoff

Why:

- the repo has the right objects, but the operator flow is still partially split between pages and mental models

Acceptance signals:

- intake records move clearly into scenario ownership
- scenario detail remains the system of record
- artifacts and downstream tasks read as children of the scenario

### Task 6. Harden policy-safe channel governance in settings and templates

Why:

- the launch pack can stay EpicVIN-specific, but governance needs to remain reusable and safe

Acceptance signals:

- approved targets, permissions, and template packs are visible and configurable
- the UI does not normalize deceptive review or community tactics
- public execution remains manual or explicitly approval-gated

## Recommended Sequence

1. Shell alignment and navigation cleanup
2. Queue filters and sort controls
3. Approval/blocker model and UI depth
4. Reassign/escalate operator mutations
5. Intake and artifact handoff cleanup
6. Settings and template governance hardening

This sequence keeps the primary operator experience coherent before adding more configuration depth.

## Delivery Recommendation

Open the six CTO implementation tasks above as child issues under [AIT-124](/AIT/issues/AIT-124), keep this plan as the parent reference, and treat [AIT-124](/AIT/issues/AIT-124) as complete once the breakdown is recorded and routed.
