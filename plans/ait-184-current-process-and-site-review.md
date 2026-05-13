# AIT-184 Current Process And Site Review

Owner: BusinessAnalyst  
Date: 2026-05-12  
Related issue: [AIT-184](/issues/AIT-184)

## Executive Summary

- The main problem is not lack of product work. It is lack of alignment between the public promise, the customer entry path, and the internal delivery workflow.
- The live domain observed on 2026-05-12 still presents a broad `AI Growth System and GEO for eCommerce` message on a Netlify-served shell, while the repo's current Next.js homepage presents a narrower founder-led `AI Visibility Audit for eCommerce` offer.
- The repo contains a meaningful pilot-delivery process: invite-only access, founder onboarding, internal provisioning, manual invoicing, and an operator workspace. The missing piece is a coherent public-to-pilot handoff.
- The highest-priority move is to choose one launch motion and enforce it across runtime, CTA path, workspace entry, and operating rules. Based on current implementation, the most realistic motion is founder-led pilot delivery, not self-serve SaaS.
- Billing automation, broader platform positioning, and deeper internal modules should be deferred until the public story and pilot conversion path are consistent.

## 1. Context

### How this task was understood

This review is scoped to the current business and operating path around Flowvory:

- the public site and launch message
- the customer entry and onboarding path
- the internal process used to provision and deliver the service

The goal is not a generic website critique. The goal is to identify whether the current site and process support a credible commercial motion, where the real bottlenecks are, and what should be changed first.

### Business type

Most likely current business model:

- founder-led service-assisted product
- focused on `AI Visibility Audit for eCommerce`
- delivered through an invite-only workspace with manual operational support

### Decision horizon

Primary horizon:

- urgent to next 30 days for launch clarity, runtime alignment, and pilot conversion

Secondary horizon:

- next 90 days for operating hardening, measurement, and selective automation

## 2. Core Problem

The current process and site are not operating as one coherent commercial system.

More specifically:

- the live public site, the repo-based public product story, and the internal app workflow are still expressing different product definitions
- the customer-facing path stops too early or jumps too far, because there is no clear, visible public `Request audit` to `accepted invite` flow in the canonical repo app
- the internal workflow is more developed than the external conversion path, so the company has delivery mechanics without a clean acquisition-to-onboarding bridge

### Root cause

The likely root cause is strategic layering without retirement of prior layers:

1. A broad AI growth / GEO positioning layer still exists on the live domain.
2. A narrower founder-led audit offer exists in the current repo public surface.
3. A deeper internal workflow CRM and scenario workspace exists behind the authenticated app.

Each layer is useful by itself. The problem is that they are not yet aligned around one launch boundary.

## 3. Situation Analysis

### What already exists

| Area | Current state | Evidence |
| --- | --- | --- |
| Live public site | `https://flowvory.com` returns a Netlify-served shell with the title `Flowvory, AI Growth System and GEO for eCommerce` and a broad AI growth description. `/sign-in` and `/app` also return the same public shell on 2026-05-12. | Direct HTTP checks on 2026-05-12 |
| Repo public positioning | The repo homepage positions a founder-led `AI Visibility Audit for eCommerce`, with a sample audit CTA and invite-only workspace framing. | `src/app/page.tsx` |
| Public trust/info content | The repo has structured public pages such as trust, method, FAQ, and sample-audit-style content. | `src/content/ai-visibility.ts`, `src/app/[...slug]/page.tsx` |
| Customer access model | The sign-in page is already framed as invite-only access for accepted pilot customers and operators. | `src/app/sign-in/page.tsx` |
| Founder workspace | A founder-facing workspace exists with onboarding checklist, status timeline, findings placeholder, action-plan placeholder, and manual billing visibility. | `src/components/founder-workspace.tsx`, `src/server/pilots/commercial.ts` |
| Internal pilot operations | The app includes an internal pilot operations surface for intake capture, workspace provisioning, status changes, invite handling, and manual invoices. | `src/app/app/pilots/page.tsx`, `src/server/pilots/workflow.ts` |
| Internal operator workflow | The app includes a broader scenario workspace plus secondary operator modules for evidence, playbooks, templates, reporting, and community monitoring. | `src/app/app/page.tsx`, `src/components/app-shell-nav.tsx`, `src/app/app/dashboard/page.tsx` |
| Basic analytics | The app captures page-view and CTA-click events for AI visibility pages. | `src/app/api/analytics/visibility/route.ts`, `src/server/analytics/visibility.ts` |

