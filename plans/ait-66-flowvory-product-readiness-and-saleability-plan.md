# AIT-66 Flowvory Product Readiness And Technical Saleability Plan

Owner: CTO
Date: 2026-05-10
Related issues: [AIT-66](/issues/AIT-66), [AIT-64](/issues/AIT-64), [AIT-36](/issues/AIT-36), [AIT-47](/issues/AIT-47)

## Purpose

This document assesses the gap between the current `flowvory.com` approach and a product state that can be sold credibly to normal customers.

The scope is product readiness, technical saleability, operating dependencies, and recommended sequencing. It is not an implementation ticket.

## Executive Readout

Flowvory is not yet in a normally saleable product state.

The current assets prove there is a usable internal workflow foundation:

- the repository contains a substantial authenticated Next.js application with Prisma-backed workflow, reporting, analytics capture, and deployment runbooks
- `npm run test`, `npm run lint`, and `npm run build` pass locally on 2026-05-10
- the app already has meaningful internal surfaces for opportunities, scenarios, playbooks, evidence, reporting, and settings

However, the external product and the internal system are still disconnected in ways that make a normal sale risky:

- the live domain is still a Netlify-hosted static marketing app, while the repo's supported production path is a private VPS-hosted Next.js app
- the repo homepage and seeded data are still materially branded and modeled around `Content Ops Visibility` and `EpicVIN`, not Flowvory
- authentication is operator-first, seeded-admin-first, and single-workspace by default rather than customer onboarding ready
- there is no visible payments, subscription, invoicing, customer provisioning, or self-serve commercial path
- there is no complete support, customer communication, or production observability layer for a paid SaaS product

Conclusion:

- this is a credible internal prototype and product foundation
- it is not yet a credible sellable product for standard outbound, self-serve, or even light-touch sales without founder-managed setup and expectation setting

## What Exists Today

### Live surface on 2026-05-10

Observed directly from `https://flowvory.com/` on 2026-05-10:

- homepage title is `Flowvory, AI Growth System and GEO for eCommerce`
- root, `/sign-in`, and `/app` all return `200` from a Netlify-served static site
- the live HTML is a client-rendered shell that loads a bundled JS asset rather than the repo's Next.js app

Implication:

- the market-facing product and the current engineering source of truth are not the same runtime
- any sale process will run into trust and demo friction because the buyer-facing domain does not clearly map to the product foundation being built in this repo

### Repo baseline on 2026-05-10

The repo contains a real application foundation:

- Next.js 16 app-router app with protected routes in [src/app](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/src/app)
- credentials auth in [src/server/auth/config.ts](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/src/server/auth/config.ts)
- scenario-centric workflow and reporting services in [src/server/scenarios](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/src/server/scenarios)
- typed schema and seeded workflow data in [prisma/schema.prisma](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/prisma/schema.prisma) and [prisma/seed.ts](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/prisma/seed.ts)
- deployment and ops documentation in [docs/runbooks](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/docs/runbooks)
- baseline health endpoint in [src/app/api/health/route.ts](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/src/app/api/health/route.ts)

This is enough to support an internal alpha or founder-operated pilot after repositioning, but not enough for normal product saleability.

## Main Readiness Gaps

### 1. Product identity and positioning are still split

The live site says Flowvory for eCommerce GEO. The repo still exposes:

- `Content Ops Visibility` on the public homepage in [src/app/page.tsx](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/src/app/page.tsx)
- `content-ops-foundation` from the health endpoint in [src/app/api/health/route.ts](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/src/app/api/health/route.ts)
- `EpicVIN` and vehicle-history-specific demand examples throughout [src/content/ai-visibility.ts](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/src/content/ai-visibility.ts) and [prisma/seed.ts](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/prisma/seed.ts)

Why this blocks saleability:

- prospects cannot tell what the actual product is
- demos will feel like a re-labeled internal framework rather than a coherent SaaS product
- commercial claims will outrun product truth unless the taxonomy and examples are repositioned first

### 2. Deployment reality is inconsistent

The repo explicitly says the supported production target is a private VPS, not Vercel, in [README.md](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/README.md), with supporting runbooks in [docs/runbooks](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/docs/runbooks).

