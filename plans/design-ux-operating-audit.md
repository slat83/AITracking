# Design and UX Operating-Model Audit

## Scope and Method

This audit is based on the current Paperclip company state, active issue tree, agent roster, and repository contents as of 2026-05-10.

Inputs reviewed:

- active agent roster and reporting lines
- active issue tree under [AIT-8](/issues/AIT-8)
- existing planning artifacts in `plans/technical-resource-operating-audit.md`, `plans/engineering-hiring-plan.md`, and `plans/ceo-operating-routine.md`
- current repository contents and delivery baseline

## Executive Summary

The company now has UX strategy capacity, but it does not yet have product delivery conditions that let design compound into shipped user experience.

- There is one active design owner: the UX Designer.
- There is no product application in the repository, no implemented interface surface, and no active design-system asset library.
- There are no documented research artifacts, prototype files, journey maps, or usability findings in the current workspace.
- The current design function can define workflows, clarify operator experience, and establish review discipline, but it cannot yet improve a live product because engineering execution has barely started.

Near-term conclusion:

- retain a single UX owner as the design lead for workflow clarity, research framing, and design review
- do not hire additional design specialists yet
- use the current design function to define the interaction model for the first product slice and to create the review loop that will keep early engineering work usable

## Current UX and Design Resources

### People and ownership

- UX Designer: active. Owns UX strategy, service design, user research, interface quality, design-system thinking, and clarity of user-facing workflows.
- CEO: active. Owns company priorities, approval decisions, and weekly operating cadence.
- CTO: active. Owns technical strategy, execution planning, and engineering management.
- CMO: active. Owns go-to-market strategy and distribution-side workflows.
- Founding Full-Stack Engineer: created but idle. No meaningful product implementation output yet.

### Systems and artifacts

- Paperclip: primary execution system for planning, delegation, approvals, and issue tracking.
- Repository planning artifacts: present.
- Product UI code: not present.
- Design system library, component inventory, prototype source files, and research repository: not present in the workspace.
- UX quality loop, usability review ritual, and design QA checklist: not yet instantiated.

### Active workflows

- Cross-functional planning workflow exists through Paperclip issues and company planning documents.
- UX execution workflow does not yet exist as a repeatable system because there is no active product surface, no implemented flows, and no standing research cadence.
- Design influence is currently upstream and strategic rather than downstream and interface-specific.

## What UX Capacity Exists Today

### Effective current capacity

- workflow definition and service design: yes
- UX review and critique on planned product flows: yes
- research planning and synthesis framing: yes
- design-system direction: yes, conceptually
- interface production for a live application: no current surface to operate on
- design QA against shipped product: no current product to review
- dedicated visual design specialization: no
- dedicated UX writing/content design specialization: no

### What the current capacity is actually doing

- translating the company goal into clearer user and operator workflows
- defining what design governance and product-quality checks should exist before shipping begins
- identifying missing ownership boundaries across product, design, and engineering

This means the design organization is currently operating as a workflow-definition and quality-governance function, not yet as a high-throughput production design team.

## Gaps, Bottlenecks, and Risks

### Primary gaps

- No live product surface. UX cannot validate actual user behavior yet.
- No research corpus. There are no stored user interviews, usability tests, or workflow observations to ground prioritization.
- No design-system baseline. Early UI decisions risk becoming inconsistent if the first engineer ships without clear UX rules.
- No formal product-spec handoff pattern. Workflow intent could degrade between planning and implementation.

### Structural risks

- Single point of failure: one UX owner is responsible for strategy, workflow design, research framing, and quality review.
- Engineering-first drift: once implementation starts, usability debt can accumulate quickly if design review is optional or late.
- Unvalidated workflow risk: the company goal depends on multi-step operator workflows, but those workflows have not yet been pressure-tested with users.
- Ownership ambiguity: CEO, CTO, UX, and CMO all influence workflow shape; without explicit decision boundaries, product clarity can stall.

### Duplicate work and idle capacity

- Duplicate design work: none observed; the team is too small.
- Idle specialist capacity: none observed; there are no design specialists beyond the UX lead.
- Risk of low-leverage design effort: high if design spends time creating polished artifacts before the first engineering slice exists.

## Recommended UX Role Map

### Current-state role map

- CEO: owns company objective, approval decisions, and escalation on cross-functional priority conflicts
- CTO: owns application architecture, implementation sequencing, and engineering execution
- UX Designer: owns workflow clarity, interaction model, research plan, design review, and design-system direction for the first product slice
- CMO: owns distribution-side operational needs and feedback on downstream workflow requirements
- Founding Full-Stack Engineer: owns implementation once activated, in partnership with CTO and UX

### Near-term design roles actually needed

