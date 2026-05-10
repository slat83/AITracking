# CEO Operating Routine and Progress Review System

## Purpose

This document defines the CEO operating system for running the company with clear cadence, measurable progress checks, and fast escalation. It is designed for the current stage: one active CEO, one active CTO, pending cross-functional hires, and a greenfield product effort.

The goal is to make company progress visible every week, keep decisions small and fast, and avoid drift between strategy, hiring, product execution, and distribution readiness.

## Operating Principles

- Run the company from a short list of outcomes, not a long list of activities.
- Review the same core scorecard every week so trend changes are visible early.
- Keep ownership explicit. Every active priority has one directly responsible owner.
- Escalate quickly when a metric misses threshold, a decision stalls, or a blocker ages out.
- Use Paperclip issues as the execution system and this document as the management cadence.

## CEO Core Outputs

The CEO is responsible for producing and maintaining these artifacts:

1. Weekly CEO scorecard
2. Weekly company priorities list
3. Monthly company review
4. Quarterly plan and decision memo
5. Open decisions and escalations log in Paperclip issue comments where appropriate

## Standard Artifacts

### Weekly CEO scorecard

Update once per week before the Friday company progress review.

Template:

```md
# Weekly CEO Scorecard

Week of:

## Company Outcomes
- Goal status:
- This week's top 3 priorities:
- Overall company health: green / yellow / red

## Metrics Snapshot
- Hiring funnel health:
- Product delivery health:
- Content/distribution readiness:
- Critical blockers:
- Cash/spend watch:

## Decisions Needed
- Decision:
- Owner:
- Due date:

## Escalations
- Issue:
- Owner:
- Next action:
```

### Monthly company review

Update in the first week of each month.

Template:

```md
# Monthly Company Review

Month:

## What moved
- Wins:
- Misses:
- Metrics that improved:
- Metrics that declined:

## Root causes
- What created the gains:
- What created the misses:

## Staffing and execution
- Key hiring changes:
- Capacity constraints:
- Important risks:

## Decisions for next month
- Start:
- Stop:
- Continue:
```

### Quarterly plan and decision memo

Update before each new quarter starts.

Template:

```md
# Quarterly CEO Plan

Quarter:

## Outcome targets
- Company objective:
- 3-5 measurable outcomes:

## Biggest risks
- Risk:
- Mitigation:

## Headcount and budget decisions
- Approved:
- Deferred:

## Operating changes
- What cadence changes this quarter:
- What metrics are added or removed:
```

## Daily Routine

Time budget: 30 to 45 minutes.

1. Check Paperclip for new blockers, overdue approvals, and stalled high-priority issues.
2. Review the top company goal and confirm the current top three priorities still hold.
3. Clear decisions that are waiting on CEO approval.
4. Check for any metric or execution exception that requires same-day intervention.
5. Send any priority clarifications needed to CTO, and to CMO or UX once those functions are active.

Daily inputs:

- Paperclip assigned and blocked issues
- pending approvals
- current weekly scorecard
- active hiring pipeline status

Daily outputs:

- resolved approvals
- updated priority direction when needed
- escalations or unblock requests

## Weekly Routine

This is the main operating loop. The CEO should run it every week without fail.

### Monday: priority setting

Duration: 45 minutes with solo prep, 30 minutes with CTO.

Agenda:

1. Review last week's scorecard and open decisions.
2. Confirm this week's top three company outcomes.
3. Check whether any issue tree needs re-prioritization.
4. Confirm the highest-risk blocker and its owner.
5. Align with CTO on execution plan and hiring movement.

Outputs:

- current week's top priorities
- any changes to issue priority or sequencing
- named owner for each active company outcome

### Wednesday: execution and risk check

Duration: 30 minutes.

Attendees: CEO + CTO, plus CMO and UX when active.

Agenda:

1. Review delivery progress against the Monday priorities.
2. Review blocker age and any slippage against plan.
3. Decide whether scope needs to be cut, sequencing changed, or escalation triggered.
4. Confirm whether any external dependencies or approvals are at risk.

Outputs:

- risk calls
- scope cuts or sequence changes
- escalations assigned with deadlines

### Friday: company progress review

Duration: 45 to 60 minutes.

Attendees: CEO + CTO. Add other functional leads once active.

Agenda:

1. Review the weekly CEO scorecard.
2. Review movement in core metrics.
3. Review what shipped, what slipped, and why.
4. Review hiring status and capacity constraints.
5. Review decisions deferred during the week.
6. Set follow-up actions for next Monday.

Outputs:

- completed weekly scorecard
- decisions logged
- escalations carried into next week

## Monthly Routine

Time budget: 2 to 3 hours total.

1. Run the monthly company review.
2. Compare month-end results against quarterly targets.
3. Review hiring funnel conversion, execution capacity, and budget posture.
4. Decide whether any standing meeting cadence or ownership boundary should change.
5. Reset the scorecard thresholds if the company stage has materially changed.

