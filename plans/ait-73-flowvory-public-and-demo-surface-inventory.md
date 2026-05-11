# AIT-73 Flowvory Public And Demo Surface Inventory

Owner: CMO
Date: 2026-05-10
Related issues: [AIT-73](/issues/AIT-73), [AIT-74](/issues/AIT-74), [AIT-68](/issues/AIT-68), [AIT-69](/issues/AIT-69), [AIT-70](/issues/AIT-70)

## Purpose

This document turns the approved Flowvory pilot positioning into an implementation-ready inventory for engineering.

It answers three questions:

1. Which public and demo-facing surfaces still undermine the Flowvory story?
2. What should each surface say instead?
3. Which surfaces must be rewritten before pilot selling, and which should be hidden or deferred?

## Positioning Anchor

Use this as the source of truth for replacement messaging:

- Offer: `AI Visibility Audit for eCommerce`
- Buyer: founder-led or lean eCommerce brands
- Promise: Flowvory finds where a brand is weak or invisible in AI-driven buying journeys and delivers a prioritized 30-day action plan
- Delivery motion: founder-led, fixed-scope, manually sold diagnostic
- Do not sell first: a VIN-check product, a generic content-ops foundation, a broad GEO platform, or a self-serve SaaS

## Current Readout

The live repo still exposes three conflicting stories at once:

- `Content Ops Foundation` and `Content Ops Visibility` as the product identity
- EpicVIN and vehicle-history pages as the public content corpus
- an internal operator shell as the nearest demo path

That contradiction appears in the exact surfaces a prospect is most likely to hit first:

- homepage in [src/app/page.tsx](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/src/app/page.tsx)
- shared public page chrome in [src/components/ai-visibility-page.tsx](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/src/components/ai-visibility-page.tsx)
- site metadata in [src/lib/site.ts](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/src/lib/site.ts)
- all public route records in [src/content/ai-visibility.ts](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/src/content/ai-visibility.ts)
- sign-in in [src/app/sign-in/page.tsx](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/src/app/sign-in/page.tsx)
- app landing in [src/app/app/page.tsx](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/src/app/app/page.tsx)

## Recommended Public IA

Before pilot selling, Flowvory should expose one coherent public path:

- `AI Visibility Audit`
- `Who It's For`
- `Sample Deliverable`
- `Method`
- `Trust`
- `Book Intro`

There is no good reason to keep vehicle-history comparison and pricing routes as active public entry points during the pilot-saleability phase.

## Replacement Inventory

### P0: Must change before pilot selling or founder demos

| Surface | Current residue | Required replacement | Recommended action |
| --- | --- | --- | --- |
| `/` in `src/app/page.tsx` | `Content Ops Visibility`, vehicle-history demand clusters, `Inspect page templates` CTA | Sell one offer: `AI Visibility Audit for eCommerce`, explain the buyer, audit scope, 2-week delivery, and founder-led CTA | Rewrite |
| Global site identity in `src/lib/site.ts` and `src/app/layout.tsx` | `Content Ops Foundation`, `content-ops.example.com`, VIN-check metadata | Rename to Flowvory, set Flowvory default metadata, describe AI visibility audit for eCommerce | Rewrite |
| Shared public header in `src/components/ai-visibility-page.tsx` | `Content Ops Visibility`, nav to compare/trust/pricing/FAQ vehicle-history routes, `Operator app` link | Flowvory brand, public nav built around audit/trust/sample/method/booking, no operator-first CTA | Rewrite |
| `/trust` in `src/content/ai-visibility.ts` | Trust hub framed around validating vehicle-history pages | Reframe as Flowvory trust center: company identity, contact path, privacy, terms, founder-led working model, delivery expectations | Rewrite |
| `/methodology` | VIN comparison methodology | Replace with audit method: what Flowvory reviews, what inputs it uses, what the output includes, and what it does not promise | Rewrite |
| `/reports/sample-vehicle-history-report` | Sample vehicle history report | Replace with `Sample deliverable` or `Sample audit` page showing a redacted audit structure | Rewrite |
| `/sign-in` | seeded admin credentials from `.env` | Invite-only client or operator access language with a support path and no local setup copy | Rewrite |
| `/app` landing if used in demos | `Operator cockpit`, `scenario-first CRM`, internal workflow nouns | Either add a customer-safe audit overview wrapper or avoid this route in demos until it exists | Rewrite or hide from demos |

### P1: Rewrite if kept public; otherwise hide or remove from crawl paths

