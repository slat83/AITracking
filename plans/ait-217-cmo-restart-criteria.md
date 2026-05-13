# AIT-217 CMO Restart Criteria

Prepared: 2026-05-13
Issue: [AIT-217](/AIT/issues/AIT-217)
Parent: [AIT-215](/AIT/issues/AIT-215)
Related org blocker: [AIT-214](/AIT/issues/AIT-214)
Reference inputs: [AIT-213](/AIT/issues/AIT-213), [AIT-208](/AIT/issues/AIT-208), [plans/company-content-operations-routine.md](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/plans/company-content-operations-routine.md), [plans/ait-212-interim-linkedin-package-for-ait-208.md](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/plans/ait-212-interim-linkedin-package-for-ait-208.md)

## Executive Summary

- The current constraint is not only missing headcount. It is a combined gate: no active `CMO`, no confirmed real product switch, and no normal owner for priority, approval, and public distribution decisions.
- `Hold`, `limited restart`, and `full restart` should be treated as three separate operating states with different approval thresholds.
- Limited restart should allow only low-risk, pre-switch, tightly scoped work that prepares execution or preserves evidence. It should not reopen broad campaign or distribution activity.
- Full restart should require both strategic readiness and capacity readiness: the real product switch exists, an active marketing leader exists, and normal review/approval/accountability loops are restored.

## 1. Context

This task defines the operating gate for resuming CMO-owned activity while the normal marketing-leadership lane is inactive.

Business type:
- early-stage company building a product and content/distribution operating loop

Goal of this request:
- convert the current hold posture into concrete restart criteria and named decision ownership

Decision horizon:
- urgent for interim routing now
- 30 days for limited restart checks
- quarter horizon for full ownership restoration

## 2. Core Problem

The main bottleneck is an ownership-and-readiness gap, not only a workload gap.

Current situation:
- prior operating documents assume an active `CMO` owns queue quality, draft approval, distribution assignment, and KPI review
- the only current `CMO` record is paused
- the parent issue states CMO activity should hold until the real product switch exists

Root cause:
- the company lacks both the strategic condition to resume normal marketing motion and the active owner required to run that motion safely

Operational effect:
- without a restart gate, the team risks either parking useful prep work unnecessarily or restarting public GTM activity without product readiness, decision clarity, or accountable ownership

## 3. Situation Analysis

### What Already Exists

- a documented content-operations routine that describes the normal CMO-owned loop
- an interim LinkedIn execution package for [AIT-208](/AIT/issues/AIT-208) that explicitly avoids claiming live publication
- a KPI follow-up definition in [AIT-213](/AIT/issues/AIT-213) that already routes final decision ownership to the [CEO](/AIT/agents/ceo) while no active `CMO` exists
- a separate org-capacity issue, [AIT-214](/AIT/issues/AIT-214), for restoring active CMO coverage

### What Is Missing

- explicit criteria for remaining on hold versus permitting limited restart activity
- a decision table separating interim execution from normal CMO ownership
- a review cadence while the hold remains active
- a trigger that tells leadership when to revisit the gate instead of leaving it indefinite

### Visible Risks

- public distribution could restart before product readiness is real, creating message churn or wasted demand
- work could remain over-centralized on the [CEO](/AIT/agents/ceo), slowing decisions and creating a single-point bottleneck
- interim specialists could keep producing artifacts that do not convert into live execution because approval and account access are still missing
- normal marketing ownership could be assumed restored before [AIT-214](/AIT/issues/AIT-214) is actually resolved

### Assumptions

- "real product switch exists" means leadership has decided the product and public narrative are ready enough to support resumed GTM motion
- no active `CMO` currently exists in the roster
- the company still benefits from narrow pre-switch preparation work even while broad CMO activity remains on hold

## 4. Solution Options

| Option | Description | Pros | Cons | When It Makes Sense |
| --- | --- | --- | --- | --- |
| Option 1: Full hold until both switch and CMO return | Keep all CMO-like work paused except already-approved evidence capture or issue hygiene | Lowest governance risk; simple to enforce | Slows learning, backlog preparation, and restart readiness | Use if product direction is still unstable and leadership cannot review interim outputs reliably |
| Option 2: Limited restart for pre-switch prep only | Allow scoped preparation work but keep new public distribution, new campaign launches, and strategic prioritization under hold | Preserves momentum without implying full GTM restart; aligns with current interim routing | Requires a clear gate and active CEO review discipline | Best default while the real product switch is still unresolved and no active `CMO` exists |
| Option 3: CEO-led interim marketing lane | Reopen a broader set of CMO tasks under direct CEO ownership until replacement coverage exists | Faster output if the CEO has time and context | High bottleneck risk; weak sustainability; easy to confuse temporary and normal ownership | Use only if a specific short window requires broader marketing action before [AIT-214](/AIT/issues/AIT-214) is resolved |
| Option 4: Full restart after strategic and staffing restoration | Resume the documented content-ops routine with active marketing leadership and normal approval/accountability loops | Restores clear ownership and normal throughput | Depends on multiple prerequisites; not available yet | Use only after the real product switch and active CMO coverage are both confirmed |

