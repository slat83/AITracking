# AIT-70 Flowvory Pilot Onboarding And Customer Clarity Plan

Owner: UX Designer
Date: 2026-05-10
Related issues: [AIT-70](/issues/AIT-70), [AIT-64](/issues/AIT-64), [AIT-65](/issues/AIT-65), [AIT-66](/issues/AIT-66)

## Purpose

This plan defines the minimum customer-facing UX posture Flowvory needs for a founder-led pilot launch aimed at founder-led or lean eCommerce brands.

It covers:

- the first-run onboarding and first-value path
- the terminology and information architecture changes required to make the product read as Flowvory rather than an internal operator shell
- the minimum trust and clarity requirements for pilot sales
- the decisions that still need CEO confirmation

## Current UX Readout

The current repo is still structurally useful, but customer-facing language is materially out of sync with the pilot offer.

Key issues observed on 2026-05-10:

- [src/app/page.tsx](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/src/app/page.tsx) still presents `Content Ops Visibility`, vehicle-history content, and an operator-oriented call to action.
- [src/lib/site.ts](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/src/lib/site.ts) still describes a VIN-check content product, not Flowvory for eCommerce.
- [src/app/sign-in/page.tsx](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/src/app/sign-in/page.tsx) tells the user to use seeded admin credentials from `.env`, which is acceptable for internal setup and unacceptable for customer onboarding.
- [src/app/app/page.tsx](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/src/app/app/page.tsx) is intentionally designed as an operator cockpit. That is a reasonable internal foundation, but not a suitable first impression for a founder buying an AI Visibility Audit.
- [src/components/app-shell-nav.tsx](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/src/components/app-shell-nav.tsx) exposes internal nouns such as `Evidence`, `Playbooks`, and `Templates` before the product has earned the user's understanding of them.

Conclusion:

Flowvory should not expose its internal operating model as the default product story. The pilot customer is not buying a generic workflow shell. They are buying a clear diagnostic outcome: an AI Visibility Audit and a practical 30-day action plan.

## Primary UX Goal

The product should answer one question immediately:

`How does a founder go from interest to a useful audit outcome with minimal confusion?`

That means the first customer-facing flow should optimize for:

- clarity over system breadth
- guided setup over tool exploration
- outcome framing over workflow terminology
- founder confidence over internal feature exposure

## Recommended First-Value Journey

### Customer promise

Flowvory should present one simple first-value promise:

`We assess how visible your brand is across AI-driven discovery, identify the highest-risk gaps, and deliver a 30-day action plan you can use immediately.`

### End-to-end founder-led pilot path

1. Marketing entry

- The homepage and offer page explain one offer: `AI Visibility Audit for eCommerce`.
- Primary CTA: `Book audit intro` or `Request audit`.
- Secondary CTA: `See sample deliverable`.

2. Qualification and intake

- Founder submits brand URL, category, revenue band, top competitors, and the main growth question they want answered.
- The form sets expectations for scope, turnaround time, and what the customer receives.
- This should feel like starting a diagnostic, not registering for a generic SaaS workspace.

3. Founder review and acceptance

- Flowvory reviews the request manually, confirms fit, and sends a pilot acceptance plus kickoff note.
- This preserves the founder-led sales motion and prevents low-fit self-serve signups from entering the product shell.

4. Invite-based workspace access

- The customer receives an invite into a workspace that already has their brand context preloaded.
- The first screen should be an onboarding checklist, not the operator cockpit.

5. Guided onboarding

- Step 1: confirm brand basics
- Step 2: confirm priority surfaces such as category pages, product pages, help center, editorial content, and trust pages
- Step 3: name top competitors or substitutes
- Step 4: choose the primary business question
- Step 5: review what Flowvory will analyze next

6. In-progress audit workspace

- The customer sees a simple progress view with:
  - audit status
  - submitted inputs
  - expected delivery date
  - requested follow-ups
  - a place for founder notes or clarifications

7. First value moment

- The first value moment is not "seeing the dashboard."
- The first value moment is receiving a concise baseline readout:
  - where AI visibility is weak
  - where trust or content gaps are most likely suppressing discovery
  - what the top three actions are for the next 30 days

8. Audit delivery and action plan handoff

- Deliver the output inside the workspace and optionally in a founder-friendly PDF or deck.
- The workspace then becomes the shared source of truth for implementation follow-up.

## Recommended First-Run App Structure

The first customer-facing app should open on a guided audit workspace with four sections:

### 1. Overview

- current audit status
- expected milestone dates
- primary business question
- top focus surfaces
- next required action

### 2. Inputs

- submitted brand details
- competitor set
- owned surfaces under review
- pending requests from Flowvory

### 3. Findings

- key observations
- visibility risks
- trust and conversion gaps
- supporting screenshots or evidence

### 4. Action Plan

- prioritized recommendations
- 30-day plan
- owner suggestions
- implementation notes

This is the right customer-facing wrapper around the existing internal system. The current internal modules can remain underneath, but the customer should not land directly inside them.

## Information Architecture And Language Simplification

### Core rule

Customer-facing surfaces should use buyer language first. Internal workflow nouns should stay hidden or be translated.

### Replace or avoid on customer-facing surfaces

