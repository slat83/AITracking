# AIT-236 Minimal Functional Application Surface

- Handoff title: Minimal functional application surface recommendation
- Related issue: [AIT-236](/issues/AIT-236)
- Owner: UX Designer
- Reviewer: CTO
- Status: accepted
- Last updated: 2026-05-13

## Outcome

Define the smallest coherent product surface that Flowvory can present and operate without pretending the current application is broader, more self-serve, or more mature than it is.

## Recommendation

Treat the current product as four connected surfaces:

1. Public trust and conversion surface
2. Invite and sign-in access surface
3. Founder workspace
4. Operator workspace

Everything else should either support one of those four surfaces directly or be demoted from primary navigation and positioning.

## Why This Is The Minimum

The repo already supports one narrow public story and two authenticated roles:

- The home page positions Flowvory as a fixed-scope, invite-only audit rather than a self-serve platform in [src/app/page.tsx](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/src/app/page.tsx).
- Invite acceptance and sign-in exist as explicit gates in [src/app/invite/[token]/page.tsx](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/src/app/invite/[token]/page.tsx) and [src/app/sign-in/page.tsx](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/src/app/sign-in/page.tsx).
- `/app` already branches into a founder workspace for `VIEWER` users and a scenario-first operator workspace for internal users in [src/app/app/page.tsx](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/src/app/app/page.tsx).

That means the minimum functional app is not "marketing plus many tools." It is "public explanation plus controlled access plus two role-specific workspaces."

## Recommended Surface Map

### 1. Public trust and conversion surface

Keep:

- `/`
- the sample-audit, methodology, trust, and FAQ pages already linked from home
- only public content that strengthens the same founder-led audit story

Rule:

- Public pages must answer one of three questions only: what this is, why it is trustworthy, and what the output looks like.

Do not treat public long-tail content as part of the core application surface. It is acquisition support, not product navigation.

### 2. Invite and sign-in access surface

Keep:

- `/invite/[token]`
- `/sign-in`

Rule:

- This surface should do only access activation and return access, not onboarding education, product discovery, or route branching beyond "enter workspace."

### 3. Founder workspace

Keep as the customer-facing product surface for accepted pilots:

- onboarding checklist
- workspace status and delivery timeline
- findings summary
- action plan
- billing and invoice visibility

Source:

- [src/components/founder-workspace.tsx](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/src/components/founder-workspace.tsx)

Rule:

- Founder users should experience Flowvory as one guided workspace, not a mini version of the operator shell.

### 4. Operator workspace

Keep as the internal primary application surface:

- `/app` scenario queue and detail workspace
- evidence library
- playbooks

Keep available but clearly secondary:

- templates
- reporting
- settings
- opportunities intake support queue
- pilot operations
- community dashboard

Sources:

- primary nav in [src/components/app-shell-nav.tsx](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/src/components/app-shell-nav.tsx)
- scenario-first shell in [src/app/app/page.tsx](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/src/app/app/page.tsx)

Rule:

- The signed-in operator identity should stay scenario-first. Internal support tools can exist, but they should not compete with the workspace as equal product pillars.

## Navigation Recommendation

Use this as the functional IA target:

- Public nav: Home, Sample audit, Method, Trust, FAQ, Sign in
- Founder nav: no broad global nav beyond the single workspace context
- Operator primary nav: Workspace, Evidence, Playbooks
- Operator utility or secondary nav: Templates, Reporting, Settings
- Operator support tools: Opportunities, Pilots, Community dashboard as linked secondary views, not first-class top-level product claims

## Explicit De-Emphasis

These surfaces should remain operational but should not define the product externally or in primary internal navigation:

- `/app/dashboard`
- `/app/pilots`
- `/app/opportunities`

They are operational support views. They do not represent the minimum coherent application story.

## Product Framing

The minimal functional application surface should be described as:

> an invite-only audit product with a founder workspace for delivery and an internal scenario workspace for operators

Not as:

- a self-serve SaaS
- a broad multi-module platform
- a community-monitoring dashboard product
- a pilot-operations portal

## Notes For Engineering

- Preserve the role split already embedded in `/app`; it is the strongest existing product boundary.
- If navigation must be simplified, demote secondary operator views before cutting evidence or playbooks.
- Avoid adding new top-level routes unless they clearly strengthen one of the four core surfaces above.
- Future UI review should judge new screens by whether they reinforce the founder workspace or operator workspace instead of spawning new product identities.

## Review Gate

- Engineering-ready check: [docs/ux/engineering-ready-checklist.md](./engineering-ready-checklist.md)
- Pre-merge or pre-release check: [docs/ux/design-review-checklist.md](./design-review-checklist.md)
- Ticket-specific review focus:
  - keep the public story narrow and truthful
  - protect `/app` as the single signed-in entry point for both roles
  - prevent support tools from becoming primary product wayfinding

## References

- [docs/ux/crm-product-concept-and-ux-paradigm.md](./crm-product-concept-and-ux-paradigm.md)
- [docs/ux/universal-crm-scenario-workspace-brief.md](./universal-crm-scenario-workspace-brief.md)
- [README.md](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/README.md)
