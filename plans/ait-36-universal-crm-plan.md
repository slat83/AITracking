# AIT-36 Universal CRM Product And Technical Plan

Owner: CTO
Date: 2026-05-10
Related issues: [AIT-36](/issues/AIT-36), [AIT-39](/issues/AIT-39), [AIT-41](/issues/AIT-41), [AIT-15](/issues/AIT-15), [AIT-16](/issues/AIT-16)

## Executive Summary

The correct product boundary is a workflow CRM for moving a real demand, trust, support, or reputation signal from intake to next best action, not a tool for one brand or one acquisition tactic.

EpicVIN remains the launch scenario pack because the repo already contains a credible operating foundation for:

- opportunity intake
- evidence-backed drafting
- review and approval
- approved distribution
- basic outcome reporting

The product should generalize the workflow engine, object model, permissions, and automation loop while keeping EpicVIN-specific scenario packs, content templates, and proof assets as replaceable seed content.

## Product Definition

### Product promise

Help operators keep context, decide the next best action, coordinate approved execution, and learn from the outcome across owned, earned, support, and community channels.

### Jobs to be done

Users need to:

1. capture a live signal that matters
2. understand what type of scenario it is
3. see the right next action instead of a generic backlog
4. hand work across drafting, review, support, marketing, or distribution without losing context
5. prove what was done and whether it worked

### Canonical loop

1. Intake signal
2. Classify scenario
3. Attach context and evidence
4. Recommend next best action
5. Assign the required workflow object
6. Execute through approved people and accounts
7. Record outcome and decide whether another action is needed

This is the core reusable loop. EpicVIN is only one initial set of scenarios running through it.

## Reusable CRM Core

### Core objects

- `workspace`: company or operating environment using the CRM
- `scenario`: a demand, trust, support, comparison, review, or reputation situation that needs coordination
- `signal`: the raw input that created the scenario, such as a search query, customer complaint, review theme, competitor claim, support ticket, community discussion, or internal idea
- `account`: company, brand, product, market, or campaign context the scenario belongs to
- `evidence asset`: proof used to support an action, such as policy pages, screenshots, product facts, methodology, reports, legal pages, or prior outcomes
- `playbook`: the recommended response pattern for a scenario type
- `task`: the next concrete action, such as qualify, draft, review, publish, respond, outreach, escalate, or measure
- `artifact`: the output created during execution, such as a draft, response, page brief, FAQ entry, support macro, or outreach note
- `channel target`: the destination for execution, such as owned page, support queue, review platform, community site, partner, or approved account
- `outcome`: the observed result, including placement, response, conversion, trust resolution, or follow-up need

### Required object rules

- A `signal` can create one or more `scenarios`.
- A `scenario` owns the working context and remains the system-of-record object.
- `tasks` and `artifacts` should attach to the `scenario`, not only to a content draft.
- `evidence assets` must be reusable across many scenarios.
- `playbooks` should recommend actions without forcing automation to bypass human approval.

### Next-best-action engine

The first product version does not need machine learning. It needs explicit rules and strong defaults.

Inputs:

- scenario type
- urgency
- business impact
- evidence readiness
- channel readiness
- policy risk
- current owner and stage
- prior outcomes on similar scenarios

Outputs:

- recommended next action
- recommended owner role
- required proof before proceeding
- blocked reason if prerequisites are missing

## What Generalizes Versus What Stays EpicVIN-Specific

### Generalize now

- scenario-centric workflow model
- role-aware intake, review, and execution states
- evidence attachment model
- playbook and next-best-action rules
- approved-channel and approved-account permissions
- audit trail and outcome reporting
- queue views by owner, status, urgency, and scenario type

### Keep EpicVIN-specific for the launch pack

- the initial four demand scenarios
- VIN-decoder content taxonomy
- trust-center proof assets specific to EpicVIN
- comparison criteria for Carfax and related competitors
- pricing and report-specific proof examples
- launch metrics tuned to EpicVIN acquisition and trust flows

### Product rule

Do not bake the four EpicVIN scenarios into enums, routing, or navigation as if they are the permanent ontology. Treat them as seeded records or configurable playbooks.

## Data Model Implications

The current schema is a good first slice, but it is too narrow for the target product.

### Current baseline in repo

The existing Prisma model already supports:

- `Opportunity`
- `Draft`
- `DistributionTask`
- approved distribution accounts
- audit events
- review workflow objects

This is useful because it proves the workflow shape. It is not yet universal because the model is still content-ops first and launch-scenario constrained.

### Required schema changes

1. Replace hard-coded scenario assumptions with configurable scenario definitions.
2. Introduce a top-level `Scenario` or `WorkItem` model that survives across multiple tasks and artifacts.
3. Convert `Opportunity` from the primary long-lived object into an intake-stage object or fold it into `Scenario`.
4. Make `Draft` one artifact type among several, not the only primary downstream object.
5. Add `EvidenceAsset` and `EvidenceLink` models so proof can be reused and validated.
6. Add `Playbook` and `ScenarioType` models for configurable next-action rules.
7. Add `ChannelTarget` or `ExecutionTarget` models so distribution, support, and community actions share one abstraction.
8. Add explicit prerequisite and blocker fields at the workflow-object level.
9. Separate business taxonomy from workflow status so scenario type, channel, vertical, and priority are all configurable records.

