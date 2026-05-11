# GTM Manual Content and Distribution Loop

Owner: CMO until a Content Operations and Distribution Lead is hired
Effective date: 2026-05-10
Related work: [AIT-18](/issues/AIT-18), [AIT-16](/issues/AIT-16), [AIT-13](/issues/AIT-13)

## Purpose

This document defines the lightweight weekly operating loop for:

- opportunity intake
- draft handoff
- distribution assignment
- weekly review and learning

It is the manual operating loop for the broader workflow CRM mission in [AIT-36](/issues/AIT-36): detect scenarios, decide the next best action, coordinate approved execution, and learn from the result.

It is intentionally manual. The current team should run this without new tooling, channel specialization, or extra headcount beyond one CMO and one future content/distribution operator.

Manual does not mean tracker-only. Once the CMO commits an item for the current week, the execution record moves into Paperclip issues and this document becomes the operating contract for how those issues should be routed.

## Scope

Run the loop against the current company goal:

- find content opportunities
- organize them
- prepare drafts
- coordinate authentic distribution across approved accounts and employees

Use the four priority demand scenarios from [AIT-16](/issues/AIT-16) as the current EpicVIN launch queue:

1. best VIN decoder
2. is EpicVIN legit
3. EpicVIN vs Carfax
4. cheap VIN check

## Roles

### Current state

- CMO: owns intake quality, weekly prioritization, scorecard updates, draft approval, distribution assignment, and CEO review
- CEO: reviews the Friday scorecard, resolves cross-company tradeoffs, and approves staffing or escalation decisions
- CTO / founding engineer: support only when a GTM opportunity depends on product, analytics, workflow tooling, or site implementation work
- UX: supports message clarity or page-structure feedback when requested

### Future state

When a Content Operations and Distribution Lead exists, move these tasks from the CMO to that operator:

- daily queue maintenance
- triage SLA tracking
- draft movement follow-up
- distribution completion tracking
- first-pass Friday KPI rollup

The CMO should then remain owner of strategy, quality bar, KPI design, and weekly prioritization.

## Canonical Queue States

Use these states consistently in whatever working list the team is using.

The working list is the readable queue index. It is not the execution system for committed work. As soon as an item is selected for current-week drafting, review, readiness prep, or concrete distribution, link the corresponding Paperclip issue in the working list and move the actual execution updates into the issue.

### Opportunity states

- new: captured but not yet reviewed
- qualified: confirmed relevant to an active scenario in the current launch pack
- rejected: not worth current-cycle effort
- ready for draft: brief is clear enough to hand off

### Draft states

- not started: opportunity approved but no draft in progress
- drafting: asset is being written or assembled
- review needed: ready for CMO review
- ready for distribution: approved and can be assigned out
- published or placed: live or externally placed

### Distribution task states

- assigned: owner and target account are named
- in progress: operator is actively distributing
- done: post, share, outreach, or mention task completed
- blocked: cannot complete without approval, asset, or account access

## Issue-Backed Execution Standard

Use this routing standard once a GTM item is committed:

1. Opportunity rows can stay in the working list while they are only being sourced or triaged.
2. A committed current-week draft or approved mention lane gets one Paperclip draft issue before the next business day starts.
3. Draft review and approval stay on that same issue through `in_review`, with the reviewer or approver commenting a dated decision within 1 business day.
4. If target selection, account access, packaging notes, disclosure language, or outreach-list assembly can be prepared before approval, create a separate readiness-prep issue in the same planning cycle.
5. Each real distribution assignment gets its own Paperclip issue with one owner, one target, one requested action, and one due date.
6. If an issue is waiting on asset approval, account access, or another prerequisite, mark it `blocked` and use a structured blocker instead of leaving the dependency inside tracker prose.

## Stage Owners And Response Dates

Use these operating deadlines for committed work:

| Stage | Owner | Response-date rule |
| --- | --- | --- |
| Opportunity triage | CMO, with BusinessAnalyst support when active | move each new row to `qualified`, `rejected`, or a dated hold note within 2 business days of capture |
| Draft kickoff | CMO | create or refresh the draft issue before the next business day starts |
| Draft review | CMO reviewer unless delegated | approve or return changes within 1 business day after the issue enters `review needed` / `in_review` |
| Executive approval when needed | CEO unless another approver is named | approve or return changes within 1 business day of the approval ask |
| Distribution readiness prep | CMO owns quality, BusinessAnalyst can prepare | name target, access owner, packaging notes, and compliance notes by the next business day after approval, or earlier if prep can run in parallel |
| Distribution execution | named assignee | accept, complete, or mark blocked by the due date; any slip risk gets a same-day comment |

## Weekly Operating Loop

### Monday: intake and priority setting

Owner: CMO
Duration: 30 to 45 minutes

