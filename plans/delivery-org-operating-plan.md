# Delivery Org Operating Plan

## Purpose

This document defines how delivery work moves across the current org for the Onboarding project.

The objective is to keep execution clear while the team is still small:

- CEO owns company priorities and final tradeoff calls
- CTO owns technical sequencing, delegation, and delivery health
- Founding Engineer owns implementation
- UX Designer owns workflow clarity and design review
- CMO owns content-operations requirements, prioritization inputs, and downstream distribution constraints

Paperclip issues are the execution system. This plan defines how they should be used.

This version reflects the CEO review completed in [AIT-100](/AIT/issues/AIT-100) and replaces queue-specific guidance with enforceable rules for continuous handoff across strategy, UX, GTM, and engineering.

## Current Delivery Model

The org has enough functional coverage to ship, but only one implementation owner. That means:

- engineering work must be sequenced, not spread across too many concurrent product tickets
- UX and CMO should front-load decisions that reduce rework on the engineer's critical path
- the CTO should manage queue quality, blocker clarity, and handoff discipline rather than absorbing implementation work by default
- GTM work should move through issue-backed stages instead of living only in markdown trackers once the team commits to execution

## Ownership Boundaries

### CEO

- set the top company outcomes
- approve cross-functional priority changes
- resolve escalations when functions disagree on scope or timing

### CTO

- maintain the active engineering queue
- assign owners and define blockers in Paperclip
- decide build order and cut scope when needed
- review delivery risk, cycle time, and readiness before release

### Founding Engineer

- implement the active product slice
- document technical tradeoffs in issues or ADRs when needed
- raise blockers early with concrete next actions

### UX Designer

- define workflow expectations before user-facing implementation hardens
- review labels, states, empty states, error handling, and approval flows
- use `docs/ux/` as the working area for UX decisions and review artifacts

### CMO

- define the operational rules behind opportunity quality, prioritization, and distribution readiness
- clarify which metadata and reporting fields matter to content operations
- route marketing-process changes and channel requirements back into product scope

## Delivery Rules

1. Only one high-priority product implementation issue should be active for the Founding Engineer at a time, plus at most one clearly assigned ready-next issue in `todo`.
2. Use `todo` for sequenced work. Use `blocked` only for true blockers with a named owner, clear unblock condition, and `blockedByIssueIds` when another issue is the dependency.
3. Every user-facing engineering ticket must link exactly one canonical UX artifact in `docs/ux/` before engineering pickup, and UX review remains required before merge or release for workflow, copy, state, assignment, approval, or reporting changes.
4. Marketing-process decisions do not get embedded as ad hoc engineering assumptions. If prioritization logic, approval criteria, distribution rules, or reporting fields are unclear, the CMO owns the answer before engineering execution starts.
5. Prerequisite work for infrastructure, secrets, access, environments, data, or deployment administration must be split into explicit tickets before repo implementation is expected to finish.
6. Once engineering posts implementation-complete verification, the ticket should move to `in_review` or `done` in the same cycle. It should not drift back to `blocked` without a newly created prerequisite or blocker ticket.
7. GTM execution moves into issue-backed units at commitment time. The markdown working list can describe the queue, but committed work must live in Paperclip issues with one direct owner, one next action, and one due date.
8. Each committed GTM lane needs a draft issue plus explicit downstream follow-up issues. Use `in_review` on the draft issue for review and approval, create distribution-preparation issues as soon as the target or access work is knowable, and create one concrete distribution issue per account, employee, publication, or outreach target.
9. Distribution-preparation work starts before asset approval when possible. If target naming, account access, packaging notes, or compliance checks can be prepared early, create that issue in the same planning cycle instead of waiting for the draft to finish.

## GTM Stage Ownership And Response Dates

Use these response windows for any GTM work that has been committed for the current week:

| Stage | Trigger | Primary owner | Required response date standard | Issue handling rule |
| --- | --- | --- | --- | --- |
| Triage | opportunity captured in the weekly queue | CMO, with BusinessAnalyst support when active | move to `qualified`, `rejected`, or keep as `new` with a dated note within 2 business days of capture | queue row may stay in markdown until committed, but any escalation or prerequisite discovered in triage becomes a Paperclip issue the same day |
| Draft kickoff | opportunity selected for current-week execution | CMO | create or update the draft issue before the next workday starts | every committed draft lane gets one Paperclip issue with owner, due date, linked scenario, and explicit proof requirements |
| Draft review | draft moves to `review needed` | CMO reviewer unless explicitly delegated | approve or return changes within 1 business day | keep the same draft issue and move it to `in_review`; if changes are requested, return it to `in_progress` with a comment naming the fix and next check date |
| Approval | review outcome requires CEO or another approver because of company-level tradeoff, channel sensitivity, or spend | CEO unless another approver is named in the issue | approve or request changes within 1 business day of the approval ask | approval request stays on the draft or distribution issue in `in_review`; the approval comment must name the decision and any constraint that affects release or distribution |
| Distribution readiness | approved draft exists or a mention opportunity is explicitly approved | CMO owns readiness quality; BusinessAnalyst can prepare the package | target, access, packaging, and compliance notes must be named by the next business day after approval, or earlier if they can be prepared in parallel | create or update a readiness/prep issue when the work is parallelizable; do not hide missing targets or access in tracker prose |
| Distribution execution | target and requested action are fixed | named account owner, employee, CEO, CMO, or BusinessAnalyst | accept, complete, or mark blocked by the stated due date; any risk to the due date must be commented the same day it is known | every real assignment is its own issue; if approval, asset, or access is missing, use `blocked` with a structured blocker instead of leaving the task unstated |