### Concrete refactor guidance

- Replace `priorityScenarioOptions` in [src/server/opportunities/workflow.ts](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/src/server/opportunities/workflow.ts) with seeded scenario definitions from the database.
- Revisit enums in [prisma/schema.prisma](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/prisma/schema.prisma) where values currently encode one operating model instead of a reusable workflow layer.
- Preserve auditability. Every automated or manual next-action recommendation should be traceable through `AuditEvent` or a dedicated recommendation log.

## UI Module Implications

The UI should shift from a content-production tool toward a scenario workspace.

### Core reusable modules

- Intake queue
- Scenario detail workspace
- Evidence panel
- Next-best-action card
- Task board by stage and owner
- Artifact workspace for drafts, responses, briefs, and notes
- Approval and review lane
- Outcome and follow-up panel
- Reporting dashboard

### Launch-specific modules that can stay narrow for now

- EpicVIN scenario templates
- comparison-page brief composer
- trust-page proof checklist
- approved distribution-account roster for current launch channels

### UX principle

The primary screen should answer three questions fast:

1. what happened
2. what should happen next
3. what proof or approval is still missing

## Automation Implications

Automation should help operators keep momentum, not create autonomous posting behavior.

### Automate in v1

- intake normalization from forms or imported signals
- SLA reminders for untouched scenarios
- prerequisite checks before a scenario advances
- next-best-action recommendation from playbook rules
- review handoff notifications
- outcome logging prompts after task completion
- weekly rollups by scenario type, owner, and outcome

### Keep manual or approval-gated

- public posting
- community participation
- review outreach wording
- competitor-comparison claims
- policy-sensitive trust responses

### Design rule

No automation path should let the system publish, respond, or distribute through a public channel without an approved owner and an auditable record.

## Permissions And Governance

The current role model of `ADMIN`, `EDITOR`, and `VIEWER` is too coarse for the long-term product.

### Needed permission dimensions

- who can intake and classify scenarios
- who can edit evidence-backed facts
- who can approve public-facing artifacts
- who can use a specific distribution or community account
- who can resolve support or trust scenarios
- who can override a blocked or risky recommendation

### Recommended role direction

- `operator`: can intake, triage, and execute assigned actions
- `reviewer`: can approve or request changes on artifacts and public actions
- `channel_manager`: can authorize execution on specific accounts or targets
- `admin`: can manage taxonomy, playbooks, permissions, and audit access

Role names can vary, but permission scopes should be modeled independently from one flat role enum.

## Prioritized Execution Sequence

### Phase 1: Generalize the workflow backbone

- lock the scenario-centric product vocabulary
- define reusable `Scenario`, `ScenarioType`, and `Playbook` models
- remove hard-coded EpicVIN scenario options from application logic
- preserve current opportunity, draft, and task flows through a compatibility layer

### Phase 2: Introduce reusable evidence and action orchestration

- add evidence objects and attach them to scenarios and artifacts
- implement the next-best-action rule engine with explicit prerequisites
- unify distribution, support, and community actions under one task abstraction

### Phase 3: Reframe the UI around scenarios

- replace the content-first home view with queue and scenario workspace views
- surface next action, required proof, blockers, and owner clearly
- keep EpicVIN scenario templates as seeded views inside the broader workspace

### Phase 4: Expand reporting from content throughput to scenario outcomes

- measure time-to-triage, time-to-next-action, approval latency, outcome rates, and blocker causes
- separate reusable CRM health metrics from EpicVIN launch metrics

### Phase 5: Add additional vertical packs

- validate the model against a non-EpicVIN scenario family
- add a second playbook pack rather than extending EpicVIN-specific logic
- use that second pack to find which fields still leak launch assumptions

## Delivery Recommendation

Use the existing content-ops implementation as the first bounded workflow slice, not as the final ontology.

Near-term engineering should aim for:

1. a backward-compatible schema evolution
2. seeded launch data for EpicVIN
3. configurable scenario definitions
4. a rule-based next-best-action layer
5. a scenario workspace UI shell before broad feature expansion

This keeps momentum while avoiding a costly rewrite.

## Risks And Follow-Up Gaps

### UX follow-up needed

- define the scenario workspace information hierarchy
- validate how operators distinguish scenario context from task context
- test whether next-best-action recommendations are understandable and trusted

### GTM or CMO follow-up needed

- define the first reusable scenario taxonomy beyond EpicVIN
- specify which outcome metrics matter by scenario family
- identify which proof assets are universal versus launch-only

### Engineering risks

- schema churn if we generalize after adding more EpicVIN-specific features
- permissions rework if public-channel approvals remain implicit
- workflow confusion if `Opportunity`, `Scenario`, `Draft`, and `Task` responsibilities overlap

## CEO Decision Brief

Approve the product boundary as a universal scenario workflow CRM and treat EpicVIN as the first seeded operating pack. Then direct engineering to generalize the workflow spine before adding more vertical-specific features. That sequencing gives the company a reusable product without discarding the working launch foundation already in the repo.
