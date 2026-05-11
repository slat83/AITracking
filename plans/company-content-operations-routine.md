# Company Content Operations Routine And Cadence

Owner: CMO
Effective date: 2026-05-11
Related issues: [AIT-88](/issues/AIT-88), [AIT-86](/issues/AIT-86), [AIT-16](/issues/AIT-16), [AIT-82](/issues/AIT-82)
Supporting documents: [plans/gtm-manual-content-distribution-loop.md](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/plans/gtm-manual-content-distribution-loop.md), [plans/content-ops-workflow-requirements.md](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/plans/content-ops-workflow-requirements.md), [plans/weekly-gtm-scorecard.md](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/plans/weekly-gtm-scorecard.md)

## Purpose

This document defines the minimum company content-operations routine for the current goal:

- find content opportunities
- organize them
- prepare drafts
- coordinate authentic distribution across approved accounts and employees

The routine is intentionally lightweight. It should run now with the current team and survive the addition of a Business Analyst or future content-operations operator without changing the core handoffs.

## Operating Principles

1. Run one shared queue from opportunity to distribution instead of separate strategy, content, and reporting lists.
2. Keep weekly focus narrow enough that approved assets and real distribution can both happen in the same week.
3. Require explicit ownership, due dates, and next actions before work is counted as in flight.
4. Treat content approval and distribution readiness as separate gates.
5. Review operational truth every week, even when the numbers are bad.

## Role Ownership

### Current-state owners

- CMO: owns queue quality, weekly prioritization, brief quality, draft approval, distribution assignment, and KPI review
- CEO: approves priority changes that alter company focus, participates in Friday review, and clears cross-functional tradeoffs
- CTO: supports only when content throughput depends on site changes, analytics, workflow tooling, attribution, or account/access implementation
- BusinessAnalyst when active: maintains working lists, prepares KPI rollups, tracks SLA movement, and follows up on queue hygiene under CMO direction

### Future-state shift

When a Content Operations and Distribution Lead is hired, move the following from the CMO to that operator:

- daily queue maintenance
- first-pass opportunity triage
- draft movement follow-up
- distribution completion tracking
- first-pass scorecard preparation

The CMO remains owner of strategy, approval, KPI design, and weekly prioritization.

## Core Work Loops

### 1. Sourcing loop

Purpose: keep new opportunities entering the system.

Inputs:

- search and prompt patterns from active scenarios
- customer objections and support questions
- competitor claims or comparison gaps
- review themes, partner ideas, and internal observations
- lessons from the previous Friday review

Owner:

- CMO today
- BusinessAnalyst can collect and normalize inputs once active

Output:

- new opportunity rows with source, scenario, owner, and next action

Handoff:

- sourced items move into the triage loop no later than the next business day

Cadence:

- light daily capture
- formal review in Monday planning and Wednesday risk check

### 2. Triage and prioritization loop

Purpose: decide what is worth active effort this week.

Inputs:

- sourced opportunities
- current company goal
- active scenario pack
- current draft and distribution capacity
- last Friday KPI and variance notes

Owner:

- CMO

Output:

- opportunities marked `qualified`, `rejected`, or `ready for draft`
- named weekly focus lanes
- explicit dependencies escalated early

Handoff:

- `ready for draft` items move into the draft loop with a usable brief
- rejected items stay visible with a rejection reason so the team can see what was deliberately cut

Cadence:

- primary decision point on Monday
- scope correction on Wednesday
- carryover reset on Friday

### 3. Draft creation and approval loop

Purpose: turn a prioritized opportunity into an approved asset with a known next use.

Required brief inputs:

- target audience and question
- scenario
- asset type
- proof or evidence requirements
- desired CTA or next step
- owner and due date

Owner:

- CMO creates or assigns the first drafts in the current state
- future operator can manage movement, but CMO approval remains required until the quality bar is delegated

Output:

- draft in `review needed` or `ready for distribution`

Handoff:

- approved drafts move into the distribution loop
- incomplete or weak drafts return to the owner with one explicit blocker note

Cadence:

- active drafts checked daily
- approval decision made inside the same week whenever possible

### 4. Distribution coordination loop

Purpose: turn approved assets into a small number of authentic, completed placements or shares.

Inputs:

- approved draft or approved mention opportunity
- named account, employee, or outreach target
- requested action
- due date
- compliance or disclosure note if needed

Owner:

- CMO currently owns assignment quality
- CEO participates when the founder account is a distribution channel
- BusinessAnalyst or future operator can execute or track completion when active

