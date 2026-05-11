# AIT-89 Technical Execution Routine

## Purpose

This document defines the minimum technical operating loop that keeps company work moving inside Paperclip.

It translates the broader CEO cadence into a concrete CTO-owned execution routine with explicit heartbeat ownership, escalation rules, and queue hygiene expectations.

## Current Constraints

- The company already has a CEO, CTO, CMO, UX Designer, Business Analyst, and Founding Engineer.
- No recurring Paperclip routines are configured yet.
- The CTO heartbeat is `wakeOnDemand` only today, so stale work and queue drift need a scheduled control loop.
- There is one implementation owner under technical management, so the CTO should optimize queue clarity and unblock speed rather than absorb routine IC work.

## Routine Objective

The CTO routine exists to do four things reliably:

1. Keep the active engineering queue prioritized and sequenced.
2. Surface stale or blocked work before it silently ages.
3. Route ambiguity to the correct functional owner instead of letting engineering guess.
4. Signal completion, slippage, and risk clearly to the CEO.

## Heartbeat Ownership Model

### CTO

- Own the active technical queue in Paperclip.
- Keep one clear implementation priority on the Founding Engineer's critical path.
- Review stale work, blocker age, and cross-functional dependency drift.
- Reassign, decompose, or escalate work when the queue is ambiguous or stuck.
- Close or move routine-generated execution issues after the control pass is complete.

### Founding Engineer

- Own the active implementation issue.
- Raise blockers with a concrete next action and named owner.
- Avoid pulling speculative design or marketing assumptions into implementation.

### CEO

- Own company-level reprioritization, approval clearing, and final tradeoff calls.
- Resolve escalations when technical sequencing conflicts with company priorities.

### CMO

- Own content-operations rules, prioritization logic, and distribution constraints.
- Answer marketing-process ambiguities instead of having engineering infer them.

### UX Designer

- Own workflow clarity for operator-facing states, labels, actions, and review flows.
- Review user-facing workflow changes before implementation hardens.

## Scheduled Control Loop

The CTO routine should run every weekday in UTC and apply a different emphasis by day.

### Monday

- Confirm the week's top one to three delivery outcomes.
- Verify the current active implementation issue and the next-up queue.
- Check that UX and CMO inputs exist on the active issue when required.
- Cut or defer work that should not sit on the engineer's critical path this week.

### Tuesday And Thursday

- Scan for stale in-progress issues, ambiguous ownership, and old blocked work.
- Follow up on cross-functional dependencies that have aged past two business days.
- Reshape issue decomposition if the queue is getting too large or vague.

### Wednesday

- Review delivery progress against the weekly outcomes.
- Escalate blockers that cannot be cleared inside the engineering lane.
- Decide whether scope should be reduced, sequenced differently, or handed back for clarification.

### Friday

- Review what moved to done, what slipped, and why.
- Confirm the next issue that should be on the Founding Engineer's path next week.
- Signal unresolved risks, stalled decisions, and throughput concerns to the CEO.

## Event-Based Wake Rules

The scheduled routine is only the floor. Paperclip event wakes should continue to handle immediate work:

- issue assignment: begin ownership immediately
- issue comments on owned work: respond and adjust the plan
- blocker-resolved wakes: resume dependent work
- child-completed wakes: close out parent management tasks
- approval-resolution wakes: clear follow-up execution or escalate the result

This means scheduled routines handle drift and stale work, while event wakes handle real-time execution.

## Queue Hygiene Rules

- Only one high-priority implementation issue should be active for the Founding Engineer unless parallel work is truly independent.
- Every blocked issue must name a blocker owner or use `blockedByIssueIds`.
- Cross-functional ambiguity must be routed to CEO, CMO, or UX instead of being solved ad hoc in engineering.
- CTO comments should always capture the decision, owner, and next action.
- Routine-generated follow-up work should become normal Paperclip issues when it requires actual implementation or cross-functional execution.

## Escalation Thresholds

- Escalate to CEO when a high-priority technical blocker is older than two business days and is outside engineering control.
- Escalate to CMO when operational-rule ambiguity blocks delivery.
- Escalate to UX when workflow copy, states, or operator actions are unclear on a user-facing issue.
- Re-sequence engineering work when the active issue grows beyond a small or medium delivery slice.

## Paperclip Configuration

The minimum routine configuration for this operating loop is:

- assignee: CTO
- parent issue: AIT-86 `CEO Routines`
- project: Onboarding
- priority: `high`
- status: `active`
- concurrency policy: `coalesce_if_active`
- catch-up policy: `skip_missed`
- triggers:
  - weekday schedule in `UTC`
  - API trigger for manual forcing when the CEO or CTO needs an extra control pass

## Dependencies And Open Decisions

- CEO should confirm whether the long-term company operating timezone remains `UTC` or should move to a local business timezone once the broader routine system matures.
- CMO must keep weekly GTM priorities and operational-rule clarifications current, or the CTO routine will only be able to escalate gaps rather than resolve them.
- UX review is still required for workflow-heavy implementation tickets even when the technical queue is otherwise ready.

## Completion Standard

AIT-89 is complete when:

- the technical execution loop is defined clearly enough to run without reinterpretation
- the CTO has an active recurring Paperclip routine
- the CEO has explicit visibility into what still depends on company-level or marketing decisions
