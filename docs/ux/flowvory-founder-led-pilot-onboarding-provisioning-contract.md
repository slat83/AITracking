# Flowvory Founder-Led Pilot Onboarding And Provisioning Contract

Owner: UX Designer
Date: 2026-05-10
Related issues: [AIT-72](/issues/AIT-72), [AIT-75](/issues/AIT-75), [AIT-70](/issues/AIT-70), [AIT-69](/issues/AIT-69)

## Purpose

This document turns the pilot onboarding strategy from [plans/ait-70-flowvory-pilot-onboarding-and-customer-clarity-plan.md](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/plans/ait-70-flowvory-pilot-onboarding-and-customer-clarity-plan.md) into an engineering-ready workflow contract.

It defines:

- the founder happy path from request to delivered audit
- the minimum exception paths required for pilot operations
- the customer-facing screens and states that should exist
- the internal operator handoffs that can remain manual in v1
- the implementation boundaries needed to unblock [AIT-75](/issues/AIT-75)

## Product Frame

Flowvory is not offering self-serve SaaS in this slice.

The v1 promise is:

`A founder-led AI Visibility Audit for lean eCommerce brands, delivered through an invite-only workspace with visible status and a practical 30-day action plan.`

That means the system should optimize for:

- invite-only access, not open registration
- guided onboarding, not free exploration
- explicit service milestones, not fake automation
- visible next steps, not hidden operator work

## Users And Roles

### External roles

- `Founder contact`: main buyer and decision-maker
- `Collaborator`: optional teammate invited after kickoff

### Internal roles

- `Operator`: Flowvory owner managing intake, provisioning, and audit progress
- `Founder reviewer`: internal founder deciding fit, scope, and acceptance when needed

## Service Lifecycle

The pilot lifecycle should use simple service states that both customers and operators can understand.

| State | Customer label | Meaning | Manual or automated in v1 |
| --- | --- | --- | --- |
| `lead_submitted` | Request received | Intake form submitted, not yet reviewed | automated capture |
| `fit_review` | Reviewing fit | Flowvory is deciding whether to accept the pilot | manual |
| `accepted_pending_invite` | Accepted | Pilot accepted, workspace being prepared | manual |
| `invite_sent` | Invite sent | Founder can access the workspace | automated send plus manual monitoring |
| `onboarding_in_progress` | Completing onboarding | Founder is confirming inputs | customer-driven |
| `ready_for_audit` | Audit queued | Required inputs are present | automated transition or operator mark |
| `audit_in_progress` | Audit in progress | Flowvory is completing analysis | manual |
| `waiting_on_founder` | Waiting on you | Flowvory needs an answer or missing input | manual trigger |
| `delivery_ready` | Results ready | Findings and plan are prepared for delivery | manual |
| `delivered` | Delivered | Founder can review findings and action plan | manual publish |
| `follow_up` | Next-step support | Post-audit clarifications or implementation follow-up | manual |
| `declined` | Not a fit | Pilot request rejected | manual |
| `paused` | Paused | Engagement is temporarily on hold | manual |

## Happy Path

### 1. Public request

The founder enters through a public CTA such as `Request audit`.

Required intake fields:

- brand name
- brand website URL
- contact name
- contact work email
- role
- store platform, if known
- product category
- monthly revenue band
- target geography
- top competitors or substitutes
- primary business question
- notes about urgency, launch, or seasonal context

Submission success state:

- confirms receipt
- explains review timing
- explains that access is invite-only after acceptance

### 2. Internal fit review

Operator reviews the request and chooses one of three outcomes:

- accept the pilot
- request clarification
- decline as low fit

Minimum operator review fields:

- ideal customer profile fit
- offer fit
- timing risk
- proof or credibility risk
- decision notes

### 3. Workspace creation and invite

If accepted, the operator creates a workspace seeded with the intake details.

Provisioning steps that may remain manual in v1:

- create workspace record
- attach founder contact as primary user
- preload brand profile and audit question
- set target delivery date
- send invite email

The founder should never create the workspace themselves in v1.

### 4. First login and onboarding checklist

After sign-in, the founder lands on an onboarding checklist, not the operator cockpit.

Checklist sections:

- confirm brand basics
- confirm priority surfaces
- confirm competitor set
- confirm business question
- add supporting context
- review what Flowvory will analyze

Completion rule:

- required checklist items must be complete before the audit state moves to `ready_for_audit`

### 5. Audit progress workspace

Once onboarding is complete, the workspace becomes a status and collaboration surface.

The first screen must answer:

- what stage is the audit in
- what date should the founder expect next
- what Flowvory is doing now
- whether Flowvory is waiting on the founder
- where findings will appear

### 6. Delivery

When the audit is ready, Flowvory publishes:

- summary of visibility weaknesses
- summary of trust or conversion gaps
- top three recommended actions
- 30-day action plan
- supporting evidence links or screenshots

Delivery may be mirrored as a PDF or deck, but the workspace remains the system of record.

### 7. Follow-up

After delivery, the founder can:

- review findings
- ask clarifying questions
- share outputs with teammates
- continue into a manual follow-up engagement

## Required Exception Paths

### Low-fit or declined request

Trigger:

- brand is outside the target segment
- budget or timeline is incompatible
- request is too vague to scope

System behavior:

- store the request and decision note
- mark status as `declined`
- send a founder-friendly decline or redirect message

### Clarification needed before acceptance

Trigger:

- missing URL, business question, or competitor context

System behavior:

- keep status in `fit_review`
- record requested clarification
- allow operator to resend or reopen the request

### Invite expired or login issue

Trigger:

- founder cannot access the workspace