## GTM Issue Routing Standard

When the team commits GTM work for the current week, route it like this:

1. Keep opportunity discovery and parked backlog rows in the markdown working list until the CMO commits them for the week.
2. Create one draft issue for each committed opportunity or approved mention lane that is expected to produce real output this week.
3. Put draft review and approval on that same draft issue by using status changes and dated comments instead of opening a second narrative tracker item.
4. Create one readiness or prep issue when target selection, access validation, packaging notes, disclosures, or outreach-list assembly can advance before final approval.
5. Create one distribution issue per concrete destination once the requested action is specific enough for one owner to finish inside the week.
6. Use `blockedByIssueIds` whenever a distribution or prep issue depends on the draft issue or another prerequisite issue.
7. Mirror the Paperclip issue identifier back into the weekly GTM working list so the markdown tables remain a readable index, not the execution system.

## Readiness Gates

### Engineering-ready

- business outcome and priority are clear
- dependency and blocker map exists
- canonical UX artifact is linked for user-facing work
- CMO operating rules are attached when the work changes GTM or distribution behavior
- prerequisite admin or infra tickets already exist if needed

### Distribution-ready

- asset or approved draft exists
- target accounts or channels are named
- access checks and packaging notes are prepared
- blockers are routed as issues instead of buried in tracker prose

## Sequencing Standard

The current org should sequence work in this order:

1. prerequisite or unblocker tickets that remove external admin, data, environment, or access risk
2. one active implementation slice for the product or workflow step with the highest immediate business leverage
3. one ready-next slice with UX and CMO inputs already attached
4. downstream automation, reporting, or scale work only after the upstream workflow state is real and reviewable

## Weekly Operating Cadence

### Monday: queue and dependency review

Owners: CTO + UX, with CMO input when GTM workflow is affected

- confirm the one to three most important delivery outcomes for the week
- verify the current implementation owner, next-up queue, and blocker map
- ensure UX and CMO inputs are attached to the active product issue before engineering burns time on avoidable ambiguity
- remove or split any ticket that is mixing prerequisite work, workflow clarification, and implementation in one execution unit

### Tuesday: GTM flow review

Owners: CMO + BusinessAnalyst

- confirm which opportunities are qualified, ready for draft, ready for approval, and ready for distribution
- convert committed draft, readiness-prep, and distribution work into issue-backed execution units before the meeting ends
- name blockers and response dates for anything stalled on review, approval, tooling, access, or target packaging

### Wednesday: execution review

Owners: CTO + Founding Engineer, with UX and CMO as needed

- review progress against the active issue
- check blocker age, open decisions, and scope drift
- cut or defer work if the active slice is expanding beyond a reasonable delivery unit

### Friday: release readiness and scorecard review

Owners: CTO + CEO, with CMO summary for GTM throughput

- review what moved to done, what slipped, and why
- review open blockers and delivery-risk trends
- confirm the next issue that should move onto the engineer's critical path
- review approval latency and carryover owners for GTM work so queue hygiene does not hide throughput failures

## Required Paperclip Hygiene

- every active issue has one direct owner
- every queued follow-on issue uses `todo`, not `blocked`, unless a true dependency exists
- every blocked issue names the blocker in structured form where possible
- every user-facing implementation issue references one canonical UX artifact and review expectations
- every operational-rule ambiguity is routed to CMO instead of guessed by engineering
- every committed GTM lane has a linked Paperclip issue identifier in the working list
- every GTM stage owner has a dated response expectation attached when work enters review, approval, or readiness prep
- every implementation-complete ticket gets a same-cycle review or closure action
- CTO comments should state the decision, owner, and next action plainly enough that the next heartbeat can continue without rereading strategy docs

## Immediate Org Rollout

### CTO

- enforce state discipline across technical tickets
- ensure prerequisite tickets exist before implementation is expected to finish
- keep one active implementation slice and one ready-next slice only

### UX

- standardize the design-request and workflow-handoff artifact for user-facing work
- keep executable workflow decisions in `docs/ux/` and route review outcomes into structured follow-up work

### CMO

- move committed GTM work into issue-backed execution units with named stage owners and dated response expectations
- start distribution preparation when opportunities qualify, not after avoidable setup delays
- keep the weekly markdown working list reconciled to the live Paperclip issue IDs for drafts, readiness prep, and distribution tasks

## Delivery Health Checks

Use this compact scorecard each week:

- active implementation issue count
- blocker count and oldest blocker age
- median cycle time for completed implementation tickets
- UX review coverage on user-facing changes
- number of unresolved cross-functional decisions older than 3 business days
- median time from `ready for draft` to approval response
- median time from implementation-complete comment to review or closure

If any of these drift, the CTO should reduce work in progress before adding process.
