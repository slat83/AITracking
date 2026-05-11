# AIT-46 Reusable Scenario Taxonomy And Proof Model

Owner: CMO
Date: 2026-05-10
Related issues: [AIT-46](/issues/AIT-46), [AIT-39](/issues/AIT-39), [AIT-36](/issues/AIT-36)

## Purpose

This brief defines the first reusable marketing-owned scenario taxonomy for the universal CRM described in [AIT-39](/issues/AIT-39) and [AIT-36](/issues/AIT-36).

It separates:

- reusable scenario families that should exist across accounts and verticals
- universal proof requirements that should travel with the workflow engine
- launch-pack proof and metric fields that remain specific to EpicVIN or any future vertical pack

The intent is to give product and engineering a stable operating model without freezing EpicVIN's four launch scenarios into the core product ontology.

## Design Rules

### 1. Scenario families should reflect user intent, not channel format

The durable taxonomy is the underlying job the user is trying to complete or the risk they are trying to resolve. A blog post, support reply, landing page, review response, or community answer is an execution choice, not the scenario definition.

### 2. Proof should be modeled separately from copy

The system should require evidence and policy checks before artifacts are drafted or published. Proof assets should be reusable across many scenarios and many artifacts.

### 3. Metrics should measure outcome by scenario family

Each family needs its own success signal. A trust-resolution scenario should not be judged by the same primary metric as a demand-capture scenario.

### 4. Guardrails should change workflow behavior

Policy, authenticity, legal, and brand-safety constraints are not notes. They should affect required approvers, allowed channels, and whether public execution is permitted.

## Scenario Taxonomy

The first reusable taxonomy should use eight scenario families.

| Scenario family | What triggers it | Core user need | Typical next actions | EpicVIN launch mapping |
| --- | --- | --- | --- | --- |
| Category demand capture | Search demand, research query, discovery interest | Understand a category, method, or solution class | Create or update answer-first page, FAQ, explainer, methodology asset | Best VIN decoder |
| Trust and legitimacy validation | Fraud concern, credibility question, billing fear, safety objection | Verify the company is real, transparent, and safe to use | Update trust page, policy page, support explainer, proof gallery, direct response | Is EpicVIN legit |
| Comparative evaluation | Named competitor or alternative comparison | Decide between known options in a specific scenario | Publish comparison artifact, methodology update, scenario-based fit guidance | EpicVIN vs Carfax |
| Price and value qualification | Price sensitivity, free-vs-paid hesitation, ROI question | Decide whether the offer is worth the cost | Publish pricing explainer, value calculator, budget FAQ, offer clarification | Cheap VIN check |
| Problem diagnosis and education | Confusion about process, risks, terminology, or how-to steps | Learn how to make a safe decision before buying or using | Create educational guide, checklist, FAQ cluster, support education artifact | Related support pages around used-car risk |
| Reputation and review management | Review trend, complaint theme, public objection, sentiment drop | Resolve concern credibly and prevent trust erosion | Investigate evidence, prepare public/private response, update proof asset, escalate issue | Trust and review-support extension |
| Lifecycle support and policy resolution | Billing issue, refund request, cancellation friction, usage dispute | Complete a post-purchase task with low confusion and low distrust | Route to support workflow, publish policy clarification, add macro or self-serve help | Billing/refund/support pages |
| Authority and community participation | Community discussion, expert quote request, partner mention opportunity | Get a credible answer from an approved voice in context | Prepare approved response, outreach note, expert quote, partner brief | External mention and community work |

## Family Definitions And Required Fields

Each scenario should store a common field set plus family-specific fields.

### Universal fields for every scenario

- `scenario_family`
- `scenario_goal`
- `signal_source`
- `signal_summary`
- `audience_segment`
- `market_or_account`
- `urgency`
- `business_impact`
- `policy_risk_level`
- `proof_readiness`
- `recommended_next_action`
- `required_approver_role`
- `primary_outcome_metric`
- `secondary_outcome_metrics`

### Family-specific fields

#### Category demand capture

- search or discovery intent cluster
- canonical answer target
- supporting evidence gaps
- required supporting pages

#### Trust and legitimacy validation

- trust objection type
- policy area involved
- proof artifact category
- escalation owner when proof is missing

#### Comparative evaluation

- comparison target
- comparison criteria set
- allowed claim scope
- fairness disclaimer requirement

#### Price and value qualification

- price objection type
- alternative considered
- value proof type
- offer or packaging dependency

#### Problem diagnosis and education

- problem stage
- decision-risk type
- instructional depth needed
- prerequisite assets required

#### Reputation and review management

- complaint theme
- source visibility level
- response pathway
- remediation dependency

#### Lifecycle support and policy resolution

- account or billing state
- policy workflow type
- resolution path
- support SLA target

#### Authority and community participation

