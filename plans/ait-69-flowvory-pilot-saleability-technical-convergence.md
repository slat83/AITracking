# AIT-69 Flowvory Pilot-Saleability Technical Convergence

## Goal

Make `flowvory.com` credible enough to sell as a founder-led pilot using the real Next.js application as the production source of truth. The sequence should minimize rework by converging runtime and positioning first, then adding the minimum onboarding and provisioning operations needed to support invoiced pilots, and only then preparing billing and entitlement seams.

## Current repo reality

The current application foundation is usable, but it is still pointed at the previous thesis:

- `README.md` and `package.json` still describe a content-ops foundation rather than Flowvory.
- `src/app/page.tsx` markets "Content Ops Visibility" and links to vehicle-history routes.
- `src/lib/site.ts` defaults to `content-ops.example.com`.
- `src/content/ai-visibility.ts` is filled with EpicVIN and VIN-check comparison/trust content.
- The authenticated app shell in `src/app/app/page.tsx` and the Prisma schema already provide a real Next.js + Prisma operator surface that can be repurposed instead of replaced.

This means the fastest credible path is not a new greenfield build. It is a convergence pass on the existing app so public, demo, and operator surfaces stop contradicting the company decision made in `AIT-64`.

## Sequencing principles

1. Converge production first. No team should keep building while runtime ownership is ambiguous.
2. Remove market-facing contradiction second. Pilot selling fails if the app still looks like an unrelated product.
3. Add manual-but-real operations third. Founder-led pilots need provisioning and visible status more than self-serve automation.
4. Defer billing automation fourth. Invoiced sales are acceptable, so billing should not block the first pilot.

## Minimum execution sequence

### Phase 1: Production convergence

Owner: Founding Engineer
Issue: [AIT-71](/AIT/issues/AIT-71)

- Make the existing Next.js app the only production source of truth.
- Remove or quarantine split-runtime and legacy production paths that would create conflicting deploy or demo behavior.
- Record what remains intentionally deferred after convergence.

Exit criteria:

- One deployable runtime path exists.
- The team can point to one app as the canonical product surface.

### Phase 2: Flowvory-native launch positioning

Owners: CMO then Founding Engineer
Issues: [AIT-73](/AIT/issues/AIT-73), [AIT-74](/AIT/issues/AIT-74)

- Audit all launch-critical public and demo surfaces for EpicVIN, vehicle-history, and generic content-ops residue.
- Replace those surfaces with Flowvory-native positioning for founder-led service delivery to lean eCommerce brands.
- Hide or defer non-critical legacy routes if rewriting them is not required for pilot credibility.

Exit criteria:

- A prospect reaching the homepage, trust surfaces, or demo path sees one coherent Flowvory story.
- No launch-critical route undermines the pitch with legacy domain language.

### Phase 3: Pilot onboarding and provisioning

Owners: UX Designer then Founding Engineer
Issues: [AIT-72](/AIT/issues/AIT-72), [AIT-75](/AIT/issues/AIT-75)

- Define the minimum founder-led onboarding flow for a pilot customer.
- Implement the internal workflow to create, activate, and track pilot customers without relying on future billing automation.
- Keep manual steps explicit and visible rather than pretending the workflow is self-serve.

Exit criteria:

- The team can sell a pilot, provision it in-product, and track status without off-system guesswork.
- Operators can see where each pilot account stands and what remains manual.

### Phase 4: Billing and entitlement seam

Owner: Founding Engineer
Issue: [AIT-76](/AIT/issues/AIT-76)

- Add only the interfaces and data boundaries needed to avoid painting the product into a corner.
- Do not let automated billing scope expand ahead of actual pilot provisioning needs.

Exit criteria:

- Manual pilot operations do not hard-code assumptions that break future billing automation.
- Any vendor or entitlement decisions remain isolated.

## Dependency graph

- [AIT-74](/AIT/issues/AIT-74) is blocked by [AIT-71](/AIT/issues/AIT-71) and [AIT-73](/AIT/issues/AIT-73).
- [AIT-75](/AIT/issues/AIT-75) is blocked by [AIT-71](/AIT/issues/AIT-71) and [AIT-72](/AIT/issues/AIT-72).
- [AIT-76](/AIT/issues/AIT-76) is blocked by [AIT-75](/AIT/issues/AIT-75).

## Why this is the minimum path

- It preserves the real app instead of funding parallel architecture.
- It treats public/demo contradiction as a release blocker, which matters more than feature count for pilot saleability.
- It prioritizes founder-led service operations over speculative SaaS automation.
- It keeps billing work behind demonstrated pilot needs.

## CEO decisions or confirmations still useful

No immediate blocker requires CEO action before execution starts. The team can begin on the current decision set.

The next useful CEO confirmations, if desired, are:

- Confirm the exact first pilot package the team should optimize around for lean eCommerce brands.
- Confirm whether any legacy external demo URLs or partner-facing artifacts must stay temporarily reachable during convergence.
- Confirm the tolerance for hidden/deferred legacy routes versus rewriting them before the first sales push.
