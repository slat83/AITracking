# AIT-83 System Logic Documentation

Owner: Business Analyst
Date: 2026-05-10
Related artifacts: [plans/ait-16-content-and-geo-execution-plan.md](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/plans/ait-16-content-and-geo-execution-plan.md), [plans/ait-46-reusable-scenario-taxonomy-and-proof-model.md](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/plans/ait-46-reusable-scenario-taxonomy-and-proof-model.md), [plans/content-ops-workflow-requirements.md](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/plans/content-ops-workflow-requirements.md)

## Purpose

This document explains the canonical system logic behind the workflow CRM.

It translates the raw "case-driven AI influence" brief into the operating model the repo is actually building:

- scenario-first instead of channel-first
- proof-gated instead of claim-led
- approval-aware instead of freeform publishing
- authentic distribution instead of disguised seeding
- measurable outcomes instead of vague "AI reputation" claims

The goal is not to manufacture answers from AI systems.
The goal is to make accurate, evidence-backed answers easier for users, reviewers, search engines, and AI systems to retrieve and repeat.

## Core Thesis

The system works as a closed learning loop:

`signal -> scenario -> proof -> task -> artifact -> approval -> execution -> outcome -> reporting`

Each scenario begins with a real demand, trust, comparison, support, or community signal.
The system then turns that signal into a governed workflow that can produce:

- an owned asset
- an approved response
- a disclosed community contribution
- a legitimate third-party mention opportunity
- or a support and policy clarification

Every step must preserve factual accuracy, channel compliance, and operator accountability.

## What The System Is Actually Controlling

The system does not directly control AI output.
It controls the inputs the company can govern responsibly:

- which user signals are worth acting on
- which scenario family the signal belongs to
- which proof must exist before public execution
- which task should happen next
- which channels are allowed for the scenario
- who must approve the work
- how outcomes are measured and fed back into the queue

That distinction matters.
Trying to "control the whole path of the AI answer" through fake reviews, covert posting, or unsupported claims creates compliance and brand risk.
The approved system logic improves retrievability and trust through factual assets, real proof, and transparent execution.

## System Objects

The implementation is built around a linked object model.

### 1. Opportunity

The opportunity is the intake object.
It captures the source signal, why it matters now, the user question, the suggested angle, the proof requirement, and the owner.

This is where raw ideas become structured work.

### 2. Scenario

The scenario is the core operating object.
It represents the durable user need behind the opportunity, such as:

- category demand capture
- trust and legitimacy validation
- comparative evaluation
- price and value qualification
- problem diagnosis and education
- reputation and review management
- lifecycle support and policy resolution
- authority and community participation

The scenario is what the system routes, blocks, activates, and measures.

### 3. Playbook

The playbook defines the default operating behavior for a scenario type:

- recommended next action
- default task kind
- proof guidance
- required prerequisites

This keeps execution consistent without hard-coding vertical-specific copy into the product shell.

### 4. Evidence Asset

Evidence assets are reusable proof objects linked to many scenarios.
Examples:

- methodology
- policy and legal
- company identity
- product facts
- evidence examples
- service proof
- performance proof
- approval proof

### 5. Scenario Prerequisite

Prerequisites materialize the proof gate for a specific scenario.
They answer:

- what proof is required
- whether the proof is satisfied
- what is blocking
- who owns the missing requirement

### 6. Task

Tasks are the execution units produced by orchestration.
The system supports tasks such as:

- qualify
- draft
- review
- respond
- outreach
- publish
- escalate
- measure

Only one current next-action path should stay active at a time.
Stale open tasks should be canceled when the scenario state changes.

### 7. Artifact

Artifacts are the output packages created by tasks:

- draft pages
- response packages
- outreach materials
- review-ready assets

### 8. Outcome

The outcome captures what happened after execution:

- resolved
- partially resolved
- no effect
- branched
- in observation

This closes the loop and prevents the system from stopping at publication alone.