- channel or platform type
- spokesperson eligibility
- disclosure requirement
- community-policy sensitivity

## Proof Model

The proof model should separate universal proof asset classes from launch-pack-specific assets.

### Universal proof asset classes

These should be modeled in the reusable CRM core because they recur across many verticals:

- methodology: how the company evaluates, compares, or produces the underlying output
- policy and legal: refund terms, billing terms, privacy, disclosures, eligibility rules
- company identity: about, contact, support paths, entity details, responsible owner
- product facts: feature definitions, limitations, coverage notes, workflow explanations
- evidence examples: sample outputs, screenshots, annotated walkthroughs, artifact examples
- service proof: support process, escalation path, response commitments, operational screenshots
- performance proof: validated outcomes, case evidence, benchmark summaries, before/after data
- approval proof: who reviewed a claim, when it was reviewed, and what restrictions apply

### Launch-pack-specific proof assets

These should be attached by a vertical pack such as EpicVIN rather than hard-coded into the product:

- VIN-decoder data-source explanations
- sample vehicle history report screenshots
- vehicle-history comparison criteria against Carfax or similar tools
- used-car buying risk checklists
- pricing examples tied to EpicVIN packaging
- EpicVIN-specific support, refund, and billing screenshots

### Required proof fields on each asset

- `proof_asset_type`
- `title`
- `claim_supported`
- `evidence_owner`
- `last_verified_at`
- `verification_method`
- `allowed_usage`
- `restricted_channels`
- `sensitivity_level`
- `expiration_or_review_date`

### Proof readiness states

The workflow should use explicit readiness states:

- `missing`: no acceptable proof attached
- `partial`: some proof exists but required evidence is incomplete
- `ready`: required proof exists and is current
- `restricted`: proof exists but policy or channel restrictions limit usage

## Recommended Outcome Metrics By Scenario Family

| Scenario family | Primary metric | Secondary metrics |
| --- | --- | --- |
| Category demand capture | Qualified organic visits to scenario asset | CTR, citation/mention rate, assisted conversions, time to publish |
| Trust and legitimacy validation | Trust-resolution rate | Bounce reduction, support-deflection rate, conversion rate after trust-page visit, complaint recurrence |
| Comparative evaluation | Comparison-assisted conversion rate | Scroll depth on criteria, CTA rate, assisted revenue, fairness-review pass rate |
| Price and value qualification | Conversion rate from value-oriented assets | Offer-to-purchase rate, FAQ engagement, objection-resolution rate, assisted revenue |
| Problem diagnosis and education | Problem-resolution progression rate | Support-deflection rate, related-page progression, return visits, artifact reuse rate |
| Reputation and review management | Negative-signal containment rate | response SLA, sentiment change, repeat complaint rate, escalation rate |
| Lifecycle support and policy resolution | Resolution completion rate | time to resolution, reopen rate, CSAT or equivalent, policy-page deflection |
| Authority and community participation | Qualified mention or response success rate | referral sessions, engagement quality, approval turnaround time, channel-compliance pass rate |

## Guardrails That Must Change Workflow

These conditions should not be passive metadata. They should alter routing, permissions, or required proof.

### High-impact guardrail classes

- comparative claim risk: requires methodology proof and reviewer approval before public use
- trust or legitimacy claim risk: requires company-identity and policy proof before publication
- pricing or policy claim risk: requires current policy artifact and expiration review date
- review or reputation response risk: requires authenticity checks and a remediation owner
- community participation risk: requires approved spokesperson and disclosure confirmation
- support-resolution risk: requires account-specific context and approved support pathway

### Workflow rules

- Public posting should be blocked when proof readiness is `missing`.
- Comparative scenarios should require an explicit allowed-claim scope.
- Reputation scenarios should force a source-visibility field because private complaints and public reviews need different playbooks.
- Community scenarios should require disclosure and approved-channel checks before any draft is marked ready.
- Lifecycle support scenarios should separate marketing artifacts from account-resolution tasks so operators do not confuse content work with case handling.

## Product And Engineering Implications

The reusable CRM should treat EpicVIN's current four launch scenarios as seeded examples inside broader families:

- `best VIN decoder` -> `category_demand_capture`
- `is EpicVIN legit` -> `trust_and_legitimacy_validation`
- `EpicVIN vs Carfax` -> `comparative_evaluation`
- `cheap VIN check` -> `price_and_value_qualification`

The first product schema and playbook layer should therefore support:

1. configurable scenario families and scenario definitions
2. reusable proof asset classes with readiness states
3. family-level metric assignment
4. guardrail-driven approval and execution rules
5. launch-pack overrides for vertical-specific proof and copy templates

## Recommendation

Approve this eight-family taxonomy as the first marketing-owned operating model. Product and engineering should implement the family and proof objects as configurable records, then seed EpicVIN as one vertical pack rather than a permanent core ontology.