1. One broad Product UX lead, already covered by the current UX Designer
2. No additional UX or visual-design hire until real product throughput and user feedback expose a clear bottleneck
3. Consider a second design-capable role later only if one of these becomes true:
   - the first product surface is shipping weekly and design review becomes the constraint
   - research demand exceeds what one UX owner can run while supporting delivery
   - content and workflow copy quality become a measurable adoption blocker

### Roles not needed yet

- dedicated design manager
- dedicated visual brand designer for product execution
- dedicated UX researcher
- dedicated design-systems specialist
- dedicated UX writer

Those roles are premature before the company has a live product, stable usage patterns, and enough product throughput to justify specialization.

## Recommended UX Operating System

### Ownership model

- CEO owns company goal, staffing decisions, and final tradeoff calls when functions conflict.
- CTO owns technical feasibility, sequencing, and delivery management.
- UX owns operator workflow definition, interaction principles, user-facing clarity, design review, and research synthesis.
- Founding engineer owns implementation execution and collaborates with UX on tradeoffs once engineering work starts.
- CMO provides requirements and feedback for content/distribution workflows that touch go-to-market operations.

### Weekly cadence

- Monday: UX planning pass. Review the week’s highest-priority workflows, unresolved UX decisions, and any engineering tickets that need interaction guidance.
- Wednesday: cross-functional workflow review with CEO and CTO. Confirm whether user flow risks, copy gaps, or ambiguous states need escalation before implementation proceeds.
- Friday: UX scorecard review inside the company progress review. Check blocker age, review coverage, research progress, and any usability risks carried into next week.

### Required operating artifacts

- one canonical workflow map for the end-to-end opportunity-to-distribution experience
- one UX decision log for unresolved interaction and copy choices
- one design review checklist for any interface shipped by engineering
- one lightweight research backlog with prioritized questions and assumptions
- one shared definition of done that includes UX acceptance for workflow tickets

## KPI and Dashboard Recommendation

Use a compact UX scorecard that fits inside the weekly CEO review.

### Pre-product / pre-usage KPIs

- Workflow definition coverage
  - Owner: UX Designer
  - Target: 100% of near-term product epics have a documented primary user flow and success path before implementation
  - Review cadence: weekly

- UX decision turnaround
  - Owner: UX Designer
  - Target: open interaction decisions resolved within 3 business days
  - Review cadence: weekly

- Critical UX blocker age
  - Owner: UX Designer
  - Target: no critical UX blocker older than 7 days
  - Review cadence: weekly

- Design review coverage
  - Owner: UX Designer with CTO support
  - Target: 100% of user-facing tickets reviewed before merge or release once implementation begins
  - Review cadence: weekly

### Post-launch / post-usage KPIs

- Usability task success rate
  - Owner: UX Designer
  - Target: 80%+ success on the top three operator workflows in moderated testing
  - Review cadence: monthly until traffic is large enough for continuous measurement

- UX defect escape rate
  - Owner: UX Designer with engineering support
  - Target: 0 critical workflow-confusion defects escaping into production per month
  - Review cadence: weekly

- Research synthesis cadence
  - Owner: UX Designer
  - Target: at least one research or usability synthesis per month once users exist
  - Review cadence: monthly

- Workflow completion friction
  - Owner: UX Designer and CTO
  - Target: downward trend in abandonment or manual intervention on the core workflow once instrumentation exists
  - Review cadence: weekly

## Retain / Reassign / Hire Recommendations

### Retain

- Retain the UX Designer as the single design lead. This role is necessary now because the company goal depends on workflow clarity more than visual polish.

### Reassign

- No design reassignments recommended. The current design function is already broad and lightweight.

### Hire

- Do not hire a second design specialist yet.
- Reassess design hiring after the founding engineer has shipped enough product for two to four weeks of real feedback and review load.
- If a later design hire is needed, prioritize a product designer with strong workflow and UX writing instincts over a narrow visual specialist.

## Explicit Next Actions

1. Define the canonical end-to-end workflow for opportunity intake, draft handling, and distribution coordination before major implementation starts.
2. Attach UX acceptance criteria to [AIT-3](/issues/AIT-3) through [AIT-7](/issues/AIT-7) once those engineering tasks move toward execution.
3. Create a lightweight UX decision log and design review checklist to prevent early inconsistency in states, copy, and handoffs.
4. Start a research backlog focused on the highest-risk workflow assumptions so the first user conversations or internal walkthroughs are guided by known questions.
5. Review design hiring again only after product throughput and real usability evidence show that one UX owner is the constraint.

## Final Assessment

The right design move is not to build a larger design organization now. The right move is to use one strong UX owner to define the product workflow, install a small quality loop, and partner tightly with engineering as the first implementation work starts. Until there is a live product and user evidence, more design headcount would add coordination cost faster than it would add execution value.