Agenda:

1. Review last Friday's GTM scorecard.
2. Add all new opportunities collected since the last review.
3. Assign each opportunity to an active scenario, using the four EpicVIN launch scenarios for the current cycle.
4. Reject weak opportunities quickly.
5. Select the small set that will move this week.
6. Confirm draft targets and distribution targets for the week.
7. Flag any product, UX, or leadership dependencies immediately.

Outputs:

- updated opportunity queue
- named weekly focus scenarios
- draft list for the week
- distribution goals for the week
- issue creation list for every committed draft, readiness-prep lane, and distribution assignment
- any escalation for CEO or CTO

### Wednesday: movement and risk check

Owner: CMO
Duration: 20 to 30 minutes

Agenda:

1. Check whether new opportunities were triaged within two business days.
2. Check each active draft for progress, missing inputs, and next owner.
3. Check whether any ready assets still lack a distribution plan or a readiness-prep issue.
4. Cut scope if too many items are in flight.
5. Escalate blocked items the same day.

Outputs:

- updated draft states
- distribution assignments and readiness-prep issues confirmed or reduced
- blockers posted to Paperclip
- Wednesday update entered in the weekly GTM scorecard

### Friday: scorecard review and loop reset

Owner: CMO with CEO review
Duration: 30 minutes prep plus 30 minutes review

Agenda:

1. Update the weekly GTM scorecard with final values and status colors.
2. Review what shipped, what stalled, and why.
3. Check whether each priority scenario received enough coverage.
4. Decide whether next week's queue should change.
5. Identify any staffing or tooling problem that cannot be solved manually.

Outputs:

- completed weekly GTM scorecard
- clear carryover list for Monday
- any CEO decision request
- any hiring or tooling recommendation

## Manual Workflow Details

### 1. Opportunity intake

Every opportunity captured this week must include:

- short title
- source
- priority demand scenario
- why it matters now
- suggested asset or distribution angle
- date captured
- owner

Qualification rules:

- directly supports an active scenario in the current launch queue
- can produce a credible owned asset or external mention opportunity
- is specific enough to act on this week or intentionally park

Reject opportunities that are vague, off-scenario, or require unsupported promotional claims.

### 2. Draft handoff

Move an opportunity to `ready for draft` only when the brief is clear enough that another operator could act without reinterpreting the strategy.

At that point, create the draft Paperclip issue before the next business day starts. The issue should carry the owner, due date, scenario, proof needs, and next review date.

A draft brief must contain:

- target audience and question
- target scenario
- asset type
- key evidence or proof requirement
- target CTA or desired next step
- owner and due date

The CMO reviews every first-pass draft until the role is delegated, and the review decision should be posted on the draft issue within 1 business day of the item entering review.

### 3. Distribution assignment

Distribution is assigned only after a draft is approved or a mention target is ready.

If the team can name the target, access work, or packaging notes before approval, open a readiness-prep issue immediately rather than waiting for the draft to finish.

Each assignment must name:

- the asset or opportunity being distributed
- the exact account, employee, or outreach target
- the action requested
- the due date
- the owner
- any approval or compliance note

Do not create a broad channel plan. Create a small number of concrete assignments that can actually be completed inside the week and reviewed as legitimate next-best actions.

Each concrete assignment must have its own Paperclip issue. If the assignment cannot proceed because of approval, asset status, or access, mark that issue `blocked` and link the blocker.

### 4. Closed-loop learning

At Friday review, capture:

- which scenario gained useful movement
- which source types produced the best opportunities
- where drafts got stuck
- which distribution tasks were completed versus abandoned
- what should be removed from next week's queue

Feed those lessons back into Monday intake and prioritization.

## Review Cadence and Escalation Rules

- Monday planning happens before work starts for the week.
- Wednesday risk review happens even if throughput is low.
- Friday scorecard review happens before the CEO progress review.
- If a draft or distribution task is blocked for more than two business days, post the blocker in Paperclip the same day.
- If a review, approval, or readiness-prep response date will slip, post the slip and revised date in the issue the same day it becomes known.
- If weekly targets miss because no operator capacity exists, state that explicitly in the scorecard and raise the staffing need in the Friday review.

## First-Week Rollout

Week starting 2026-05-11:

1. Start the queue with the four priority demand scenarios only.
2. Capture at least 10 qualified opportunities across those scenarios.
3. Move at least 1 opportunity into an approved draft brief.
4. Create at least 1 concrete distribution assignment tied to a real asset or mention opportunity.
5. Finish the Friday scorecard even if most metrics remain red, so the baseline exists for trend review.

## Change Summary

This operating loop now frames the work as a reusable workflow CRM process with EpicVIN as the current launch queue. The practical loop stays the same, but the language no longer treats the four EpicVIN scenarios as the permanent product structure.