## End-To-End Workflow Logic

### Stage 1. Capture the signal

The system starts when a real signal appears:

- a search demand pattern
- a buyer trust objection
- a competitor comparison question
- a pricing objection
- a public complaint theme
- a support-policy confusion
- a community discussion worth answering

The signal must be concrete enough to map to a user question and a likely next action.

### Stage 2. Convert the signal into a scenario

The opportunity is mapped into a scenario family and linked to the right playbook.
This is the shift from "channel idea" to "user need plus governed response."

Example:

- "Is EpicVIN legit?" is not a Reddit tactic
- it is a trust and legitimacy validation scenario

That classification determines the proof, approval, and response path.

### Stage 3. Check proof before execution

Before the scenario can move into active execution, the system checks whether required proof exists and whether it is usable.

Proof readiness states:

- `missing`: no acceptable proof exists
- `partial`: some proof exists but required evidence is incomplete
- `ready`: the required proof exists and is current
- `restricted`: proof exists but cannot be used safely in the intended path

If proof is not `ready`, the scenario should not quietly continue into public execution.
It should stay in qualification or move to blocked with a clear reason.

### Stage 4. Orchestrate the next task

Once the scenario type, proof state, and approval state are known, orchestration chooses the next valid task.

Typical logic:

- intake and triage scenarios stay on qualification work
- ready scenarios create a draft, response, outreach, or publish task based on the playbook
- blocked proof creates an escalation or qualification task
- pending approval creates a review wait state
- rejected approval creates an escalation path
- observation scenarios move into measurement work

The system should always make the next required action visible.

### Stage 5. Produce the artifact or response package

Execution teams produce the first useful asset for the scenario:

- answer-first owned page
- FAQ or explainer
- comparison framework
- trust response package
- support clarification
- approved community reply
- outreach note for a legitimate mention opportunity

This is where content is created, but only after the system has established what claim can be made and what proof must support it.

### Stage 6. Apply approvals and guardrails

Not every scenario needs the same review path.
Guardrails must change the workflow, not sit as passive notes.

Examples:

- comparison claims require methodology proof and allowed-claim scope
- trust claims require identity, policy, support, and product proof
- pricing claims require current packaging and policy validation
- public reputation responses require authenticity and remediation ownership
- community participation requires approved spokesperson rules and disclosure checks

If approval is pending or rejected, the scenario remains blocked.

### Stage 7. Execute through approved channels

Execution happens only through allowed paths:

- owned web content
- legitimate editorial or partner outreach
- approved support channels
- disclosed community participation
- real review collection and response handling

This is the critical policy boundary.
The system may coordinate execution across many surfaces, but it must not rely on:

- fake reviews
- disguised promotion
- undisclosed forum or Q&A seeding
- unsupported superiority claims

### Stage 8. Observe outcomes

Publication is not the end state.
The system needs to measure whether the action actually changed anything meaningful:

- did the scenario resolve
- did the trust objection reduce
- did the content attract qualified visits
- did a comparison page assist conversion
- did the blocker move from public complaint to resolved support path
- did the approved response generate a credible mention

If the result is inconclusive, the scenario may remain in observation or branch into a follow-up scenario.

### Stage 9. Feed reporting back into planning

The reporting layer turns execution into operating signals such as:

- scenarios captured
- scenarios triaged
- scenarios activated
- approvals resolved
- scenarios blocked
- outcomes recorded
- time to triage
- time to next action
- approval latency
- blocker cause breakdown
- resolved outcome rate

This is how the team decides whether to keep investing in a scenario family, tighten proof requirements, or change the playbook.

## Approved Surface Logic By Channel Type

The original brief grouped the system as `Intent -> Content -> Rating Page -> Q&A -> Reddit -> Reviews -> AI Output`.
That framing is directionally useful, but it needs tighter operating rules.