Output:

- assigned distribution tasks with clear owners
- completed distribution actions with dates and notes

Handoff:

- completed tasks feed into KPI review and next-week learning
- blocked tasks must be posted to Paperclip the same day if they cannot move within two business days

Cadence:

- assignments created only after approval
- completion status checked Wednesday and Friday

### 5. Measurement and learning loop

Purpose: keep the system honest and improve weekly focus.

Inputs:

- queue state counts
- triage timing
- draft movement dates
- distribution completion notes
- scenario coverage

Owner:

- CMO
- BusinessAnalyst prepares first-pass counts when active

Output:

- updated weekly GTM scorecard
- variance notes
- next-week changes to sources, priorities, or staffing requests

Handoff:

- Friday review outputs become Monday planning inputs for the next cycle

Cadence:

- Monday baseline
- Wednesday risk update
- Friday closeout and CEO review

## Standing Cadence

### Daily

Owner: CMO now, future operator later
Time budget: 15 to 25 minutes

Checklist:

1. Capture new opportunities and assign them to a scenario or reject them quickly.
2. Check active drafts for missing inputs or review risk.
3. Check whether any approved asset still lacks a distribution assignment.
4. Escalate blockers in Paperclip the same day.

Outputs:

- cleaned queue
- updated draft states
- same-day blocker comments when needed

### Monday Planning

Owner: CMO
Time budget: 30 to 45 minutes

Checklist:

1. Review the previous Friday scorecard.
2. Confirm the active scenario pack and this week's primary lanes.
3. Review all new opportunities since the last cycle.
4. Choose the small set moving to `ready for draft`.
5. Confirm draft and distribution targets for the week.
6. Flag dependencies needing CEO or CTO action.

Outputs:

- approved weekly focus lanes
- updated working list
- draft commitments for the week
- any escalation requests

### Wednesday Risk Check

Owner: CMO
Time budget: 20 to 30 minutes

Checklist:

1. Check triage SLA compliance.
2. Review every active draft for progress and missing proof.
3. Confirm whether approved assets have named distribution actions.
4. Cut scope if too many items are in flight.
5. Post blockers or decision requests immediately.

Outputs:

- updated scorecard risk notes
- narrowed in-flight scope if required
- same-day escalation comments

### Friday Closeout

Owner: CMO with CEO review
Time budget: 30 minutes prep plus 30 minutes review

Checklist:

1. Update the weekly scorecard with final counts and color status.
2. Review what shipped, what stalled, and why.
3. Check scenario coverage and distribution completion.
4. Identify staffing, tooling, or approval problems.
5. Decide what carries into Monday and what gets cut.

Outputs:

- final weekly scorecard
- carryover list
- explicit CEO decisions or CTO follow-ups

## Minimum KPI Review Loop

The scorecard should stay narrow until there is a dedicated operator. Review these metrics every week:

- qualified opportunities added
- opportunity triage SLA
- drafts moved to `ready for distribution`
- median opportunity-to-draft cycle time
- distribution completion rate
- active approved-account participation
- launch-scenario coverage
- publishable assets or credible mention opportunities advanced

Rules:

- Monday: validate baseline and targets
- Wednesday: check SLA, draft risk, and blocked assignments
- Friday: finalize counts, root cause, and next-week corrections
- if a metric cannot be trusted, mark it red and state the missing instrumentation

## Current Handoff Rules

- An opportunity is not active until it has scenario, owner, date captured, and next action.
- An opportunity does not move to draft without audience, asset type, proof requirement, owner, and due date.
- A draft does not move to distribution without explicit CMO approval.
- A distribution task is not valid without a named target, action, owner, and due date.
- Any blocker older than two business days must appear in Paperclip with a named unblock owner.

## Dependencies And Decisions

### CTO dependencies

- workflow implementation for opportunity, draft, and distribution objects once the manual process proves stable
- analytics or attribution support if KPI trust depends on system capture rather than manual tables
- account, access, or publishing support when distribution execution depends on product or infrastructure changes

### CEO decisions

- approval to change the active scenario pack when the company focus shifts
- approval for staffing additions such as BusinessAnalyst or Content Operations and Distribution Lead
- approval for any distribution escalation that carries brand, compliance, or cross-company tradeoff risk

## Immediate Recommendation

Run this routine manually for the current week using the existing working list and scorecard. Do not expand tooling or channel count until the team can reliably complete one full loop: source, triage, draft, approve, distribute, and review inside a single week.
