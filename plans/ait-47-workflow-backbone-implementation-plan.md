# AIT-47 Workflow Backbone Implementation Plan

Owner: CTO
Date: 2026-05-10
Related issues: [AIT-47](/issues/AIT-47), [AIT-36](/issues/AIT-36), [AIT-39](/issues/AIT-39), [AIT-41](/issues/AIT-41)

## Purpose

This plan turns the universal CRM direction into an execution-ready backbone refactor.

The goal is not to redesign every workflow at once. The goal is to introduce a reusable scenario-centric core that:

- preserves the existing opportunity intake flow already live in the repo
- removes EpicVIN-specific workflow assumptions from schema and app logic
- creates a compatibility path for current `Opportunity`, `Draft`, and `DistributionTask` records
- gives later issues a stable base for evidence, next-best-action, permissions, and reporting

## Current Baseline In Repo

Today the workflow backbone is still content-ops first:

- `Opportunity` is the primary intake and long-lived workflow object
- `Draft` is the main downstream artifact
- `DistributionTask` is the only modeled execution task
- `priorityScenarioOptions` in [src/server/opportunities/workflow.ts](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/src/server/opportunities/workflow.ts) hard-codes four EpicVIN scenarios in application logic
- workflow enums in [prisma/schema.prisma](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/prisma/schema.prisma) encode one operating model rather than a reusable CRM layer
- the main dashboard and `/app/opportunities` UI are framed around content opportunity queues rather than a general scenario workspace

This is a useful first slice because it proves intake, reviewable state changes, auth, audit events, and queue rendering. It is not yet a universal backbone.

## Decision Summary

The backbone should generalize around `Scenario` as the long-lived system-of-record object.

Implementation rule:

- keep `Opportunity` as the intake-facing compatibility object for the next slice
- introduce `Scenario` and related configuration records beside it
- dual-write or derive scenario records from opportunity events during the transition
- move EpicVIN assumptions into seeded records, not hard-coded arrays or permanent enums

This avoids a destructive rewrite and lets the current workflow continue operating while the data model expands.

## Target Backbone

### New canonical objects

- `Workspace`: operating environment or company boundary
- `Account`: brand, product, market, or business context inside a workspace
- `Signal`: raw input that triggered work
- `Scenario`: primary workflow record from intake through outcome
- `ScenarioType`: configurable taxonomy record for trust, comparison, support, demand, review, community, and future types
- `Playbook`: rule-backed recommended response pattern for a scenario type
- `Task`: reusable execution object for qualify, draft, review, respond, outreach, publish, escalate, and measure actions
- `Artifact`: output object for drafts, briefs, notes, responses, FAQs, and future asset types
- `ExecutionTarget`: approved destination abstraction for owned pages, support queues, review platforms, communities, publications, and distribution accounts
- `Outcome`: structured result and follow-up state

### Objects explicitly deferred from this issue

- full evidence library implementation
- policy/risk engine beyond basic blocker fields
- granular role-permission matrix beyond initial schema seams
- multi-workspace UX
- automated recommendation scoring beyond deterministic rules

AIT-47 should create the backbone those later slices plug into.

## Proposed Data Model Changes

### 1. Introduce scenario-centric records

Add the following models:

- `Scenario`
- `ScenarioType`
- `Playbook`
- `Task`
- `Artifact`
- `ExecutionTarget`
- `ScenarioRecommendation` or `ScenarioDecisionLog`

Minimum required `Scenario` fields:

- `id`
- `workspaceId`
- `accountId`
- `sourceOpportunityId` nullable for compatibility
- `scenarioTypeId`
- `title`
- `summary`
- `status`
- `priority`
- `urgency`
- `businessImpact`
- `blockedReason`
- `ownerId`
- `capturedAt`
- `createdAt`
- `updatedAt`

### 2. Reframe current models as transition objects

Keep existing records, but narrow their role:

- `Opportunity` becomes intake-stage capture plus backward-compatible queue support
- `Draft` becomes one artifact subtype or remains temporarily mapped to `Artifact`
- `DistributionTask` becomes a specialized execution task until `Task` is fully adopted

### 3. Replace hard-coded scenario definitions

Remove direct product logic dependence on:

- `priorityScenarioOptions` in workflow code
- any future enum or switch statement that treats the four EpicVIN scenarios as permanent ontology

Replace with:

- seeded `ScenarioType` records
- seeded `Playbook` records
- optional launch-pack metadata such as label, category, and default next action

### 4. Separate taxonomy from workflow state

Current enums conflate system state with operating-model assumptions.

Refactor direction:

- keep technical status enums where they describe durable workflow states
- move business taxonomy to database records
- avoid enums for scenario names, channels, asset categories, or vertical packs

### 5. Preserve auditability

Every backbone change must remain observable through `AuditEvent` or a dedicated recommendation log.

At minimum, record:

- scenario creation source
- type assignment and reassignment
- playbook recommendation
- blocker application or removal
- task creation
- artifact approval decisions
- execution completion and outcome updates

## Compatibility Strategy

This issue should not require an all-at-once migration of the existing app surface.

### Compatibility principles

- existing opportunity creation and update actions continue to work during the transition
- current seeded data and tests remain valid or gain a thin adapter
- no existing route should break because `Scenario` was introduced
- backfill must be idempotent
- operators should not have to manually recreate existing records

### Recommended transition shape

Phase A:

- add new backbone tables with no user-facing cutover
- seed scenario types and playbooks for the four current EpicVIN scenarios

Phase B:

- on new opportunity creation, create or update a linked `Scenario`
- on opportunity transition, sync status and required brief fields into the linked scenario

Phase C:

