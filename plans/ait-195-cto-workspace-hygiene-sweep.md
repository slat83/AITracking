# AIT-195 CTO Workspace Hygiene Sweep

Owner: CTO  
Date: 2026-05-12  
Related issue: AIT-195

## Executive Summary

- The workspace is functionally healthy for delivery today: `lint`, `typecheck`, `test`, and `build` all pass locally on 2026-05-12.
- The main bottleneck is not code correctness. It is governance hygiene drift risk: repo process quality depends on discipline, but several guardrails are documentation-heavy rather than system-enforced.
- Deployment and security posture are directionally solid (non-root deploy enforcement, env examples, storage policy), but secret-hygiene and docs drift controls are still lightweight.
- Decision: run a staged hygiene hardening plan that preserves shipping speed now and adds selective automation over the next 30-90 days.

## 1. Context

This sweep is scoped to `AIT-195 CTO Workspace Hygiene Sweep` and evaluates the current engineering workspace as an execution system, not just a code snapshot.

Business interpretation:

- Company stage: early growth / founder-led pilot delivery.
- Current outcome needed: keep delivery speed while reducing avoidable operational and security risk.
- Time horizon: immediate execution confidence (next 7 days), process hardening (next 30 days), durable reliability controls (next 90 days).

Technical scope reviewed:

- Repo structure, docs, runbooks, ADRs, and policy files.
- CI and deployment workflows in `.github/workflows`.
- Local quality gates (`npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`).
- Secret/storage hygiene patterns (`.gitignore`, env examples, security policy).

## 2. Core Technical Problem

The highest-cost constraint is **control-plane fragility in workspace hygiene**: quality is currently strong, but several critical safeguards (secret handling discipline, docs consistency, process compliance) rely more on people following policy than on automated enforcement.

## 3. Current State Assessment

### What exists now

- Next.js + Prisma application with test suite and CI verification.
- VPS deployment workflow with health checks and non-root user enforcement.
- Security/storage policy with explicit tracked-vs-private boundaries.
- Runbooks for deployment, access hardening, and operations.

### What is working

- Build and test pipeline is green locally (`75/75` tests passing, all checks pass).
- Deployment workflow includes basic safety controls (concurrency control, health gate, hardened SSH path expectation).
- Sensitive local paths are ignored (`private/`, `ops/local/`, `.env.production`, key/cert extensions).

### What is weak

- Hygiene enforcement is not fully automated (policy exists; enforcement is partial).
- Minor documentation drift already visible (example: duplicated CI bullet in `README.md`).
- Secret-pattern exposure risk remains dependent on manual review (example files intentionally show private key placeholders).

### What is missing

- Automated pre-merge hygiene checks beyond lint/typecheck/test/build (for example, secret scanning and docs consistency checks).
- Explicit SLO/SLA-style engineering hygiene scorecard tied to weekly CTO review.
- A small, codified workspace-hygiene checklist with named owners and cadence.

### What assumptions are being made

- Assumption: Current team capacity remains constrained; improvements must be low-overhead.
- Assumption: Founder-led pilots require reliability and trust signals more than architecture expansion.
- Assumption: Existing runbooks are the canonical operational source and are actively followed.

## 4. Key Risks

- **Silent policy drift:** docs say one thing, daily execution deviates without immediate detection.
- **Secret hygiene incident risk:** placeholder patterns and manual workflows can normalize unsafe behavior if not guarded by scanners.
- **Process debt accumulation:** if hygiene tasks stay informal, the repo can remain green while operational risk rises.
- **Leadership bandwidth risk:** CTO time can be consumed by reactive cleanup if controls are not delegated and automated.

## 5. Solution Options

| Option | Description | Pros | Cons | Cost / complexity | When this makes sense |
| --- | --- | --- | --- | --- | --- |
| 1. Minimal policy reinforcement | Keep current setup, add a weekly manual hygiene review checklist only. | Fastest, near-zero engineering effort. | Relies on human consistency; misses early detection. | Low | When team bandwidth is extremely tight for 2-3 weeks. |
| 2. Practical control hardening | Add targeted automation (secret scan in CI, docs hygiene checks, weekly CTO scorecard) without changing architecture. | Best speed-to-risk reduction tradeoff; fits current stage. | Small upfront setup and ownership discipline needed. | Medium | Recommended default for current business stage. |
| 3. Strong governance platform | Full engineering governance layer: policy-as-code, expanded compliance checks, formal release governance workflows. | Strongest control and auditability. | Higher complexity, slower delivery cadence risk at current scale. | High | When team size and compliance exposure justify heavier process. |