Monthly outputs:

- monthly company review
- headcount or budget decisions
- any changes to operating cadence

## Quarterly Routine

Time budget: half day to full day.

1. Review the prior quarter against company outcomes, not anecdotal activity.
2. Define the next quarter's objective and measurable outcomes.
3. Decide headcount sequence and budget constraints.
4. Re-rank the major company workstreams across product, engineering, UX, and marketing.
5. Remove stale work that no longer supports the company goal.

Quarterly outputs:

- quarterly plan and decision memo
- updated goal-level priorities
- approved hiring and operating changes

## Core Dashboard

The CEO should use a single compact dashboard. At current scale, it should fit on one page and be reviewed weekly.

### Section 1: company outcome health

- Goal progress: on track / at risk / off track
- Number of active company priorities: target 3 or fewer
- Critical blocker age: target no blocker older than 7 days
- Open CEO decisions older than 3 business days: target 0

### Section 2: hiring and capacity

- Founding engineer role status
- Days open for each critical role
- Time from open to accepted for priority hires
- Number of active functions with no owner

Current thresholds:

- Founding engineer role open more than 21 days: escalate
- Any critical leadership function unowned for more than 30 days: escalate

### Section 3: product and engineering execution

Use the technical measures already defined by the CTO as the execution slice of the CEO dashboard.

- Technical issue decomposition coverage
- Critical unblocker age
- Story cycle time after engineering hire starts
- Deploy frequency once deployment exists
- Escaped production defects once product exists

Current thresholds:

- Near-term product scope not decomposed into actionable issues: escalate to CTO
- Critical technical blocker older than 7 days: escalate same week
- Median cycle time above 5 working days for small/medium tickets after hiring: inspect scope and staffing

### Section 4: workflow and go-to-market readiness

Before CMO and UX are active, review these as readiness checks. After those functions are active, convert them into owned operating metrics.

- Number of documented core workflow assumptions still unvalidated
- Number of launch-critical content/distribution dependencies without an owner
- Number of major UX or messaging decisions awaiting a functional lead

Current thresholds:

- Any launch-critical dependency without owner for more than 7 days: escalate
- More than 3 unresolved workflow assumptions tied to active build scope: escalate

## Meeting Cadence by Function

### CEO and CTO

- Monday weekly priorities: 30 minutes
- Wednesday execution check: 30 minutes
- Friday scorecard review: 45 to 60 minutes
- Monthly company review: 60 minutes
- Quarterly planning: half day

### CEO and CMO

Start once CMO is active.

- Weekly growth/distribution review: 30 minutes
- Monthly pipeline and channel review: 45 minutes

### CEO and UX

Start once UX is active.

- Weekly workflow/design review: 30 minutes
- Monthly usability and research synthesis review: 45 minutes

### Full leadership review

Start once at least CEO, CTO, CMO, and UX are active.

- Weekly company progress review: 60 minutes
- Monthly business review: 90 minutes
- Quarterly planning review: half day

## Ownership Boundaries

### CEO owns

- company goal and business priorities
- budget and hiring sequence
- cross-functional tradeoffs
- final approval on major scope and resource decisions

### CTO owns

- technical strategy and architecture
- engineering issue decomposition and delivery management
- technical KPI definition and engineering hiring
- escalation of technical blockers and resourcing gaps

### UX owns once active

- workflow quality
- user research synthesis
- interaction design decisions
- design-system clarity for core product flows

### CMO owns once active

- messaging strategy
- content/distribution operating plan
- channel testing and performance learning
- go-to-market execution metrics

## Escalation Rules

Escalate to same-day review when any of these occur:

- a critical blocker is older than 7 days
- a CEO-owned decision is pending longer than 3 business days
- a priority hire is open longer than threshold without qualified pipeline
- a weekly top-three priority becomes infeasible without scope change
- there is no clear owner for a launch-critical dependency

Escalation actions:

1. Name the issue and owner.
2. State the decision or unblock needed.
3. Set a due date within 1 to 3 business days.
4. Decide whether to cut scope, change sequence, reassign ownership, or request approval.

## How This Connects to Paperclip

- Use Paperclip issues for execution, blockers, dependencies, and approvals.
- Use the weekly CEO scorecard to summarize what the issue system is saying at the company level.
- Record major CEO decisions in the relevant issue comment thread so execution history stays attached to work.
- If a blocker depends on another issue, make that dependency explicit with `blockedByIssueIds`.

## Implementation Notes for Current Stage

Given the current company state:

- The CEO and CTO run the full weekly company review together now.
- CMO and UX cadences become active only after those approvals clear.
- The dashboard should remain intentionally small until product execution and go-to-market functions are staffed.
- No separate program-management layer is needed yet; discipline should come from consistent weekly review and explicit ownership.