- `Operator app` -> `Client workspace` or `Audit workspace`
- `Operator cockpit` -> `Audit overview`
- `Scenario` -> `Audit`, `Opportunity`, or `Growth question` depending on context
- `Evidence` -> `Supporting findings`
- `Playbooks` -> `Recommendations` or `Methods`
- `Templates` -> `Deliverables` or keep internal-only
- `Reporting` -> `Results`
- `Settings` -> `Workspace settings`

### Recommended top-level customer navigation

- `Overview`
- `Inputs`
- `Findings`
- `Action Plan`
- `Messages`
- `Settings`

### Recommended public-site navigation

- `AI Visibility Audit`
- `Who It's For`
- `Sample Deliverable`
- `Method`
- `Trust`
- `Book Intro`

### Language rules

- Lead with `AI Visibility Audit for eCommerce`, not broad platform language.
- Explain `AI visibility` in plain language every time it appears on public pages.
- Avoid stacking multiple abstract claims such as GEO, structured data, conversion systems, and demand capture in the same headline.
- Name the deliverable before naming the method.
- Use `founder`, `brand`, `store`, `product pages`, `category pages`, and `trust signals` more often than internal workflow nouns.

## Minimum Trust And Clarity Requirements Before Pilot Sales

These are the minimum UX requirements for founder-led pilot selling. Anything below this threshold creates avoidable confusion and trust risk.

### Public-site requirements

1. One visible offer page for the paid audit
2. Clear explanation of who the offer is for and who it is not for
3. Sample deliverable or redacted example output
4. Clear scope, timeline, and expected outcome
5. Founder or team credibility section
6. Trust surface with contact, privacy, and terms
7. Straightforward CTA path with no ambiguous "platform" framing

### Sign-in and access requirements

1. Remove all seeded-admin and `.env` setup language from customer-facing routes
2. Use invite-based access rather than open registration
3. Explain why the user is being invited and what they will see after entry
4. Provide a recovery or support path when login fails

### Workspace requirements

1. Show status and next step immediately on first load
2. Avoid exposing empty internal modules before findings exist
3. Make every visible section answer a concrete customer question
4. Show when Flowvory is waiting on the founder and when the founder is waiting on Flowvory
5. Make outputs exportable or easily shareable with the founder's team

## What Should Stay Internal For Now

The following can remain internal or hidden during the pilot:

- full operator navigation
- reusable playbook management
- template libraries
- detailed workflow states and proof-readiness labels
- internal evidence taxonomies
- admin-oriented reporting views

Customers do not need to understand Flowvory's internal operating system to believe in the audit outcome.

## Recommended Delivery Sequence

### Phase 1: Message correction

- Replace old `Content Ops Visibility` and VIN-specific public language
- Update site metadata and public navigation
- Publish the audit offer, sample output, and trust pages

### Phase 2: Pilot entry and access

- Convert sign-in from internal setup copy to invite-based customer access
- Add a founder-facing intake and acceptance flow
- Create a customer-safe first screen for the workspace

### Phase 3: Audit workspace framing

- Wrap the existing internal app model in the customer-facing IA above
- Hide or relabel internal workflow nouns on pilot routes
- Make findings and action-plan delivery the center of the experience

### Phase 4: Post-audit expansion

- Add implementation follow-up workflows only after the audit experience is clear and credible
- Expand into deeper reporting or recurring advisory views only when customers need them

## CEO Decisions Needed

These decisions should be confirmed explicitly so design and engineering do not build against a moving target.

1. Final CTA posture

- choose one primary CTA for launch: `Book audit intro` vs `Request audit`
- recommendation: `Request audit` if the workflow starts with a structured intake, `Book audit intro` if founder conversation must always happen first

2. Offer packaging

- confirm whether the pilot offer is always paid from day one or whether a limited design-partner variant exists
- this affects public pricing language, qualification friction, and trust copy

3. Deliverable format

- confirm whether the audit output is primarily a workspace experience, a slide deck/PDF, or both
- recommendation: both, with the workspace as the live source of truth and a concise export for stakeholder sharing

4. Proof posture

- confirm what proof can be shown publicly at launch: sample deliverable, redacted pilot output, founder credentials, or named examples
- this determines whether the trust surface can be strong enough for founder-led outbound

5. Pilot acceptance criteria

- confirm which brands qualify for the pilot and which should be excluded
- recommendation: founder-led or lean eCommerce brands with enough volume to care about discoverability, but without enterprise procurement complexity

## Recommended Near-Term Product Tickets

1. Replace public brand and metadata remnants that still describe the old VIN/content-ops product.
2. Design the audit offer page, trust page, and sample deliverable path.
3. Replace seeded-admin sign-in copy with invite-only customer onboarding language.
4. Create a founder-facing first-run workspace shell with `Overview`, `Inputs`, `Findings`, and `Action Plan`.
5. Hide or relabel internal operator terminology on pilot-facing routes.

## Final Recommendation

Flowvory should launch the pilot as a guided diagnostic experience, not as an exposed internal workflow platform.

The right UX posture is:

- one clear offer
- one guided intake path
- one invite-based workspace
- one obvious first value moment
- one credible trust surface

If those five things are present, the current product foundation is good enough to support founder-led pilot selling. If they are absent, the app will continue to read like an internal operating shell wearing new branding.