## 6. Priorities

| Initiative | Why it matters | Business impact | Technical impact | Effort | Risk | Owner | Dependencies | Timeline |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Add CI secret scanning gate | Reduces chance of credential leakage in commits and docs. | High trust protection; avoids incident cost. | Medium-high risk reduction. | Medium | Low-medium (false positives). | Founding Engineer | CI workflow updates, baseline ignore config. | 7-14 days |
| Define weekly hygiene scorecard | Makes hygiene visible and actionable at leadership level. | Better predictability and faster escalation. | Medium process stability gain. | Low | Low | CTO | Agreement on KPI definitions. | 7 days |
| Add docs consistency checks | Reduces drift between runbooks, README, and env examples. | Medium; fewer onboarding/release errors. | Medium maintainability gain. | Low-medium | Low | Founding Engineer + CTO | Lightweight check scripts/rules. | 14-30 days |
| Formalize ownership map for hygiene controls | Avoids CTO becoming single point of failure. | High execution continuity. | Medium organizational resilience gain. | Low | Medium (adoption risk). | CTO | CEO alignment on ownership model. | 30 days |
| Quarterly workspace resilience review | Prevents slow regression as scope grows. | Medium-long-term stability. | Medium reliability/security posture improvement. | Medium | Low | CTO | KPI baseline and incident history. | 90 days |

## 7. Recommended Plan

### Next 7 days

- Approve Option 2 as the baseline path.
- Publish a one-page weekly engineering hygiene scorecard (owner, metric, threshold, escalation path).
- Fix low-cost drift items immediately (documentation inconsistencies, stale wording, checklist gaps).
- Assign one implementation owner for CI hygiene guardrails and set a delivery date.

### Next 30 days

- Implement secret scanning in CI and document false-positive handling.
- Add lightweight docs-hygiene checks (for example, env/example parity and runbook reference validity).
- Run two weekly hygiene reviews and adjust thresholds from observed noise.
- Confirm that no high-severity hygiene finding remains unresolved beyond one weekly cycle.

### Next 90 days

- Institutionalize hygiene governance as part of release readiness.
- Review whether additional controls are justified by team size, customer commitments, and incident trend.
- Keep architecture investment focused on measured bottlenecks, not speculative control expansion.

### Decision statement

- **Do now:** targeted automation and explicit ownership (Option 2).
- **Do later:** heavier governance only if risk profile or scale materially increases.
- **Do not do now:** broad process-heavy governance platform (Option 3).
- **Main tradeoff accepted:** small upfront process overhead in exchange for lower security and reliability regression risk.

## 8. Technology Leadership View

### What CTO should personally own

- Hygiene operating model and risk thresholds.
- Weekly review cadence and escalation discipline.
- Final prioritization when speed-vs-control conflicts arise.

### What should be delegated

- CI guardrail implementation and maintenance.
- Documentation consistency automation.
- Routine remediation of low/medium hygiene findings.

### What should be monitored weekly

- CI pass/fail trend by check category.
- Open hygiene findings by severity and age.
- Time-to-remediate for security/process findings.
- Drift indicators: docs mismatch count, unresolved checklist actions, repeated release friction.

## 9. Clarifications Needed

1. Which compliance/security expectations (if any) are contractually required in the next two quarters?
2. What is the acceptable false-positive tolerance for secret scanning in CI?
3. Who is the named backup owner when the Founding Engineer is unavailable?
4. Which KPI should trigger immediate CEO escalation: secret exposure, deploy failure trend, or blocker age?
5. Are there external deadlines (pilot launches, audits, enterprise reviews) that require accelerating controls beyond Option 2?

## Evidence Snapshot (2026-05-12)

- Quality gates: `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build` all passed.
- CI workflow present with verification pipeline and build gate.
- Deploy workflow enforces non-root SSH path and health-check gating.
- Security policy and private-storage boundaries documented and repo ignore rules configured.