The live domain is still serving a static Netlify app.

Why this blocks saleability:

- sales demos and production behavior can drift from the codebase under active development
- buyers cannot be given a stable answer on where the real product runs
- onboarding, auth, analytics, and operations are harder to trust when runtime ownership is ambiguous

### 3. The app is operator-authenticated, not customer-ready

Current auth and onboarding posture:

- credentials-only auth using local users in [src/server/auth/config.ts](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/src/server/auth/config.ts)
- sign-in copy explicitly tells the operator to use seeded admin credentials in [src/app/sign-in/page.tsx](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/src/app/sign-in/page.tsx)
- default workspace and account bootstrap in [prisma/seed.ts](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/prisma/seed.ts)

What is missing for saleability:

- invite-based customer provisioning
- password reset and account recovery
- organization creation and tenant boundaries
- customer-facing onboarding flow
- role model that matches paying customer teams rather than internal admin/editor/viewer assumptions

### 4. There is no commercial transaction layer

I found no implemented payment or subscription system in the application.

Missing:

- checkout
- subscriptions
- billing account management
- invoices and receipts
- plan entitlements
- trial management
- cancellation and downgrade flows

Why this matters:

- without a transaction model, the product is not saleable in a normal sense
- even for founder-led enterprise sales, lack of entitlement and billing plumbing makes delivery fragile and manual

### 5. The domain model is still a prototype mix of reusable core and old launch-specific examples

The scenario backbone work is real and useful, but the seeded examples remain old-launch-specific:

- vehicle-history demand clusters
- `EpicVIN` trust, pricing, comparison, and methodology proof examples

Why this matters:

- it signals that the product logic is still proving the architecture rather than representing the Flowvory commercial use case
- a buyer demo built on these examples will feel synthetic or unrelated unless heavily narrated by the founder

### 6. Support and customer operations are incomplete

The repo includes workflow concepts for reviews, evidence, reporting, and health checks, but not a full customer operations layer.

Missing or incomplete:

- support intake and ticketing path
- customer-facing help center and docs structure for the actual Flowvory product
- lifecycle emails and operational communications
- incident communication playbook for paying customers
- in-product admin tools for customer success workflows

### 7. Observability is only baseline

What exists:

- basic health route
- first-party visibility event capture
- job and reporting seams

What is missing for a paid product:

- error monitoring
- production alerting
- structured application telemetry
- audit coverage around customer account administration
- business KPI instrumentation for activation, retention, and conversion

### 8. UX is still internal-shell oriented

The app UI appears designed for informed internal operators:

- workspace
- playbooks
- evidence
- reporting
- taxonomy and execution-target settings

That is directionally good, but not sufficient for commercial use because:

- the first-run path is not simplified for a new customer
- the information architecture assumes understanding of scenario terminology and operating concepts
- there is no clear “time to first value” experience for a non-technical buyer

## Saleability Standard

Flowvory reaches a credible minimum saleable state when all of the following are true:

1. The live domain and production app are the same product.
2. The product story, seeded examples, and UI language are Flowvory-native.
3. A new customer can be provisioned without engineering touching the database manually.
4. Access, billing, and entitlement boundaries are real.
5. A pilot customer can onboard, complete the first workflow, and receive value without founder-only intervention at every step.
6. Production incidents and support requests can be detected, triaged, and answered reliably.

## Minimum Viable Technical Roadmap

### Phase 0: Decide the commercial motion

Goal:

- prevent engineering from building the wrong product shell

Required decision:

- is Flowvory being sold first as founder-led service software, as a managed pilot, or as a true self-serve SaaS

Recommendation:

- optimize for founder-led pilot saleability first, not self-serve SaaS

Reason:

- the current system is far closer to an operator-assisted pilot product than to a fully self-serve SaaS
- forcing self-serve too early will create more scope than the current foundation warrants

### Phase 1: Unify brand, product scope, and runtime

Goal:

- make the live domain truthfully represent the product in this repo

Deliverables:

