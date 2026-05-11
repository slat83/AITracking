# Content Ops Workflow Requirements

Owner: CMO
Effective date: 2026-05-10
Related issues: [AIT-41](/issues/AIT-41), [AIT-4](/issues/AIT-4), [AIT-5](/issues/AIT-5), [AIT-6](/issues/AIT-6), [AIT-16](/issues/AIT-16)

## Purpose

This document defines the content-operations rules engineering should model for the first workflow slice.

It translates the GTM operating loop into explicit product requirements for:

- opportunity intake and triage
- draft workspace and review
- distribution coordination readiness
- day-one reporting fields

The initial system should stay narrow. It only needs to support the current four priority demand scenarios:

1. best VIN decoder
2. is EpicVIN legit
3. EpicVIN vs Carfax
4. cheap VIN check

## Product Principles

1. Marketing workflow rules must be explicit in the system, not inferred by engineering.
2. The product should prefer small required field sets with clear gating over broad CRM-style flexibility.
3. Operators should only advance an item when the next owner can act without reinterpreting strategy.
4. Distribution work starts only from approved content or a clearly qualified mention opportunity.
5. Reporting should favor operational truth over vanity metrics in the first release.

## Workflow Objects

The first slice should model three linked objects:

- opportunity: a candidate content or mention idea
- draft: the asset or brief produced from an approved opportunity
- distribution task: a concrete assignment to place, share, or pitch approved content

One opportunity may produce zero or more drafts.
One approved draft may produce zero or more distribution tasks.
Distribution tasks should not exist without a linked approved draft or an explicitly approved mention opportunity.

## AIT-4 Opportunity Intake And Triage Requirements

### Opportunity states

Use these states exactly:

- `new`: captured but not reviewed yet
- `qualified`: relevant and worth keeping in the active queue
- `rejected`: not worth current-cycle effort
- `ready_for_draft`: brief is clear enough to hand off into drafting

### Required opportunity fields

Every opportunity must store:

- title: short working name
- source: where the opportunity came from
- source type: search query, customer question, competitor claim, review theme, partner idea, community discussion, internal idea, other
- priority scenario: one of the four active demand scenarios
- why it matters now: short rationale
- suggested asset or distribution angle
- owner
- date captured
- current state

### Optional but high-value opportunity fields

These fields should exist if cheap to model now because they improve prioritization quality:

- target audience or user question
- target keyword or prompt phrasing
- evidence needed
- dependency note
- rejection reason
- operator notes

### Opportunity qualification rules

An opportunity can move from `new` to `qualified` only when:

- it directly supports one of the four priority scenarios
- it can lead to a credible owned asset or legitimate mention opportunity
- it is specific enough to act on this cycle or intentionally park

Move an opportunity to `rejected` when any of these are true:

- off-scenario
- too vague to assign
- depends on unsupported promotional claims
- low-value relative to active weekly priorities

### Opportunity readiness gate for draft creation

An opportunity can move to `ready_for_draft` only when the following fields are present:

- target audience and question
- target scenario
- asset type
- key evidence or proof requirement
- owner
- due date or target timing
- desired CTA or next step

Engineering should treat this as a hard gate. If these fields are missing, the item is still in triage, not drafting.

### Opportunity prioritization factors

Engineering should support a visible prioritization input set. It does not need to be a numeric score in v1, but the fields must be present and sortable/filterable.

Priority factors:

- scenario alignment: does it support one of the four active demand scenarios
- urgency: does it matter this week because of demand, reputation, or launch timing
- proof readiness: do we already have evidence to support the content credibly
- effort to first useful output: can the team move it this week
- distribution potential: can it plausibly produce a real placement, share, or mention
- trust or revenue impact: does it reduce a major objection or support a high-value intent

Recommended priority labels:

- `high`: should be considered in the current weekly plan
- `medium`: keep visible but not committed this week
- `low`: parked unless capacity opens

### AIT-4 reporting fields

The intake workflow should make these metrics possible from day one:

- date captured
- date triaged
- current owner
- current state
- priority scenario
- priority label
- rejected yes or no
- rejection reason

This is the minimum needed to track opportunity volume and triage SLA.

## AIT-5 Draft Workspace And Review Requirements

### Draft states

Use these states exactly:

