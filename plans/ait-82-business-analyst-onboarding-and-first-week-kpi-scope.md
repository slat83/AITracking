# AIT-82 Business Analyst Onboarding And First-Week KPI Operating Scope

Owner: CMO
Pending hire: BusinessAnalyst
Effective when approval clears: immediately
Related artifacts: [plans/go-to-market-resource-kpi-audit.md](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/plans/go-to-market-resource-kpi-audit.md), [plans/weekly-gtm-scorecard.md](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/plans/weekly-gtm-scorecard.md), [plans/gtm-manual-content-distribution-loop.md](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/plans/gtm-manual-content-distribution-loop.md)

## Purpose

This document prepares the BusinessAnalyst role to join the weekly GTM operating loop without changing strategic ownership.

The role is narrow by design:

- maintain KPI rollups and scorecard hygiene
- convert raw operating activity into visible variance signals
- track scenario coverage and funnel movement
- prepare decision-ready inputs for the CMO and CEO

The role does not own:

- go-to-market strategy
- channel prioritization
- KPI design
- messaging decisions
- final scope tradeoffs

Those remain with the CMO.

## Day-One Charter

The BusinessAnalyst is the operating analyst for the weekly GTM loop.

From day one, the analyst is responsible for:

- keeping the GTM scorecard current and internally consistent
- verifying that every tracked opportunity is mapped to a launch scenario and next action
- measuring queue movement, SLA adherence, draft throughput, and distribution completion
- surfacing misses, data gaps, and stale work before the Wednesday and Friday reviews
- maintaining a short evidence trail for why each metric moved up, down, or stayed flat

The analyst is not responsible for inventing new targets. When targets look wrong, the analyst flags the issue and the CMO decides whether to change them.

## First-Week Outcomes

By the end of the first working week, the analyst should have:

1. taken over preparation of the Monday, Wednesday, and Friday GTM scorecard updates
2. created a clean baseline for the current week's operating KPIs, even if most metrics remain red
3. validated that every in-scope opportunity has owner, scenario, state, date captured, and next action
4. produced a Friday variance readout that shows what moved, what slipped, and why
5. documented any missing instrumentation or source-of-truth gaps that still require manual estimation

## Monday, Wednesday, Friday Rhythm

### Monday planning support

Purpose:
- prepare the CMO to set weekly priorities from a clean baseline

Inputs the analyst assembles before the meeting:
- prior Friday scorecard
- current opportunity list with scenario mapping and queue state
- count of new opportunities captured since last review
- count of items breaching or at risk of breaching triage SLA
- carryover drafts and carryover distribution tasks
- open blockers affecting this week's throughput

Outputs the analyst publishes after the meeting:
- updated Monday section in the weekly GTM scorecard
- current week's baseline metric values
- named weekly focus scenarios
- list of items selected for movement this week
- list of dependencies or escalations assigned to the CMO or CEO

### Wednesday risk review support

Purpose:
- surface execution slippage early enough to cut scope or escalate

Inputs the analyst assembles before the meeting:
- opportunities added so far this week
- triage-age report for unreviewed opportunities
- draft-state snapshot with aging and missing-owner flags
- ready-for-distribution items without assignments
- assigned distribution tasks not yet completed
- changes in scenario coverage relative to Monday plan

Outputs the analyst publishes after the meeting:
- updated Wednesday section in the weekly GTM scorecard
- variance notes for any KPI now off target
- explicit list of items to cut, rescue, or escalate
- Paperclip-ready blocker summary for anything stuck beyond the tolerated window

### Friday scorecard review support

Purpose:
- give the CMO and CEO a compact operating readout for decisions and next-week planning

Inputs the analyst assembles before the meeting:
- final weekly KPI values
- status color for each KPI with a short reason
- completed-versus-planned draft movement
- completed-versus-planned distribution assignments
- scenario coverage summary
- short root-cause notes for misses, including ownerless work or missing data

Outputs the analyst publishes after the meeting:
- completed Friday scorecard section
- one-paragraph weekly variance summary for the CMO
- carryover list for Monday
- instrumentation gaps or staffing gaps requiring follow-up

## Exact Artifacts The Analyst Maintains From Day One

The analyst should maintain these artifacts immediately.

### 1. Weekly GTM scorecard

Primary file:
- [plans/weekly-gtm-scorecard.md](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/plans/weekly-gtm-scorecard.md)

Purpose:
- official weekly KPI readout for Monday, Wednesday, and Friday

Required fields:
- metric name
- owner
- weekly target
- current baseline or final value
- status color
- short note explaining movement or risk

### 2. Opportunity intake and triage working list

Required fields:
- opportunity title
- source
- date captured
- mapped launch scenario
- current queue state
- owner
- next action
- triage completed date
- rejection reason if rejected

Purpose:
- source of truth for qualified opportunities added, SLA tracking, and scenario coverage

### 3. Draft movement tracker

Required fields:
- linked opportunity
- asset type
- current draft state
- owner
- due date
- entered draft date
- review-needed date
- ready-for-distribution date
- blocker note if stalled

Purpose:
- source of truth for draft throughput and opportunity-to-draft cycle time

### 4. Distribution assignment tracker

Required fields:
- linked asset or mention opportunity
- distribution target or account
- requested action
- owner
- due date
- assignment state
- completion date
- block reason if incomplete

Purpose:
- source of truth for distribution completion rate and active participant counts

### 5. Weekly variance notes

Required fields:
- metric missed or at risk
- expected target
- actual current value
- cause
- immediate corrective action
- owner

Purpose:
- preserve why the numbers moved so the Friday review is decision-ready instead of narrative guesswork

## KPI Ownership Boundary

The BusinessAnalyst owns scorecard maintenance and first-pass variance analysis.

The CMO remains owner of:

- final KPI definitions
- KPI target changes
- weekly scenario priorities
- interpretation of what the company should do next

The analyst can recommend a target review after patterns emerge, but does not change the KPI framework unilaterally.

## First-Week Checklist

On the analyst's first live week, complete this sequence:

1. Read the GTM scorecard, KPI audit, and manual content/distribution loop.
2. Confirm the current launch scenarios and active weekly goals with the CMO.
3. Clean the working lists so every tracked item has owner, state, date, and next action.
4. Publish Monday baseline values and note where data is still manual or incomplete.
5. Run the Wednesday risk check with explicit stale-item and SLA flags.
6. Publish the Friday scorecard with root causes, not just counts.
7. Log any missing data source, ambiguous state definition, or reporting gap that needs follow-up work.

## Success Standard

This role is successful in week one if the CMO can walk into Monday, Wednesday, and Friday GTM reviews with a clean, current, trustworthy operating readout and without personally rebuilding the numbers from scratch.