- replace old homepage/product language with Flowvory-native positioning
- remove or quarantine `EpicVIN` and vehicle-history examples from market-facing routes and seeds
- deploy the actual Next.js app to the chosen production runtime
- route `flowvory.com` to that runtime
- confirm auth, metadata, analytics, and health checks on the production stack

Exit criteria:

- live site and product repo tell the same story
- a demo user can sign in to the real product running on the chosen production environment

### Phase 2: Make the product pilot-ready

Goal:

- support a small number of paying or design-partner customers without database handholding

Deliverables:

- org/workspace creation flow
- invite flow for additional users
- password reset and account recovery
- customer-facing first-run onboarding
- cleaned-up demo and seed data aligned to Flowvory
- basic customer support entrypoint

Exit criteria:

- one new customer workspace can be created, accessed, and used with no direct database edits

### Phase 3: Add the commercial control plane

Goal:

- support actual selling, entitlement, and account administration

Deliverables:

- billing provider integration
- subscription plans and entitlement checks
- account admin screens
- trial or pilot state handling
- basic invoice and cancellation handling

Exit criteria:

- a customer can become active through a defined commercial flow
- product access reflects payment state and plan rules

### Phase 4: Add production-grade reliability and measurement

Goal:

- make the product operable after the first sales close

Deliverables:

- error monitoring and alerting
- release and rollback checks tied to production
- KPI instrumentation for activation and retention
- customer support and incident response runbooks
- backup/restore validation in the real runtime

Exit criteria:

- the team can detect, diagnose, and communicate production problems without improvising

## Cross-Functional Dependencies

### UX

Needs to own:

- first-run onboarding flow
- information architecture for customer-facing setup
- vocabulary simplification and role naming
- pilot-customer experience review before launch

### CMO

Needs to own:

- final market category and promise for Flowvory
- homepage and product messaging
- proof assets, case-study strategy, and commercial claims
- how much of the offer is software versus managed service in the first sale motion

### Engineering

Needs to own:

- deployment convergence onto one production runtime
- tenant and account model hardening
- auth and provisioning flows
- billing integration
- observability and support tooling baseline

### CEO

Needs to own:

- pricing motion decision
- service-led versus SaaS-led launch posture
- tolerance for pilot-only manual work
- which customer segment is allowed in the first cohort

## Recommended Sequencing

Do not start with billing integration.

The correct order is:

1. choose the launch motion and target customer
2. converge the live product and codebase
3. reposition the product language and data model around Flowvory
4. make provisioning and onboarding real
5. add billing and entitlements
6. harden observability and support operations

Reason:

- charging for the product before the product identity, runtime, and onboarding are stable will amplify trust problems rather than reduce them

## Executive Decisions Needed Now

1. Approve that Flowvory should target founder-led pilot saleability first, not self-serve SaaS.
2. Decide whether the production source of truth will be this Next.js app on VPS or whether another runtime is still intended for the real product.
3. Approve a product repositioning pass that removes old `EpicVIN` launch artifacts from market-facing and demo-facing surfaces.
4. Decide whether billing is required before first revenue or whether invoiced pilot sales are acceptable for the first cohort.
5. Decide the first customer segment and use case that the seeded taxonomy should represent.

## Recommended Next Issues

### CTO / Engineering

- production convergence issue: move `flowvory.com` onto the real product runtime and verify production auth and health
- pilot provisioning issue: add org creation, invites, password reset, and onboarding
- commercial control issue: add subscription and entitlement baseline
- observability issue: add production monitoring, alerting, and incident response baseline

### UX

- design pilot onboarding and first-value path for a first customer workspace
- review current operator shell terminology and simplify customer-facing language

### CMO

- define Flowvory category, promise, and proof architecture for the first sales motion
- produce market-facing copy requirements and customer proof dependencies

## Assessment Summary

Flowvory is technically promising but commercially premature.

The strongest asset is the internal workflow foundation already present in the repo. The biggest risk is pretending that foundation is already a coherent sellable product when the market-facing site, runtime, positioning, provisioning, and commercial systems are still split.

The shortest path to saleability is not “add more features.” It is:

- converge the real product and the live domain
- decide the actual launch motion
- make the product customer-provisionable
- then add billing and reliability around that narrower first sale motion
