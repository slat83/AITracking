# AIT-15 AI Visibility Technical Implementation Plan

## Scope

This plan converts [AIT-11](/issues/AIT-11) into an execution-ready technical implementation plan for EpicVIN's AI visibility / GEO system.

Primary outcomes:

- publish crawlable, evidence-rich website assets for the four target intent clusters
- expose consistent structured data and entity signals that search engines and AI systems can retrieve
- instrument measurement for AI mentions, search visibility, CTR, conversions, and evidence-page citations
- launch a compliant review acquisition system tied to real service usage
- define sequencing, dependencies, acceptance criteria, and engineering execution tasks

Constraints:

- no fake reviews, staged UGC, undisclosed promotion, or unverifiable claims
- all trust and comparison claims must resolve to visible evidence on owned or legitimately earned surfaces
- implementation must work with static rendering or server-rendered HTML, not JS-only content

## Executive Summary

The right architecture is a content-and-evidence layer on the existing EpicVIN web property, not a separate growth microsite.

The system should ship in three layers:

1. Content foundation: core pages, supporting pages, trust center, FAQ modules, author/evidence blocks, and internal links.
2. Structured retrieval layer: schema, metadata, canonicalization, indexation controls, and reusable answer-first page sections.
3. Measurement and feedback layer: search console analytics, event instrumentation, citation tracking, review collection, and monthly AI visibility reporting.

This is primarily a website architecture and instrumentation program. It does not require heavy new platform infrastructure. It does require disciplined page templates, clear data ownership, and a lightweight reporting pipeline.

## Technical Architecture

### 1. Site architecture

Implement the system inside the main EpicVIN domain with one hub and four cluster pathways.

Recommended top-level owned surfaces:

- `/vin-decoder/` or equivalent existing commercial page
- `/compare/best-vin-decoder/`
- `/trust/is-epicvin-legit/`
- `/compare/epicvin-vs-carfax/`
- `/pricing/cheap-vin-check/`
- `/trust/`
- `/help/`
- `/reviews/` or `/customer-stories/`

Supporting technical requirements:

- every core page must be indexable, server-rendered or statically rendered, and reachable within three clicks from a persistent navigation path
- each cluster should have one canonical core page plus two to four supporting pages
- each core page should expose reusable blocks for answer-first summary, methodology, evidence, FAQ, CTA, and related links
- trust-center assets should centralize company identity, policies, support, billing, privacy, and sample report evidence
- author pages should exist for editorial accountability and entity consistency

### 2. Page-template system

Use one shared content template with cluster-specific modules instead of four bespoke implementations.

Required template modules:

- hero with intent-aligned H1 and 40 to 80 word concise answer block
- evidence strip with data sources, update date, author, and last-reviewed metadata
- comparison or proof section
- methodology section
- FAQ accordion rendered in HTML
- internal-link module to adjacent cluster pages and trust assets
- citation-ready fact cards with short claims tied to visible evidence
- CTA module with consistent analytics events

### 3. Internal linking and crawlability

Internal links should express entity relationships, not just conversion funnels.

Required linking rules:

- each core page links to the trust center, at least two supporting pages, and one adjacent cluster page
- supporting pages link back to their core page with descriptive anchor text
- comparison pages link to methodology, pricing, and trust pages
- trust pages link to refund, billing, privacy, support, and sample report assets
- FAQ entries that deserve standalone expansion should have dedicated URLs where search demand exists

Technical crawlability rules:

- no critical content hidden behind tabs that fail without JS
- canonical tags on all pages
- XML sitemaps split by page type if volume grows
- breadcrumb navigation with HTML and schema parity
- metadata, body copy, and schema facts must not conflict

## Intent Cluster Implementation

### Best VIN Decoder cluster

Core asset:

- `/compare/best-vin-decoder/`

Supporting assets:

- methodology page for how tools are evaluated
- sample report / data-source explainer
- FAQ page for VIN decoder limitations and use cases

Technical emphasis:

- comparison table component with clear evidence fields
- article and FAQ schema
- author and editorial review metadata

### Is EpicVIN Legit cluster

Core asset:

- `/trust/is-epicvin-legit/`

Supporting assets:

- trust center hub
- billing and refund explainer
- support/contact workflow page
- privacy/security/data-source explainer