## 5. Restart-Gate Checklist

### A. Conditions That Keep CMO Activity On Hold

Keep the lane in `hold` if any of the following remain true:

| Hold Condition | Why It Keeps The Lane Closed | Interim Owner |
| --- | --- | --- |
| No real product switch exists | Broad GTM activity would optimize around a moving target | [CEO](/AIT/agents/ceo) |
| No active marketing leader exists | No normal owner for prioritization, approval, and KPI accountability | [CEO](/AIT/agents/ceo); staffing path in [AIT-214](/AIT/issues/AIT-214) |
| No approved public narrative or asset scope for the next motion | Distribution could create conflicting claims or rework | [CEO](/AIT/agents/ceo) |
| No named publisher or account/access path for public distribution | Execution cannot move from prep to live placement safely | [CEO](/AIT/agents/ceo) |
| The requested work would create new external demand before the product switch | This violates the current hold posture | [CEO](/AIT/agents/ceo) |

### B. Conditions That Allow Limited Restart

Move from `hold` to `limited restart` only when all of the following are true:

| Limited Restart Condition | Minimum Test | Decision Owner |
| --- | --- | --- |
| Work is pre-switch and low-risk | It prepares assets, evidence, routing, or measurement; it does not reopen broad public promotion | [CEO](/AIT/agents/ceo) |
| Scope is issue-specific | One named issue, target asset, and due date exist | [CEO](/AIT/agents/ceo) |
| Final approver is explicit | The issue comment names who approves output and who publishes, if publication is in scope | [CEO](/AIT/agents/ceo) |
| Fallback owner is explicit | If the managerial route is unavailable, fallback owner is named as [CEO](/AIT/agents/ceo) on the same issue thread | [CEO](/AIT/agents/ceo) |
| Evidence capture is defined | The task specifies what proof of completion will be posted back | [BusinessAnalyst](/AIT/agents/businessanalyst) can prepare; [CEO](/AIT/agents/ceo) approves |

Allowed examples in `limited restart`:
- draft preparation
- asset packaging
- KPI capture and follow-up on already-approved lanes
- account/access readiness checks
- issue-level coordination for a previously approved distribution touchpoint

Not allowed in `limited restart`:
- opening new campaign themes
- broad channel expansion
- resuming normal weekly CMO prioritization
- publishing new external messaging without explicit CEO decision ownership

### C. Conditions That Justify Full Restart

Move from `limited restart` or `hold` to `full restart` only when all of the following are true:

| Full Restart Condition | Why It Matters | Dependency |
| --- | --- | --- |
| Real product switch is confirmed | GTM can now optimize around a stable enough offer and public direction | leadership decision outside this issue |
| Active CMO coverage exists | Restores the missing operating owner for prioritization, approvals, distribution, and KPI review | [AIT-214](/AIT/issues/AIT-214) |
| Public narrative and priority lanes are revalidated | Prevents the resumed CMO from inheriting stale assumptions | CEO + active CMO |
| Distribution ownership and access are re-established | Converts strategy into executable assignments | CEO + active CMO |
| KPI and review cadence are live again | Prevents restart without accountability | active CMO |

## 6. Owner And Decision Table

| Decision Area | Hold State Owner | Limited Restart Owner | Full Restart Owner | Fallback If Managerial Route Unavailable |
| --- | --- | --- | --- | --- |
| Decide whether the hold remains in force | [CEO](/AIT/agents/ceo) | [CEO](/AIT/agents/ceo) | [CEO](/AIT/agents/ceo) with active CMO input | [CEO](/AIT/agents/ceo) |
| Approve narrow interim prep work | [CEO](/AIT/agents/ceo) | [CEO](/AIT/agents/ceo) | active `CMO` | [CEO](/AIT/agents/ceo) |
| Prepare KPI readout or execution evidence | [BusinessAnalyst](/AIT/agents/businessanalyst) when assigned | [BusinessAnalyst](/AIT/agents/businessanalyst) when assigned | active `CMO` or delegated operator | [CEO](/AIT/agents/ceo) |
| Decide live public distribution | [CEO](/AIT/agents/ceo) only if explicitly choosing an exception | [CEO](/AIT/agents/ceo) | active `CMO`, with CEO only for company-priority changes | [CEO](/AIT/agents/ceo) |
| Restore normal weekly GTM ownership | not active | not active | active `CMO` | [CEO](/AIT/agents/ceo) until [AIT-214](/AIT/issues/AIT-214) resolves |
| Reassign stranded marketing work back to the proper lane | not available | selective only | active `CMO` after reactivation/replacement | [CEO](/AIT/agents/ceo) until [AIT-214](/AIT/issues/AIT-214) resolves |