System behavior:

- show support path on sign-in
- allow operator to resend invite
- do not expose seeded-admin instructions on any customer route

### Incomplete onboarding

Trigger:

- founder stops before checklist completion

System behavior:

- preserve partial progress
- show exactly what remains
- allow operator to see incomplete sections

### Waiting on founder during audit

Trigger:

- Flowvory needs extra URLs, analytics context, or commercial clarification

System behavior:

- move service state to `waiting_on_founder`
- show a visible request list with due date if used
- return to `audit_in_progress` after response

### Paused engagement

Trigger:

- founder delay, internal resourcing issue, or mutual agreement to pause

System behavior:

- mark status as `paused`
- record pause reason
- show who needs to act before work resumes

## Customer-Facing Information Architecture

The pilot workspace should expose these sections only:

- `Overview`
- `Inputs`
- `Findings`
- `Action Plan`
- `Messages`
- `Settings`

Do not expose `Evidence`, `Playbooks`, `Templates`, or operator workflow language as first-run customer navigation.

## Screen Contract

### 1. Public audit request page

Primary job:

- start the pilot request with clear expectations

Required content:

- who the audit is for
- what the founder receives
- timeline expectation
- invite-only explanation
- primary CTA

### 2. Request submitted state

Primary job:

- confirm success and explain next step

Required elements:

- success message
- expected review window
- support contact or reply path

### 3. Invite-based sign-in page

Primary job:

- let accepted founders access their workspace

Required elements:

- invitation framing
- email and password or magic-link path, depending on implementation
- support path for failed access

Forbidden content:

- seeded credentials
- `.env`
- internal setup instructions

### 4. Onboarding checklist page

Primary job:

- collect the minimum inputs required to start the audit confidently

Required sections and fields:

- brand basics
  - brand name
  - website
  - store platform
  - target geography
- priority surfaces
  - category pages
  - product pages
  - help center
  - blog or editorial content
  - trust pages
- competitor set
  - top competitors
  - substitutes
- business question
  - primary question
  - current growth concern
- supporting context
  - launches or promotions
  - channel constraints
  - extra notes

Required states:

- not started
- in progress
- complete
- needs update

### 5. Overview page

Primary job:

- orient the founder in under one minute

Required modules:

- current audit stage
- next milestone date
- primary business question
- top focus surfaces
- current required action
- recent updates timeline

### 6. Inputs page

Primary job:

- show what Flowvory is using as source input

Required modules:

- brand profile
- owned surfaces
- competitor set
- pending requests from Flowvory
- submitted notes

### 7. Findings page

Primary job:

- publish the diagnostic readout

Required modules:

- key observations
- visibility risks
- trust or conversion gaps
- evidence attachments
- confidence or completeness note when the audit is still partial

### 8. Action Plan page

Primary job:

- convert findings into action

Required modules:

- top priorities
- 30-day actions
- suggested owner
- implementation notes
- optional export action

### 9. Messages page

Primary job:

- hold simple founder-operator coordination

Required behavior:

- visible questions from Flowvory
- visible founder replies
- timestamped thread

If real messaging is deferred, this may initially render as a structured updates log plus support contact path.

### 10. Settings page

Primary job:

- manage workspace basics safely

Required modules:

- workspace name
- primary contact
- collaborator invites
- notification preference

## Operator Workflow Contract

The internal provisioning workflow for [AIT-75](/issues/AIT-75) should support these actions:

1. Review a submitted pilot request.
2. Accept, request clarification, or decline it.
3. Create a workspace from accepted intake data.
4. Add the founder as primary contact.
5. Send or resend invite.
6. Set milestone dates and current service state.
7. Record manual requests for more input.
8. Publish findings and the 30-day action plan.
9. Mark the engagement paused, delivered, or in follow-up.

These actions can live behind operator-only routes or admin controls. They do not need polished customer-facing UI in the same heartbeat as founder-facing screens.

## Mapping To Current App Surface

The current app already has a usable authenticated shell in [src/app/app/page.tsx](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/src/app/app/page.tsx) and navigation in [src/components/app-shell-nav.tsx](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/src/components/app-shell-nav.tsx).

For the pilot slice:

- the sign-in surface in [src/app/sign-in/page.tsx](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/src/app/sign-in/page.tsx) should become invite-oriented
- the default post-login landing route should become a founder-safe overview or onboarding checklist
- the existing operator shell can remain underneath for internal use
- customer-facing labels should be translated before reuse

This avoids a greenfield rebuild while still preventing the current operator cockpit from becoming the first founder impression.

## Minimum Engineering Acceptance Criteria

[AIT-75](/issues/AIT-75) should treat this contract as satisfied when:

1. An accepted pilot can be provisioned without direct database edits.
2. A founder can receive invite-based access to a pre-created workspace.
3. The founder sees onboarding and status, not operator-first internals, on first login.
4. The system distinguishes `waiting_on_founder` from `audit_in_progress`.
5. Findings and action plan outputs have a clear publishing location.
6. Manual v1 steps are represented honestly in state and UI rather than hidden behind false automation.

## Explicitly Deferred

The following are intentionally out of scope for this contract:

- self-serve signup
- automated billing
- deep permissions matrices
- polished real-time chat
- generalized multi-product onboarding
- exposing the full operator taxonomy to pilot customers

## Decision Summary

This contract commits Flowvory to a guided service workflow:

- manual review before acceptance
- operator-created workspaces
- invite-only customer access
- checklist-based onboarding
- visible audit milestones
- delivered findings and action plan inside the workspace

That is the narrowest UX slice that still supports a real founder-led pilot sale.