- introduce read paths that can render queue views from scenario-backed records
- keep fallback support for opportunity-first reads until parity is verified

Phase D:

- retire hard-coded scenario options and switch UI selects to seeded records

## Application Refactor Plan

### Workstream 1: Prisma and migrations

Deliverables:

- add new backbone models and relations
- add compatibility foreign keys from `Opportunity` to `Scenario` where needed
- create a seed path for launch scenario types and playbooks
- write a backfill migration or script for existing opportunity data

Acceptance criteria:

- schema can represent scenario-first workflow without deleting current content-ops records
- local seed produces usable launch-pack taxonomy
- migration can be applied on a non-empty database

### Workstream 2: Domain services

Deliverables:

- create `src/server/scenarios/` service layer
- centralize scenario creation, classification, and transition mapping there
- add compatibility functions that translate opportunity events into scenario updates
- move workflow constants out of page components and into scenario services

Acceptance criteria:

- no route needs to hard-code the four EpicVIN scenario strings
- scenario writes are testable without UI form submission
- transition logic is not split across unrelated server actions

### Workstream 3: UI data plumbing

Deliverables:

- adapt queue queries to include scenario-linked data
- prepare a reusable scenario summary card shape
- keep `/app/opportunities` functioning while its source data becomes scenario-aware
- define the follow-on seam for a scenario detail workspace

Acceptance criteria:

- operators can still create and triage intake items after the refactor
- the queue can display scenario type from seeded configuration rather than a hard-coded list
- no UX redesign is required in this issue beyond data-contract changes

### Workstream 4: Testing and backfill verification

Deliverables:

- expand workflow tests beyond local utility parsing
- add tests for opportunity-to-scenario sync
- add migration/backfill assertions
- verify audit events for scenario creation and transition updates

Acceptance criteria:

- seed plus migration plus test suite cover the transition path
- at least one test proves a legacy opportunity becomes a linked scenario correctly
- at least one test proves new opportunities no longer depend on hard-coded scenario constants

## Suggested Execution Sequence

1. Add backbone schema models and compatibility relations in Prisma.
2. Seed `ScenarioType` and `Playbook` records for the four current EpicVIN launch scenarios.
3. Add a backfill path that creates `Scenario` rows for existing `Opportunity` records.
4. Introduce a scenario service layer and move transition logic there.
5. Update opportunity create and update actions to sync linked scenarios.
6. Replace `priorityScenarioOptions` with database-backed scenario-type reads.
7. Expand tests to cover migration, sync, and audit behavior.
8. Leave the broader scenario workspace UI for the next issue unless parity work uncovers a blocking gap.

## Proposed Initial Schema Mapping

Recommended first-pass mapping from current models:

- `Opportunity.title` -> `Scenario.title`
- `Opportunity.summary` -> `Scenario.summary`
- `Opportunity.scenario` -> seeded `ScenarioType.slug` or `ScenarioType.name`
- `Opportunity.priority` -> `Scenario.priority`
- `Opportunity.ownerId` -> `Scenario.ownerId`
- `Opportunity.capturedAt` -> `Scenario.capturedAt`
- `Opportunity.whyNow` -> `Scenario.urgencyNote`
- `Opportunity.suggestedAssetAngle` -> initial recommendation context or operator note
- `Opportunity.briefAudience`, `briefQuestion`, `assetType`, `proofRequirement`, `targetCta`, `dueDate` -> linked `Artifact` draft brief metadata or scenario task metadata
- `Draft` -> `Artifact` subtype `content_draft`
- `DistributionTask` -> `Task` subtype `distribution`

The mapping does not need to be perfectly normalized in the first iteration. It needs to preserve meaning and avoid data loss.

## Risks And Tradeoffs

### Risk: premature UI rewrite

If AIT-47 tries to ship a full scenario workspace redesign, the backbone work will get blocked on UX decisions.

Decision:

- keep this issue focused on model, service, and compatibility changes
- route any major workspace-layout decisions upward for dedicated UX judgment

### Risk: two sources of truth during migration

Dual-writing `Opportunity` and `Scenario` adds consistency risk.

Mitigation:

- define one sync path in server services
- backfill once
- add audit logging and tests for parity
- make `Scenario` the strategic source of truth even if some pages still read opportunity-first

### Risk: enum lock-in

If new scenario, channel, or asset categories remain enums, the product will stay launch-pack specific.

Mitigation:

- only keep enums for technical states that truly benefit from compile-time constraints
- store business taxonomy in seeded relational tables

### Risk: auth model lag

Current `ADMIN` / `EDITOR` / `VIEWER` roles are too coarse for the final product.

Decision:

- do not solve full permission granularity in AIT-47
- add model seams so scenario ownership, reviewer assignment, and execution-target authorization can be layered in later

## Out Of Scope

- final permissions redesign
- evidence asset library and validation workflows
- next-best-action recommendation UI
- support queue integrations
- public-channel automation
- generalized reporting dashboards
- multi-tenant billing or workspace administration

## Definition Of Done

AIT-47 is complete when:

- the schema includes a reusable scenario-centric backbone
- the four current EpicVIN scenarios live as seeded configuration, not hard-coded workflow constants
- new and existing opportunities can be linked to scenarios without manual operator migration
- server-side workflow logic has a dedicated scenario service seam
- tests cover backfill and compatibility behavior
- current intake and triage screens still operate without regression

## Recommended Follow-On Issues

After AIT-47, the next highest-value follow-ons should be:

1. Evidence asset and prerequisite modeling.
2. Next-best-action rule engine with explicit blockers.
3. Scenario detail workspace and task/artifact panels.
4. Role and execution-target permission expansion.
5. Outcome reporting beyond content throughput.