### What is missing

| Gap | Why it matters |
| --- | --- |
| One canonical launch message across live domain and repo app | Buyers cannot tell whether Flowvory is a broad GEO platform, a founder-led audit service, or a workflow product. |
| A visible public intake path in the canonical repo app | The repo homepage currently routes to `See a sample audit` or `Access invite-only workspace`, but not to a clear `Request audit` or qualification step. |
| A single runtime answer | The repo is designed as the product source of truth, but the live domain is still serving a separate static shell. This creates trust and operational drift. |
| End-to-end funnel instrumentation | Current measurement appears focused on public content events, not on request, acceptance, invite, onboarding completion, delivery, and follow-up. |
| A documented operator SLA for manual steps | Fit review, provisioning, invoicing, and founder follow-up are still manual, but no management-facing SLA or owner discipline was found in the app layer itself. |
| Customer-safe default information architecture across all entry points | A founder-safe workspace exists, but the broader app shell still exposes internal module language such as `Evidence`, `Playbooks`, `Templates`, and `Reporting`. |
| Consistent public content boundary | The repo still contains public EpicVIN comparison and trust content, which competes with the Flowvory audit story instead of reinforcing it. |

### What risks are visible

| Risk | Cause | Likely business effect |
| --- | --- | --- |
| Market confusion | Live site and repo app describe different offers | Lower conversion, weaker trust, harder sales conversations |
| Demo friction | Public domain and actual product runtime are not clearly the same system | Prospects may doubt product maturity or operational discipline |
| Funnel leakage | No clear public request path in the canonical app | Interested visitors may have no next step except sign-in or passive reading |
| Founder bottleneck | Provisioning, billing, and follow-up are manual | Throughput will stall quickly once pilot count rises |
| Analytics blind spot | Public content events exist, but funnel-state measurement appears incomplete | The team cannot distinguish message problems from process problems reliably |
| Strategic drift | Internal workflow CRM can expand faster than the commercial path | Engineering effort may move into internal depth before launch credibility is solved |
| Stale planning risk | Some older planning artifacts no longer match the current repo state | Decisions can be made against outdated assumptions |

### What assumptions are being made

| Assumption | Basis | Confidence |
| --- | --- | --- |
| The intended near-term motion is founder-led pilot delivery, not self-serve SaaS | Current homepage, invite-only sign-in, founder workspace, manual invoicing, and pilot workflow documents all point in that direction | High |
| Billing can remain manual for the first cohort | Manual invoice workflows are already implemented and visible in both operator and founder surfaces | High |
| Traffic volume is still low enough that manual fit review is acceptable | Invite-only posture and lack of public self-serve controls suggest low-volume, high-touch selling | Medium |
| The biggest immediate problem is positioning and process alignment, not feature absence | The repo already contains meaningful delivery mechanics; the weak point is the conversion bridge and narrative coherence | High |

## 4. Solution Options