Technical emphasis:

- organization and web page schema
- strong entity consistency across footer, about, contact, policies, and trust pages
- evidence blocks for legal details, support channels, and sample outputs

### EpicVIN vs Carfax cluster

Core asset:

- `/compare/epicvin-vs-carfax/`

Supporting assets:

- alternatives-to-carfax page
- methodology page for comparisons
- scenario-based FAQ page

Technical emphasis:

- normalized comparison table fields
- scenario-driven copy blocks
- clear limitations/disclaimers to avoid unprovable superiority claims

### Cheap VIN Check cluster

Core asset:

- `/pricing/cheap-vin-check/`

Supporting assets:

- free-vs-paid explainer
- use-case pages for budget buyers, salvage risk, older vehicles
- FAQ page for low-cost decision scenarios

Technical emphasis:

- pricing/value comparison blocks
- FAQ schema
- conversion tracking broken out by low-price entry paths

## Structured Data Plan

Use only policy-compliant schema that matches visible content.

### Global schema baseline

Implement across the relevant owned pages:

- `Organization`
- `WebSite`
- `BreadcrumbList`
- `Person` for authors where applicable
- `Article` or `WebPage` depending on page type

### Cluster-level schema

Best VIN Decoder:

- `Article`
- `FAQPage`
- `BreadcrumbList`
- `Organization`

Is EpicVIN Legit:

- `WebPage`
- `FAQPage`
- `Organization`
- `BreadcrumbList`

EpicVIN vs Carfax:

- `Article` or `WebPage`
- `FAQPage`
- `BreadcrumbList`

Cheap VIN Check:

- `Article` or `WebPage`
- `FAQPage`
- `BreadcrumbList`

### Review schema policy

- only use `Review` or `AggregateRating` where the source, collection method, and display are compliant and backed by real collected reviews
- do not mark up ratings that are not visibly presented on the page
- do not synthesize aggregate review numbers from mixed or unverifiable third-party sources

### Structured data implementation rules

- generate schema from the same content source used by page templates to reduce drift
- validate in CI or pre-publish checks using schema and rich-result validation tooling
- add ownership for schema fields so legal/company facts have a clear maintainer

## Measurement Architecture

### 1. North-star metrics

- AI mention rate across the priority prompt set
- share of positive or neutral brand mentions for the priority prompts
- evidence-page citation share in AI answers where sources are exposed
- non-branded search visibility for cluster terms
- CTR from SERP to cluster pages
- conversion rate from cluster pages to purchase or report-start actions

### 2. Data sources

- Google Search Console for query, impression, and CTR trends
- web analytics platform for sessions, conversions, scroll depth, and CTA clicks
- server-side event stream or analytics endpoint for canonical conversion events
- manual or scripted AI prompt audits logged monthly
- citation tracker sheet or dataset keyed by prompt, model, date, answer sentiment, and cited URLs
- review system data keyed by trigger, response rate, sentiment, and public review follow-through

### 3. Event instrumentation

Track at minimum:

- page view by cluster page type
- CTA click by page, cluster, and CTA variant
- FAQ expand by question id
- comparison-table interaction
- trust-evidence interaction
- review-invite sent
- review-submitted internal feedback
- public-review click-through
- conversion start and purchase completion

### 4. Reporting model

Establish one monthly dashboard or reporting sheet with:

- prompt baseline versus current mention rate
- prompt baseline versus current sentiment
- cited-source counts by owned page
- organic landing sessions by cluster page
- CTR and conversion by cluster
- review volume, freshness, and sentiment themes

## Review Acquisition System

### Trigger flow

- trigger review request only after verified report delivery or completed purchase
- send initial neutral feedback request by email or in-product message
- route detractors or problem cases into support recovery, not public review pushing
- offer public review option only after the user has voluntarily provided real feedback or shown satisfaction signals

### Technical components

- event trigger from order/report completion
- review queue table with user, order, trigger time, status, and channel
- template service for neutral review outreach copy
- suppression logic for refunds, abuse cases, and duplicate requests
- reporting table for volume, response rate, review freshness, and themes

### Compliance rules

- neutral wording only
- no gating for five-star sentiment
- no staff-authored or proxy-authored reviews
- preserve audit trail for request timing and copy version used

