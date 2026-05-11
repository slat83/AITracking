# UX Research Backlog

This backlog prioritizes the highest-risk workflow assumptions identified in the design audit. Keep it focused on questions that can change scope, sequencing, or interface behavior.

## Priority Scale

- P0: blocks confident implementation of a core workflow
- P1: high risk to usability or adoption if guessed wrong
- P2: useful optimization after the core workflow is stable

## Backlog

| Priority | Topic | Assumption To Test | Why It Matters Now | Suggested Method | Owner | Status |
| --- | --- | --- | --- | --- | --- | --- |
| P0 | Opportunity intake workflow | Operators can reliably distinguish a valid content opportunity from a weak one using the fields and signals planned for intake. | If the intake step is ambiguous, low-quality inputs will poison every downstream step. | Internal walkthrough with CEO, CMO, and CTO using 5 realistic examples; convert confusion into field and state requirements. | UX Designer | Not started |
| P0 | Draft preparation handoff | The handoff from opportunity selection to draft creation can be expressed as one clear primary path, not multiple competing team-specific paths. | This is a core workflow boundary likely to fragment once engineering starts. | Service blueprint session on current intended happy path and exceptions. | UX Designer | Not started |
| P0 | Distribution coordination | The team agrees on what "ready to distribute" means and which approvals or checks must happen before distribution. | Undefined readiness will create approval churn and unclear status states in the product. | Decision workshop with CEO and CMO; translate the result into acceptance criteria and status definitions. | UX Designer | Not started |
| P1 | Failure recovery | Operators will know how to recover when a required input is missing, a draft is rejected, or a distribution step fails. | Early products often handle the happy path only, which creates avoidable support burden. | Scenario review against the first implementation tickets and prototype states. | UX Designer + engineer | Not started |
| P1 | Terminology and UX writing | The current labels for opportunity, draft status, approval, and distribution steps match how the team naturally speaks about the work. | Misaligned vocabulary causes interface hesitation and review churn even when the workflow is correct. | Terminology review during design critique; capture approved language in the decision log. | UX Designer | Not started |
| P1 | Scenario boundary and branching | Operators will agree when a scenario should stay open with follow-up work versus branch into a new scenario after escalation or outcome logging. | The scenario workspace depends on a stable long-lived record. If branching rules are fuzzy, the timeline, outcomes, and queue health will become noisy quickly. | Workflow mapping session using 5 cross-functional examples that include escalation, approval denial, and follow-up outcomes. | UX Designer + CTO | Not started |
| P1 | Queue badge priority | Operators can scan a queue row quickly when status, blocker, evidence, and approval signals are present together. | If badge density is too high, the next-best-action UX becomes visually noisy and operators will miss the true blocking condition. | Lightweight prototype review with timed scanning tasks across realistic queue states. | UX Designer + engineer | Not started |
| P2 | Measurement and evidence | The first product slice can emit enough signals to learn where operators hesitate or abandon the workflow. | Instrumentation is not the first blocker, but missing it will slow later UX learning. | Define minimal events and success measures once implementation scope is concrete. | UX Designer + CTO | Not started |

## Promotion Rules

- Promote an item when it blocks a current engineering ticket.
- Promote an item when two or more open decisions depend on the same unanswered question.
- Archive an item once the answer is captured in the decision log or a completed research summary.