| Option | Description | Pros | Cons | Conditions where it makes sense |
| --- | --- | --- | --- | --- |
| Option 1. Minimum viable alignment | Keep the founder-led pilot model, but simplify the public story immediately. Use one offer, one CTA, and manual back-office steps. Hide or deprioritize anything that reads like a broad SaaS platform. | Fastest path, low engineering scope, can support near-term founder-led selling | Does not solve runtime split fully, still operationally manual, limited measurement | Use if the priority is to start qualified pilot conversations within 7 days |
| Option 2. Practical systemic fix | Make the repo's Next.js app the canonical public and private product surface. Add a public `Request audit` path, connect it to manual fit review and invite provisioning, and keep the founder workspace as the customer-facing destination. | Aligns promise and delivery, removes runtime ambiguity, creates a credible pilot system without premature automation | Moderate cross-functional work across product, UX, engineering, and operations | Use if the goal is a coherent pilot-selling system within 30 days |
| Option 3. Stronger but more complex operating model | Build a fuller pilot control plane: structured intake, service-state tracking, support path, customer comms, SLAs, funnel analytics, and cleaner entitlements. Keep billing manual or semi-manual until pilot economics justify more. | Strongest operating discipline, better scalability, clearer reporting and accountability | Higher effort, more process design required, risk of overbuilding before demand is proven | Use if the company expects multiple concurrent pilots soon and needs operational control |
| Option 4. Full productization now | Push toward a self-serve or near-self-serve product with automated onboarding, billing, entitlement logic, and broader product navigation. | Potential long-term leverage if demand is already validated | Highest scope, highest risk, least supported by current product and process reality | Not recommended unless there is hard evidence that founder-led pilots are already constrained by demand volume rather than clarity or trust |

### Option assessment

Most realistic path:

- Option 2 as the primary path
- Option 1 as a temporary stabilization step if execution bandwidth is limited this week
- Option 3 only after the core public-to-pilot path is working
- Option 4 should be deferred

## 5. Priorities

| Initiative | Why it matters | Expected impact | Effort | Risk | Owner |
| --- | --- | --- | --- | --- | --- |
| 1. Choose and enforce one launch thesis | All other decisions depend on whether Flowvory is being sold as a founder-led audit, a broad GEO platform, or a workflow product | High | Low | Medium if left unresolved | CEO |
| 2. Unify the live domain and canonical product runtime | Buyers need one truthful answer to `what is the product I am seeing?` | High | Medium | High if delayed because trust and demos will keep drifting | CTO |
| 3. Add a clear public intake CTA and qualification path | The repo app has delivery mechanics but not a strong public handoff into them | High | Medium | Medium | CMO + UX Designer + CTO |
| 4. Make the founder workspace the only customer-facing default after acceptance | Customers should land in a guided audit workspace, not an operator shell or abstract module library | High | Medium | Medium | UX Designer + CTO |
| 5. Instrument the full pilot funnel | Without funnel states, the team cannot manage conversion or operational throughput credibly | Medium | Medium | Low | CTO |
| 6. Define manual operating SLAs for fit review, invite send, founder follow-up, and delivery | Manual steps are acceptable for pilots only if ownership and response windows are explicit | Medium | Low | Low | CEO + Operator |
| 7. Defer subscription automation and broad platform expansion | These would consume effort before the launch system is coherent | Medium | Low | Low | CEO + CTO |

## 6. Recommended Plan

### Next 7 days

| Action | Owner | Dependency | Expected result | Main risk |
| --- | --- | --- | --- | --- |
| Confirm one near-term commercial motion: founder-led `AI Visibility Audit for eCommerce` | CEO | None | Clear decision boundary for all teams | Continued mixed messaging if not decided explicitly |
| Decide the canonical public runtime and publish that decision internally | CTO | CEO commercial-motion confirmation | Removes ambiguity about what the live product should be | Team keeps shipping against split surfaces |
| Replace or hide contradictory launch-critical claims and routes on the live domain | CMO + CTO | Runtime and message decision | Public story becomes coherent enough for pilot outreach | Legacy pages keep undermining trust |
| Define one primary CTA and intake data set | CMO + UX Designer | Commercial-motion confirmation | Visitor path becomes actionable instead of passive | CTA remains ambiguous |
| Assign one operator owner and target turnaround for fit review and invite provisioning | CEO | None | Manual pilot flow becomes manageable | Founder work stays ad hoc |

### Next 30 days