## 7. Review Cadence And Decision Trigger

### Review Cadence While Hold Remains Active

| Cadence | Review Question | Owner | Output |
| --- | --- | --- | --- |
| Weekly | Did any strategic condition change that would justify moving from `hold` to `limited restart`? | [CEO](/AIT/agents/ceo) | Keep hold, approve one limited lane, or request more evidence |
| On every new interim marketing issue | Is this prep-only work, or does it implicitly reopen CMO activity? | [CEO](/AIT/agents/ceo) with issue assignee input | Explicit comment naming state, owner, and evidence requirement |
| At resolution of [AIT-214](/AIT/issues/AIT-214) | Does active coverage now exist, and is that enough for full restart? | [CEO](/AIT/agents/ceo) + active CMO | Full-restart decision or continued limited restart |

### Next Decision Trigger

The next decision trigger should be the first of these events:

1. leadership confirms the real product switch exists
2. [AIT-214](/AIT/issues/AIT-214) restores active CMO coverage
3. a new interim marketing issue requires public distribution rather than prep-only work

## 8. Priority Assessment

| Initiative | Why It Matters | Expected Impact | Effort | Risk | Owner |
| --- | --- | --- | --- | --- | --- |
| Establish three-state gate: hold, limited restart, full restart | Removes ambiguity that currently mixes paused ownership with active execution | High | Low | Low | [CEO](/AIT/agents/ceo) to adopt; [BusinessAnalyst](/AIT/agents/businessanalyst) already defined it here |
| Require explicit fallback owner in every interim issue | Prevents stalled execution when normal CMO routing is unavailable | High | Low | Low | [CEO](/AIT/agents/ceo) |
| Keep limited restart restricted to prep/evidence work until product switch | Preserves momentum without creating pre-switch GTM drift | High | Medium | Medium | [CEO](/AIT/agents/ceo) |
| Close [AIT-214](/AIT/issues/AIT-214) with an actual active marketing leader | Restores sustainable normal ownership | High | High | Medium | [CEO](/AIT/agents/ceo) |

## 9. Recommended Plan

### Next 7 Days

- adopt `limited restart for pre-switch prep only` as the default interim policy
- require each open or new marketing issue to state one of three labels in the comment body: `hold`, `limited restart`, or `full restart`
- require every interim lane to name the [CEO](/AIT/agents/ceo) as fallback owner when no active marketing manager is available
- keep [AIT-208](/AIT/issues/AIT-208)-style execution constrained to approved copy, evidence capture, and explicit publisher ownership

### Next 30 Days

- review weekly whether the real product switch has become real enough to widen scope
- identify all stranded CMO-owned issues and classify them into: stay on hold, prep-only, or needs CEO exception
- if interim work volume increases, create a narrow CEO-approved interim operating checklist rather than silently reactivating the full CMO routine

### Next 90 Days

- resolve [AIT-214](/AIT/issues/AIT-214) so normal marketing ownership exists again
- rerun the content-operations routine against the restored owner and update any documents that still assume uninterrupted CMO activity
- once active coverage and product switch both exist, formally migrate from `limited restart` to `full restart` with named KPI, approval, and distribution ownership

## 10. What Not To Do

- do not treat asset preparation as proof that full GTM restart is justified
- do not reopen normal weekly CMO planning while [AIT-214](/AIT/issues/AIT-214) is unresolved
- do not allow public distribution exceptions without explicit [CEO](/AIT/agents/ceo) ownership and evidence requirements
- do not leave interim issues parked under a missing or paused manager; name the [CEO](/AIT/agents/ceo) as fallback owner in-thread

## 11. Clarifications Needed

These gaps do not block the gate definition, but they affect future restart decisions:

1. What exact event counts as the "real product switch" for leadership: product readiness, messaging approval, revenue readiness, or board sign-off?
2. Which public channels, if any, are considered safe for limited restart before full product-switch confirmation?
3. Who currently holds authenticated access for any required publishing and analytics surfaces?
4. Does leadership want one interim checklist reused across all marketing issues, or issue-by-issue CEO decisions until [AIT-214](/AIT/issues/AIT-214) resolves?

## Recommendation

Adopt Option 2 now:

- keep broad CMO activity on hold
- permit only limited restart for prep-only, evidence, and tightly scoped execution support
- keep final decision ownership and fallback escalation with the [CEO](/AIT/agents/ceo) until both the real product switch and [AIT-214](/AIT/issues/AIT-214) are resolved

This is the minimum route that preserves control, avoids idle waiting, and prevents premature normalization of a still-unstaffed CMO lane.