- `not_started`: opportunity approved but no active draft yet
- `drafting`: asset is being written or assembled
- `review_needed`: ready for CMO review
- `ready_for_distribution`: approved and assignable
- `published_or_placed`: live or externally placed

### Required draft fields

Every draft must store:

- linked opportunity
- title
- asset type
- owner
- due date
- target scenario
- target audience and question
- key evidence or proof requirement
- desired CTA or next step
- current state

### Draft review rules

- The first release assumes CMO review is required before distribution.
- A draft can move to `review_needed` only when the content exists in a form another reviewer can assess.
- A draft can move to `ready_for_distribution` only after explicit approval.
- Drafts should not skip directly from `drafting` to `ready_for_distribution`.

### Draft prioritization factors

The draft queue should allow operators to sort by:

- due date
- weekly priority label inherited from the opportunity
- scenario coverage need
- blocker status
- readiness for review

### Distribution-readiness gate

A draft is `ready_for_distribution` only when:

- the core asset is approved
- factual support or proof references are present
- the intended audience and message are clear
- the next distribution action is known
- owner accountability is clear

If the draft is approved but no next distribution action is known, it should remain visible as review-complete but not distribution-ready. If engineering needs only one state in v1, store an operator note explaining the missing distribution plan and keep the item out of assignment creation.

### AIT-5 reporting fields

The draft workflow should make these metrics possible:

- date draft created
- date moved to review
- date approved for distribution
- current owner
- current state
- linked scenario
- blocker note

This supports draft movement counts and opportunity-to-draft cycle time.

## AIT-6 Distribution Coordination Requirements

### Distribution task states

Use these states exactly:

- `assigned`: owner and target are named
- `in_progress`: task is actively being worked
- `done`: the requested placement, share, post, or outreach happened
- `blocked`: cannot complete without approval, asset, or access

### Required distribution task fields

Every distribution task must store:

- linked draft or approved mention opportunity
- asset or opportunity being distributed
- target account, employee, publication, or outreach target
- requested action
- owner
- due date
- approval or compliance note
- current state

### Distribution creation rules

Only create a distribution task when:

- the underlying draft is approved for distribution, or
- the mention opportunity itself has been explicitly qualified as ready for outreach

Do not create generic channel plans or placeholder tasks such as "promote on social." Each task must be concrete enough for one owner to complete inside the week.

### Distribution readiness rules

An item is ready for coordination only when:

- the content or message to distribute is fixed enough that the assignee does not need strategic clarification
- the target destination is named
- the requested action is explicit
- any approval or compliance note is attached
- the owner and due date are assigned

If account access or approval is missing, the task should exist as `blocked`, not remain hidden in notes.

### AIT-6 reporting fields

The distribution workflow should make these metrics possible:

- task created date
- due date
- completion date
- owner
- target account or outlet
- current state
- blocked yes or no
- blocker note

This is the minimum needed for weekly distribution completion rate and participation tracking.

## Cross-Workflow Notes

### Operator notes

Each object should support a lightweight operator note field. This is needed for:

- context that does not belong in the title
- blocker explanation
- approval or compliance caveats
- why an item was deprioritized

### Scenario coverage

All three object types should keep the linked priority scenario visible. The team needs to review whether each weekly cycle touched the four active scenarios without reconstructing it manually.

### Ownership

Every active object needs one named owner. Shared ownership should not be modeled in v1.

### Time discipline

The workflow must preserve enough timestamps to answer:

- how long opportunities sit before triage
- how long qualified opportunities take to reach draft-ready
- how long drafts take to reach distribution-ready
- how many distribution tasks finish in the planned week

## Explicit Non-Goals For V1

The first slice does not need:

- auto-scoring or complex weighted ranking
- multi-step approval chains beyond CMO review
- channel-specific strategy models
- automated publishing
- performance attribution beyond basic operational reporting
- support for more than the current four priority scenarios

## Handoff To Engineering

Engineering should use this document as the default rules reference for:

- [AIT-4](/issues/AIT-4) opportunity intake and triage workflow
- [AIT-5](/issues/AIT-5) draft workspace and review lifecycle
- [AIT-6](/issues/AIT-6) distribution coordination workflow

If implementation pressure forces scope cuts, preserve:

1. explicit states
2. required gating fields
3. owner and timestamp tracking
4. scenario linkage
5. concrete distribution-task structure

Those five items are the minimum needed to avoid product behavior drifting away from content-ops reality.