| Action | Owner | Dependency | Expected result | Main risk |
| --- | --- | --- | --- | --- |
| Launch a public `Request audit` flow in the canonical app | CTO + UX Designer | CTA and intake definition | Public site can convert interest into structured demand | Partial launch without routing or notifications |
| Connect request intake to internal fit review, acceptance, and invite provisioning | CTO + Operator | Request flow live | Acquisition and delivery become one visible workflow | Manual steps stay hidden and inconsistent |
| Make the founder-facing workspace the post-acceptance default and keep internal modules hidden from founders | UX Designer + CTO | Invite and workspace path stable | Better customer clarity and lower first-use confusion | Internal language still leaks into customer view |
| Add basic funnel reporting for request, acceptance, invite, onboarding completion, delivery, and follow-up | CTO | Canonical workflow states | Management can see where drop-off happens | Measurement remains content-only |
| Add support and recovery basics for sign-in and invite issues | CTO + Operator | Invite flow | Lower operational friction and fewer blocked pilots | Login failures still require ad hoc intervention |

### Next 90 days

| Action | Owner | Dependency | Expected result | Main risk |
| --- | --- | --- | --- | --- |
| Review pilot economics, cycle time, and drop-off points using the new funnel data | CEO + CTO | 30-day funnel instrumentation live | Evidence-based decision on whether the model is commercially viable | Data quality may still be incomplete |
| Standardize customer communications, delivery SLA, and follow-up operating rules | CEO + Operator | Pilot throughput sufficient to observe patterns | More predictable delivery and less founder dependence | Process hardening happens too late |
| Decide whether billing automation is justified or whether manual invoicing remains sufficient | CEO + CTO | Pilot volume and cash-collection evidence | Avoids premature commercial tooling | Team overbuilds billing before demand is proven |
| Expand internal modules only when they support measured bottlenecks in sales, delivery, or retention | CTO | KPI review | Better capital allocation and less platform drift | Internal feature work outpaces commercial need |

### What not to do now

- Do not market Flowvory simultaneously as a broad GEO platform, a self-serve SaaS, and a founder-led audit.
- Do not expose internal operator nouns as the primary customer experience.
- Do not prioritize subscription automation before the public conversion path and invite workflow are working.
- Do not treat page-view analytics as a substitute for pilot-funnel measurement.

## 7. Clarifications Needed

The analysis above is directionally strong, but these questions should be answered to tighten prioritization:

1. Which product motion is officially approved for the next 90 days: founder-led audit, managed pilot software, or broader SaaS?
2. Is the Netlify-served live domain intentionally still the public source of truth on 2026-05-12, or is it lagging behind the repo app?
3. What is the expected monthly pilot volume for the next quarter?
4. What is the current close path: direct founder outreach, inbound demand, referrals, or something else?
5. How many real pilot requests, acceptances, invites, onboarding completions, and delivered audits have occurred so far?
6. What response-time standard is acceptable for manual fit review, invite sending, and founder follow-up?
7. Is manual invoicing acceptable through the full first cohort, or is there a hard deadline for billing automation?
8. Which public routes must remain live for business reasons, even if they do not fit the new launch story?
9. Who is the named operational owner for pilot provisioning and status management today?
10. What exact management KPI should define success in the next 30 days: qualified requests, accepted pilots, delivered audits, revenue, or something else?

## Evidence Reviewed

- Live domain HTTP responses from `https://flowvory.com`, `https://flowvory.com/sign-in`, and `https://flowvory.com/app` observed on 2026-05-12
- `src/app/page.tsx`
- `src/app/sign-in/page.tsx`
- `src/app/app/page.tsx`
- `src/components/founder-workspace.tsx`
- `src/components/app-shell-nav.tsx`
- `src/app/app/pilots/page.tsx`
- `src/server/pilots/workflow.ts`
- `src/server/pilots/commercial.ts`
- `src/app/api/analytics/visibility/route.ts`
- `src/server/analytics/visibility.ts`
- `src/content/ai-visibility.ts`
- `docs/ux/flowvory-founder-led-pilot-onboarding-provisioning-contract.md`
