# AIT-235 App Surface Audit And Working Technical Scope

Owner: CTO  
Date: 2026-05-13  
Related issues: [AIT-235](/issues/AIT-235), [AIT-234](/issues/AIT-234)

## Objective

Audit the current authenticated app surface and define the minimum visible technical scope that is truly working now, with emphasis on Reddit keyword and Reddit post workflows.

## Audit Boundary

- Included: authenticated operator and founder surfaces under `/app`, sign-in/invite access paths, and Reddit tracking APIs/UI.
- Included: whether each visible surface is wired to persistent data and actionable mutations.
- Excluded: broader marketing/public-site copy and non-app positioning decisions.

## Evidence Reviewed

- Navigation and app shell:
  - `src/components/app-shell-nav.tsx`
  - `src/app/app/page.tsx`
  - `src/app/app/dashboard/page.tsx`
  - `src/app/app/opportunities/page.tsx`
  - `src/app/app/pilots/page.tsx`
  - `src/app/app/evidence/page.tsx`
  - `src/app/app/playbooks/page.tsx`
  - `src/app/app/templates/page.tsx`
  - `src/app/app/reporting/page.tsx`
  - `src/app/app/settings/page.tsx`
- Reddit workflow implementation:
  - `src/components/dashboard-workbench.tsx`
  - `src/app/api/keywords/route.ts`
  - `src/app/api/threads/route.ts`
  - `src/app/api/posts/route.ts`
  - `src/server/dashboard/tracking.ts`
  - `docs/api/dashboard-endpoints.md`
- Targeted verification run on 2026-05-13:
  - `npm run test -- tests/dashboard-tracking.test.ts tests/dashboard-workbench.test.ts tests/keywords-route.test.ts tests/dashboard-api-auth.test.ts` (21/21 passed)
  - `npm run test -- tests/scenario-workspace.test.ts tests/scenario-mutations.test.ts tests/scenario-service.test.ts tests/opportunity-workflow.test.ts tests/pilot-workflow.test.ts tests/pilot-commercial.test.ts` (29/29 passed)

## Surface Inventory

| Surface | What exists now | Wiring status | Scope fit (Reddit keywords/posts) | Recommendation |
| --- | --- | --- | --- | --- |
| `/sign-in` and `/invite/[token]` | Invite-first access, credential login, invite activation path | Working; DB-backed session/invite flow | Required prerequisite | Keep visible |
| `/app` (operator branch) | Scenario workspace with queue, blockers, approvals, ownership mutation rails | Working and deeply wired, but broad and unrelated to Reddit keyword/post loop | Low fit | Hide from default navigation for now |
| `/app` (viewer branch) | Founder workspace rendering for pilot contacts | Working; gated by pilot membership and entitlement checks | Low fit | Keep gated path, not operator default |
| `/app/dashboard` | Community monitoring dashboard with keywords, threads, posts, plus command plan box | Partially mixed: core trackers are real; command plan is presentation-only | High fit for trackers, low fit for command plan | Keep tracker modules; remove command plan block |
| `/app/opportunities` | Intake/triage CRUD with scenario sync and orchestration | Working and persisted | Out of scope for current minimum | Hide from default navigation |
| `/app/pilots` | Pilot provisioning + invite + manual invoicing | Working and persisted | Out of scope for current minimum | Hide from default navigation |
| `/app/evidence`, `/app/playbooks`, `/app/templates`, `/app/reporting`, `/app/settings` | Read-heavy operator surfaces over scenario taxonomy/governance | Working reads, but not part of Reddit execution loop | Out of scope | Hide from default navigation |
| Primary nav in app shell | Shows six top-level tabs by default: Workspace, Evidence, Playbooks, Templates, Reporting, Settings | Wired links, but expands perceived scope beyond active value | Low fit | Replace with minimal nav aligned to live workflows |

## Reddit Flow Assessment

### Working now

1. Keyword tracking lifecycle works end-to-end:
   - add, replace, list, delete with validation and auth.
   - workbook import path also wired.
2. Thread tracking lifecycle works end-to-end:
   - add/list/delete with normalized URL handling.
3. Post tracking lifecycle works end-to-end:
   - add/list and mark answered (state transition, not hard delete).
4. All three routes are protected through dashboard permission checks (token scopes or editor session).
5. Dashboard UI directly calls these APIs and updates visible state.

### Partial or misleading

1. `Single-command execution queue` in dashboard:
   - generated client-side from current in-memory/loaded records.
   - no persisted command entity, no execution state machine, no API contract.
   - reads like automation but is currently guidance UI only.
2. No real Reddit integration layer:
   - no fetch/sync from Reddit API.
   - no publish/reply action path.
   - current workflow is manual logging and status movement.
3. Test coverage gap on route handlers:
   - keyword route has direct handler tests.
   - thread/post route handlers do not currently have equivalent route-level CRUD tests (auth tests exist).

## Minimum Working Technical Scope (Recommended)

### Keep visible now

- Auth entry: `/sign-in`, `/invite/[token]`
- Operator default: `/app/dashboard`
- Dashboard modules:
  - tracked keywords
  - posts to answer / answered posts
  - tracked threads (optional: keep if team still uses thread list as feeder input)
- APIs backing this scope:
  - `/api/keywords`
  - `/api/posts`
  - `/api/threads` (if threads remain visible)

### Hide from operator default shell now

- Scenario workspace as the default `/app` landing for editors/admins
- Opportunities, pilots, evidence, playbooks, templates, reporting, settings tabs in primary nav
- Any UI element that implies automated execution when only manual tracking exists

## Execution Path (Bounded)

| Step | Scope | Outcome |
| --- | --- | --- |
| 1 | Simplify shell navigation and default landing | Operators land on the real Reddit tracker workflow first, not broad scenario surfaces |
| 2 | Remove command-plan mock block from dashboard | UI only exposes actions that map to persisted state and API behavior |
| 3 | Add route-level tests for `/api/threads` and `/api/posts` | Confidence parity with `/api/keywords` and reduced regression risk |
| 4 | Re-check role access and founder paths after simplification | No regression for invite-only founder access while operator UI narrows |

## Proposed Child Issues

1. `Simplify operator app shell to the minimum Reddit workflow surface`
   - default editor/admin landing to `/app/dashboard`
   - minimal primary nav; hide out-of-scope tabs from current operator entry
2. `Remove non-persistent command queue UI from dashboard and tighten copy`
   - remove "Single-command execution queue" block
   - clarify manual nature of tracked queues
3. `Add handler tests for /api/threads and /api/posts`
   - parity with existing keyword route coverage
   - include success, validation, and auth-failure paths

## Decision

The minimum credible working application surface today is the authenticated Reddit tracker flow (keywords, threads, posts) plus invite/auth access.  
Everything else may still be technically working, but it should be hidden from the default operator shell until the current execution loop expands beyond manual Reddit tracking.