## Acceptance Criteria

The system is technically ready when:

- four core cluster pages and at least eight supporting pages are publishable through reusable templates
- all core pages are crawlable HTML with canonical tags, metadata, breadcrumbs, and internal-link coverage
- required structured data is implemented and validated on each core page
- trust-center and author/accountability surfaces exist and are linked from relevant pages
- analytics events and search-console reporting are configured for all core pages
- the AI prompt tracking workflow has a documented baseline set and recurring update process
- the review acquisition flow is implemented with compliance-safe messaging and reporting fields
- the content and schema model prevent claims from appearing in markup that are absent from the page

## Sequencing

### Phase 1: foundation

- align URL map and page-template system
- define content model for core pages, FAQs, evidence blocks, authors, and comparisons
- implement trust-center shared assets
- implement analytics event taxonomy

### Phase 2: first two clusters

- ship Best VIN Decoder and Is EpicVIN Legit clusters first
- validate crawlability, schema, linking, and measurement on those templates
- launch review acquisition trigger flow

### Phase 3: expansion clusters

- ship EpicVIN vs Carfax and Cheap VIN Check clusters
- expand supporting pages and FAQ long-tail assets
- start monthly AI visibility reporting and citation tracking

### Phase 4: iteration

- revise templates and supporting pages from query and prompt data
- strengthen cited evidence blocks based on what AI systems retrieve
- expand review/theme reporting and conversion attribution

## Dependencies

- UX-owned information architecture and page-template definition from [AIT-17](/issues/AIT-17)
- CMO-owned content and GEO execution plan from [AIT-16](/issues/AIT-16)
- access to the existing EpicVIN site stack, CMS, analytics platform, and search console
- legal/company facts, support workflow details, refund policy, and sample report artifacts from business owners

## Risk Register

### Risk 1: schema-content drift

If schema is hand-maintained separately from page content, contradictions will appear.

Mitigation:

- generate schema from shared content fields
- add validation checks before publish

### Risk 2: trust claims without evidence

Trust pages can become generic marketing if they are not fed by real company facts and support workflows.

Mitigation:

- require evidence owner for each trust claim
- block publishing when legal/support fields are missing

### Risk 3: AI measurement noise

Prompt-based AI visibility data is noisy and can drift by model and date.

Mitigation:

- use a fixed prompt set, fixed logging format, and monthly deltas
- treat AI mention rate as directional, not absolute truth

### Risk 4: review-policy violations

Well-intended review requests can become non-compliant if copy or targeting drifts.

Mitigation:

- centralize templates
- keep audit logs for review invitation logic
- exclude refund and unresolved-support cohorts by rule

### Risk 5: over-fragmented page inventory

Creating too many thin pages too early will dilute authority and slow maintenance.

Mitigation:

- ship one canonical core page per cluster first
- add supporting pages only where there is clear content differentiation

## Engineering Execution Breakdown

### Workstream 1: content model and page templates

- define CMS fields and reusable page sections
- implement core cluster template and supporting-page template
- implement author, evidence, FAQ, and comparison components

### Workstream 2: technical SEO and schema layer

- implement metadata, canonicalization, breadcrumbs, sitemap coverage, and schema generation
- add validation checks for required fields and schema parity

### Workstream 3: trust center and review system

- implement trust-center templates and evidence modules
- implement review trigger, queue, outreach state, and reporting fields

### Workstream 4: analytics and AI visibility reporting

- instrument events
- wire search-console and analytics exports into a recurring reporting artifact
- define AI prompt-audit dataset and monthly operating cadence

## Recommended Child Issues

The following execution issues should be created immediately and assigned to the appropriate owners:

1. Engineering: implement the AI visibility page-template, schema, and crawlability foundation.
2. Engineering: implement analytics instrumentation and AI visibility reporting pipeline.
3. Engineering: implement the compliant review acquisition workflow and reporting model.
4. UX: finalize the information architecture, page hierarchy, and reusable content module definitions.
5. CMO: finalize content briefs, evidence requirements, and editorial rollout sequencing.

## Decision

Technical ownership should remain centralized under the CTO for architecture and sequencing, but implementation should move to the Founding Full-Stack Engineer, with UX and CMO providing the page-system and content inputs that unblock execution.