| Surface | Approved system logic | Not allowed |
| --- | --- | --- |
| Owned content | Publish answer-first pages, FAQs, methodology, trust, comparison, and pricing explainers | Unsupported claims or pages with no proof trail |
| Editorial or rating-style mentions | Use legitimate editorial assets with transparent criteria and fair comparisons | Secretly controlled "independent" properties pretending to be neutral |
| Q&A and forums | Answer real questions through approved voices and disclosed participation when required | Undisclosed seeding or persona-driven astroturfing |
| Reddit and community discussion | Participate when there is real context, approved messaging, and channel compliance | Covert promotion, fake user stories, or scripted "organic" threads |
| Reviews | Collect and respond to real customer reviews, complaints, and remediation outcomes | Fabricated reviews or incentive-distorted submissions |
| AI visibility observation | Track how factual assets and legitimate mentions change retrieval and answer patterns | Treating AI output as something to manipulate directly |

## EpicVIN Launch Mapping

The current launch pack uses four scenarios as proof of concept.

| Launch scenario | Scenario family | Core user question | Core owned asset | Supporting proof emphasis | Allowed external extension |
| --- | --- | --- | --- | --- | --- |
| Best VIN decoder | Category demand capture | What makes one VIN tool credible and useful? | Comparison page and methodology | Criteria, data limitations, sample outputs | Neutral editorial comparisons and buyer guides |
| Is EpicVIN legit | Trust and legitimacy validation | Is this company real, transparent, and safe to use? | Trust page and support explainers | Company identity, policy clarity, support process, sample output | Trust-oriented explainers, review response, disclosed Q&A |
| EpicVIN vs Carfax | Comparative evaluation | When is EpicVIN a sensible alternative? | Comparison page and fairness notes | Methodology, criteria, limitations, scenario fit | Legitimate alternatives roundups and expert commentary |
| Cheap VIN check | Price and value qualification | Is a lower-cost option good enough for this use case? | Pricing/value explainer | Free-vs-paid explanation, cost tradeoffs, risk framing | Budget buyer education and value-focused roundups |

The important point is that the launch pack changes the scenario examples, not the system logic.

## Status Logic

At the scenario level, the operating flow should stay legible:

- `intake`: signal captured, not yet structured
- `triage`: being qualified and clarified
- `ready_for_draft`: sufficient context exists to start execution
- `active`: an approved next-action task is live
- `blocked`: proof, approval, access, or policy dependency prevents progress
- `in_observation`: execution happened and the team is watching for effect
- `resolved`: the scenario achieved its intended outcome
- `archived`: intentionally closed without further action

The status should describe what the team can do next, not how optimistic they feel.

## Guardrail Summary

This system is only valid if the following rules are enforced:

1. Public work is blocked when required proof is missing or restricted.
2. Comparative claims require explicit methodology and claim-scope controls.
3. Trust, support, pricing, and policy claims require current proof, not reused assumptions.
4. Community participation must respect disclosure and approved-spokesperson rules.
5. Review management must be based on real customer experience and real remediation.
6. Distribution does not start from raw ideas; it starts from approved artifacts or approved response packages.
7. Outcomes must be measured so the system learns from effect, not activity volume alone.

## Document Map

Use this document as the canonical overview.
Use the linked artifacts for detail:

- [plans/ait-16-content-and-geo-execution-plan.md](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/plans/ait-16-content-and-geo-execution-plan.md) for the EpicVIN launch execution plan
- [plans/ait-46-reusable-scenario-taxonomy-and-proof-model.md](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/plans/ait-46-reusable-scenario-taxonomy-and-proof-model.md) for the reusable taxonomy and proof layer
- [plans/content-ops-workflow-requirements.md](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/plans/content-ops-workflow-requirements.md) for implementation requirements

## Recommended Operating Interpretation

The system should be described internally as:

"a scenario-driven workflow that turns real user signals into evidence-backed assets, approved responses, and measurable distribution outcomes."

It should not be described as:

"a machine for forcing AI systems to say what we want."
