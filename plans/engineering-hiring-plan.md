# Engineering Hiring Plan and Execution Breakdown

## Context

Company goal: create a simple system for finding content opportunities, organizing them, preparing drafts, and coordinating authentic distribution across a network of approved accounts and employees.

Current state: greenfield project with no application code in the repository. The first engineering plan therefore needs to optimize for:

- fast product iteration on the core workflow
- sane technical foundations without overbuilding
- enough operational discipline to support a small team shipping quickly

## Technical Strategy

Build the first version as a single product surface with four connected capabilities:

1. Opportunity intake and triage
2. Content workspace and draft lifecycle
3. Distribution coordination across approved people/accounts
4. Basic analytics and audit trail

Recommended architecture for phase 1:

- a monolithic web application with a relational database
- one API/backend service and one web frontend
- background jobs for ingestion, notifications, and sync tasks
- connector boundaries around external sources so integrations can expand later

This structure is the fastest path to product learning while keeping the system easy for a small team to own.

## First-Hire Recommendation

Recommended first IC hire: **Founding Full-Stack Engineer**

Why this role first:

- The company is still validating workflow shape, so the main constraint is end-to-end product construction rather than scale or infra specialization.
- The repository is empty, which means the first engineer must make broad tradeoffs across backend, frontend, data model, auth, jobs, and deployment.
- A strong founding engineer can partner directly with the CTO on architecture while reducing execution risk across the whole stack.

Tradeoffs:

- Versus an infra/devtools engineer: infra specialization is premature before the product and developer workflow exist. We need competent platform choices, but not a dedicated platform owner yet.
- Versus a backend-only engineer: backend depth alone leaves the team exposed on operator UX and workflow iteration, which are central to the product.
- Versus a frontend-heavy product engineer: frontend strength matters, but the first hire still needs to set backend and data foundations in a greenfield environment.

## Hiring Sequence

### Hire 1: Founding Full-Stack Engineer

Mandate:

- build the first production-grade product slice with the CTO
- establish coding standards, repo conventions, and delivery rhythm
- own broad implementation across backend, frontend, data, and integrations

Success in first 90 days:

- ships the initial opportunity-to-distribution workflow
- helps define the first application architecture and developer workflow
- reduces cycle time from idea to deploy

### Hire 2: Product Engineer or Backend Integrations Engineer

Choose based on the biggest constraint after hire 1:

- choose a product engineer if workflow polish, operator usability, and rapid iteration are the bottleneck
- choose a backend integrations engineer if ingestion, workflow orchestration, and external system connectivity are the bottleneck

### Hire 3: Infra/Devtools Engineer

Bring this role in once:

- multiple engineers are shipping concurrently
- deployment, environments, CI, observability, and job reliability start slowing delivery
- integration surface area and data pipelines need stronger operational rigor

## Role Scorecards

### Founding Full-Stack Engineer

Mission:

- turn the content-ops concept into a reliable first product with high iteration speed

Core outcomes:

- design and ship core application features across frontend and backend
- create maintainable abstractions without overengineering
- establish testing, local development, and deployment basics
- contribute technical judgment on scope and architecture

Required strengths:

- strong TypeScript or equivalent full-stack experience
- pragmatic backend design with relational data modeling
- good product sense and comfort with ambiguous requirements
- ability to stand up greenfield systems quickly

Interview focus:

- system decomposition in ambiguous product spaces
- practical schema/API design
- shipping speed with sound tradeoffs
- code quality and ownership mentality

### Product Engineer / Backend Integrations Engineer

Mission:

- accelerate the next bottleneck after the first product slice is live

Core outcomes for product engineer:

- improve workflow quality, speed, and usability
- reduce friction in drafting, review, and distribution operations

Core outcomes for backend integrations engineer:

- expand ingestion and distribution connectors
- harden job orchestration, retries, and auditability

Interview focus:

- product engineer: workflow design, frontend execution, full-stack iteration
- backend integrations engineer: async systems, APIs, reliability, connector design

### Infra/Devtools Engineer

Mission:

- remove delivery drag by making the platform reliable, observable, and easy to ship on

Core outcomes:

- build CI/CD and environment strategy
- improve logs, metrics, alerting, and runbooks
- support secure secrets, background-job reliability, and database operations

Interview focus:

- lean platform design for startups
- observability and incident reduction
- developer productivity systems

## Execution Breakdown

The first engineering roadmap should be split into six workstreams.

### 1. Product foundation

- choose application stack and hosting approach
- initialize repo structure, environments, auth strategy, and database baseline
- define core domain model for opportunities, drafts, accounts, people, approvals, and distributions

### 2. Opportunity intake

- build manual opportunity capture and triage
- support source attribution, status, priority, tags, and ownership
- leave clear seams for future automated ingestion

### 3. Draft workspace

- build content records and draft lifecycle states
- support collaboration notes, review checkpoints, and handoff metadata
- keep design requirements separate for future UX ownership

### 4. Distribution coordination

- model approved accounts, employees, eligibility, and distribution tasks
- track assignments, send-outs, completion, and audit history
- start with manual coordination before advanced automation

### 5. Notifications and reporting

- add background jobs for reminders and workflow transitions
- expose simple operational dashboards and activity reporting
- provide enough instrumentation to understand usage and failures

### 6. Delivery operations

- set up CI, environments, release path, observability, and incident basics
- document local development and deployment workflow

## Initial Technical Task Tree

### Epic A: Establish the application foundation

- scaffold application and deployment baseline
- create database schema and migration workflow
- add auth, roles, and basic access control

### Epic B: Build the opportunity management flow

- implement opportunity CRUD and triage states
- support source metadata and prioritization
- provide operator views for queue management

### Epic C: Build the draft workflow

- implement content draft entities and state transitions
- support review notes and status visibility
- prepare integration points for future design support

### Epic D: Build distribution coordination

- implement account/person registry and approval state
- create distribution task assignment and completion tracking
- record audit events for send and completion actions

### Epic E: Add jobs, reporting, and observability

- implement reminders and workflow automation jobs
- add basic reporting for throughput and completion
- wire logs, metrics, and error monitoring

## Delegation Guidance

Until engineering hires exist:

- the CTO should own architecture, prioritization, and issue decomposition
- implementation issues should be created now as child tasks so execution can begin immediately once engineering capacity lands
- design-specific interaction work should be routed to UX when that function exists rather than embedded into engineering scope

## Recommended Near-Term Staffing Decision

Start with one founding full-stack engineer. After that hire starts, wait two to four weeks before finalizing hire 2 so the actual bottleneck is visible in code, product feedback, and operating cadence.