| Surface | Current residue | Required replacement | Recommended action |
| --- | --- | --- | --- |
| `/help/faq` | FAQ hub supporting vehicle-history trust/pricing/comparison content | Audit FAQ: scope, timing, inputs, access, deliverables, implementation follow-up | Rewrite if public |
| `/authors/editorial-team` | editorial author page for SEO content system | Replace with founder/team credibility page only if it adds trust; otherwise remove from public nav and crawl emphasis | Hide or rewrite |
| `/trust/billing-and-refunds` | support page for VIN-history purchase concerns | Replace with pilot billing and refund expectations only if policy is real and approved | Rewrite if policy exists |
| `/trust/data-sources` | vehicle report data-source guidance | Replace with `What Flowvory reviews` or merge into Method page; do not publish a fake data-source analog | Merge or remove |

### P2: Do not rewrite now; quarantine the legacy corpus

These routes are not needed for the first sale and actively confuse the pitch:

- `/compare/best-vin-decoder`
- `/trust/is-epicvin-legit`
- `/compare/epicvin-vs-carfax`
- `/pricing/cheap-vin-check`
- `/pricing/free-vs-paid-vin-check`
- `/compare/carfax-alternatives`

Recommended disposition:

- remove them from homepage and shared nav
- remove them from priority sitemap treatment
- either noindex them, 404 them, or keep them unreachable until Flowvory replacements exist

The important decision is not which exact fallback is prettiest. The important decision is that prospects should not land on vehicle-history pages during pilot selling.

## Demo-Surface Guidance

There is no dedicated customer demo route yet. In practice, the current demo path is:

1. public homepage
2. sign-in
3. authenticated app landing

That means the demo-critical changes are:

- stop promising a generic content or SEO system on the homepage
- stop exposing `.env` and seeded-admin language on sign-in
- stop leading demos with internal nouns like `Operator cockpit`, `Evidence`, `Playbooks`, and `Templates`

If engineering cannot build a customer-safe workspace wrapper immediately, founder demos should stop at the public site plus sample deliverable until the wrapper exists.

## Recommended Messaging By Surface

### Homepage hero

- Headline: `Find where your brand is missing from AI-driven buying journeys.`
- Subhead: `Flowvory runs a founder-led AI Visibility Audit for eCommerce brands and delivers a prioritized 30-day action plan covering discovery gaps, trust weaknesses, and the fixes that matter first.`
- Primary CTA: `Book an AI visibility audit`
- Secondary CTA: `See a sample audit`

### Trust page

The trust page should answer:

- who Flowvory is
- who the audit is for
- what happens after a brand requests an audit
- how access, billing, privacy, and support work
- what Flowvory does not claim or guarantee

### Method page

The method page should explain:

- the surfaces reviewed: category, PDP, editorial, help, and trust
- the query and competitor review lens
- how findings are prioritized
- what the client receives in the 30-day plan
- non-promises: no ranking guarantees, no automatic implementation included

### Sample deliverable page

Show a redacted structure, not invented outcomes:

- executive summary
- visibility findings
- trust and conversion risks
- top actions for the next 30 days
- owner and effort guidance

## Safe Claims And Open Questions

### Safe claims now

- founder-led audit
- fixed-scope paid diagnostic
- built for founder-led or lean eCommerce brands
- review across AI discovery, trust, and priority commerce surfaces
- prioritized 30-day action plan

### Claims to avoid until stronger proof exists

- guaranteed visibility lifts
- broad `AI growth system` positioning
- self-serve product implications
- testimonials, ratings, or proof claims that are not visibly supported
- detailed refund promises if policy is not yet finalized

### Questions engineering should not answer with invented copy

- final booking flow destination
- exact pricing display
- refund language if money-back terms are undecided
- founder bio or credibility claims that need human confirmation

If those decisions are unresolved at implementation time, use narrower placeholder language rather than fabricated specificity.

## Engineering Handoff Sequence For AIT-74

1. Replace global Flowvory identity and homepage first.
2. Replace trust, method, and sample-deliverable surfaces second.
3. Fix sign-in and the first authenticated impression third.
4. Remove vehicle-history routes from navigation and crawl priority immediately.
5. Only rewrite secondary FAQ or support routes if they support a real pilot-selling need.

This is the lowest-effort path to a coherent pilot story.

## Non-Blocking Residue Outside This Ticket

These items still reflect the old thesis but are not launch blockers for market-facing credibility:

- `README.md`
- `src/app/api/health/route.ts`
- seed data and tests containing EpicVIN examples

They should be cleaned up later, but they should not hold up the public-surface convergence in [AIT-74](/issues/AIT-74).
