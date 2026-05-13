import { PilotStatus } from "@prisma/client";
import type {
  ApprovalStatus,
  ProofReadiness,
  ScenarioPrerequisiteStatus,
  ScenarioStatus,
  TaskStatus,
} from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AppShellNav } from "@/components/app-shell-nav";
import { FounderWorkspace } from "@/components/founder-workspace";
import { escalateScenarioAction, reassignScenarioOwnerAction } from "@/app/app/scenario-actions";
import { requireUser } from "@/server/auth";
import { prisma } from "@/server/db/client";
import { resolvePilotCommercialState } from "@/server/pilots/commercial";
import {
  WORKSPACE_FRESHNESS_WINDOWS,
  WORKSPACE_SORTS,
  WORKSPACE_VIEWS,
  getLatestWorkspaceEscalation,
  getWorkspaceApprovals,
  getWorkspaceBlockers,
  parseWorkspaceQueueFilters,
  type WorkspaceScenario,
  getWorkspaceChildArtifacts,
  getScenarioWorkspaceData,
  type WorkspaceOwnershipAuditEvent,
  getWorkspaceViewMeta,
  parseWorkspaceView,
} from "@/server/scenarios/workspace";

export const runtime = "nodejs";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getMessage(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function buildWorkspaceQuery(input: {
  view: string;
  scenario?: string;
  scenarioType?: string;
  urgency?: string;
  owner?: string;
  account?: string;
  freshness?: string;
  sort?: string;
  ownershipMode?: string;
}) {
  return Object.fromEntries(
    Object.entries(input).filter((entry): entry is [string, string] => Boolean(entry[1])),
  );
}

function formatEnumLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(value: Date | null | undefined, options?: Intl.DateTimeFormatOptions) {
  if (!value) {
    return "Not set";
  }

  return value.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
    ...options,
  });
}

function formatDateTime(value: Date | null | undefined) {
  if (!value) {
    return "Not set";
  }

  return value.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

function formatRelativeTime(value: Date) {
  const diffMs = value.getTime() - Date.now();
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (Math.abs(diffHours) < 24) {
    return formatter.format(diffHours, "hour");
  }

  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  return formatter.format(diffDays, "day");
}

function getHealthTone(input: {
  status: ScenarioStatus;
  blockedReason: string | null;
  proofReadiness: ProofReadiness;
  approvalStatus: ApprovalStatus;
}) {
  if (
    input.status === "BLOCKED"
    || input.approvalStatus === "PENDING"
    || input.approvalStatus === "REJECTED"
    || input.proofReadiness === "RESTRICTED"
    || input.blockedReason
  ) {
    return { label: "Blocked", tone: "danger" as const };
  }

  if (input.proofReadiness === "PARTIAL") {
    return { label: "At risk", tone: "warning" as const };
  }

  if (input.status === "IN_OBSERVATION") {
    return { label: "Observing", tone: "neutral" as const };
  }

  return { label: "On track", tone: "success" as const };
}

function getTaskLaneLabel(status: TaskStatus) {
  if (status === "COMPLETE" || status === "CANCELED") {
    return "Done";
  }

  if (status === "BLOCKED") {
    return "Waiting";
  }

  return "Now";
}

function getPrerequisiteTone(status: ScenarioPrerequisiteStatus) {
  if (status === "SATISFIED" || status === "WAIVED") {
    return "success";
  }

  if (status === "BLOCKED") {
    return "danger";
  }

  return "warning";
}

function trimText(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized && normalized.length > 0 ? normalized : null;
}

function resolveNextActionFallback(input: {
  status: ScenarioStatus;
  proofReadiness: ProofReadiness;
  approvalStatus: ApprovalStatus;
  blockedReason: string | null;
  tasks: Array<{
    title: string;
    status: TaskStatus;
  }>;
  recommendedNextAction: string | null;
  playbookRecommendedNextAction: string | null;
}) {
  const configuredNextAction =
    trimText(input.recommendedNextAction) ?? trimText(input.playbookRecommendedNextAction);

  if (configuredNextAction) {
    return configuredNextAction;
  }

  const openTask = input.tasks.find((task) => task.status === "TODO" || task.status === "IN_PROGRESS" || task.status === "BLOCKED");
  const openTaskLabel = openTask ? trimText(openTask.title) : null;
  if (openTaskLabel) {
    return openTaskLabel;
  }

  if (input.approvalStatus === "PENDING" || input.approvalStatus === "REJECTED") {
    return input.blockedReason ?? "Resolve approval before execution can continue.";
  }

  if (input.blockedReason) {
    return `Resolve blocker: ${input.blockedReason}`;
  }

  if (
    input.status === "INTAKE"
    || input.status === "TRIAGE"
  ) {
    return "Qualify the scenario and complete missing context.";
  }

  if (
    input.status === "READY_FOR_DRAFT"
    || input.status === "ACTIVE"
    || input.status === "BLOCKED"
  ) {
    if (input.proofReadiness !== "READY") {
      return "Close proof gaps before execution continues.";
    }
    return "Run the next execution step for this scenario.";
  }

  if (input.status === "IN_OBSERVATION") {
    return "Capture outcome and decide whether a follow-up is required.";
  }

  return "Review the scenario context and choose the next operator action.";
}

function buildTimeline(selectedScenario: WorkspaceScenario) {
  const childArtifacts = getWorkspaceChildArtifacts(selectedScenario);
  return [
    {
      id: `scenario-captured-${selectedScenario.id}`,
      title: "Scenario captured",
      detail: `${selectedScenario.title} entered the workspace from ${selectedScenario.sourceOpportunity?.sourceName ?? "the intake queue"}.`,
      at: selectedScenario.capturedAt,
    },
    {
      id: `scenario-updated-${selectedScenario.id}`,
      title: "Scenario updated",
      detail: `Scenario status is ${formatEnumLabel(selectedScenario.status)} and proof readiness is ${formatEnumLabel(selectedScenario.proofReadiness)}.`,
      at: selectedScenario.updatedAt,
    },
    ...selectedScenario.evidenceLinks.map((link) => ({
      id: `evidence-${link.evidenceAsset.id}`,
      title: "Evidence linked",
      detail: `${link.evidenceAsset.title} was linked as ${link.isPrimary ? "primary proof" : "supporting proof"}.`,
      at: link.createdAt,
    })),
    ...selectedScenario.prerequisites.map((prerequisite) => ({
      id: `prerequisite-${prerequisite.id}`,
      title: "Prerequisite reviewed",
      detail: `${prerequisite.title} is currently ${formatEnumLabel(prerequisite.status)}.`,
      at: prerequisite.updatedAt,
    })),
    ...selectedScenario.tasks.map((task) => ({
      id: `task-${task.id}`,
      title: `Task ${formatEnumLabel(task.status).toLowerCase()}`,
      detail: `${task.title} is owned by ${task.owner?.name ?? "Unassigned"}.`,
      at: task.updatedAt,
    })),
    ...childArtifacts.map((artifact) => ({
      id: `artifact-${artifact.id}`,
      title: artifact.source === "draft" ? "Draft handoff updated" : "Artifact updated",
      detail: `${artifact.title} is in ${artifact.statusLabel.toLowerCase()}.`,
      at: artifact.updatedAt,
    })),
    ...(selectedScenario.outcome
      ? [
          {
            id: `outcome-${selectedScenario.outcome.id}`,
            title: "Outcome recorded",
            detail:
              selectedScenario.outcome.summary
              ?? `Outcome status is ${formatEnumLabel(selectedScenario.outcome.status)}.`,
            at: selectedScenario.outcome.updatedAt,
          },
        ]
      : []),
  ];
}

function buildWorkspaceTimeline(
  selectedScenario: WorkspaceScenario,
  ownershipAuditEvents: WorkspaceOwnershipAuditEvent[],
) {
  const items = [
    ...buildTimeline(selectedScenario),
    ...ownershipAuditEvents.map((event) => ({
      id: event.anchorId,
      title: event.action === "owner_reassigned" ? "Scenario reassigned" : "Scenario escalated",
      detail: event.detail,
      at: event.createdAt,
    })),
  ];

  return items.sort((left, right) => left.at.getTime() - right.at.getTime()).slice(-12);
}

function WorkspaceContextFields(input: {
  selectedView: string;
  selectedScenarioId: string;
  queueFilters: ReturnType<typeof parseWorkspaceQueueFilters>;
}) {
  return (
    <>
      <input name="view" type="hidden" value={input.selectedView} />
      <input name="scenario" type="hidden" value={input.selectedScenarioId} />
      <input name="scenarioType" type="hidden" value={input.queueFilters.scenarioTypeId ?? ""} />
      <input name="urgency" type="hidden" value={input.queueFilters.urgency ?? ""} />
      <input name="owner" type="hidden" value={input.queueFilters.ownerId ?? ""} />
      <input name="account" type="hidden" value={input.queueFilters.accountId ?? ""} />
      <input name="freshness" type="hidden" value={input.queueFilters.freshness} />
      <input name="sort" type="hidden" value={input.queueFilters.sort} />
    </>
  );
}

export default async function WorkspacePage({ searchParams }: PageProps) {
  const session = await requireUser("VIEWER");
  const params = (await searchParams) ?? {};
  const error = getMessage(params.error);
  const selectedView = parseWorkspaceView(params.view);
  const selectedScenarioId = getMessage(params.scenario);
  const notice = getMessage(params.notice);
  const ownershipMode = getMessage(params.ownershipMode);
  const ownershipError = getMessage(params.ownershipError);
  const ownershipNotice = getMessage(params.ownershipNotice);
  const ownershipReason = getMessage(params.reason) ?? "";
  const reassignmentTargetId = getMessage(params.newOwnerId) ?? "";
  const escalationTargetId = getMessage(params.escalationTargetId) ?? "";
  const escalationOwnerId = getMessage(params.escalationOwnerId) ?? "";
  const queueFilters = parseWorkspaceQueueFilters(params);

  if (session.user.role === "VIEWER") {
    const founderMembership = await prisma.pilotContact.findFirst({
      where: {
        userId: session.user.id,
      },
      include: {
        pilot: {
          include: {
            contacts: true,
            invoices: {
              orderBy: [{ createdAt: "desc" }],
            },
          },
        },
      },
    });

    if (founderMembership) {
      const pilot = founderMembership.pilot;
      const commercial = resolvePilotCommercialState(pilot, session.user.id);
      const workspaceAccess = commercial.workspaceAccess;

      if (!workspaceAccess?.hasAccess) {
        redirect(`/sign-in?error=${encodeURIComponent(workspaceAccess?.reason ?? "Workspace access is unavailable.")}`);
      }

      return (
        <FounderWorkspace
          acceptedAt={founderMembership.acceptedAt}
          billing={commercial.billing}
          error={error}
          notice={notice}
          pilot={pilot}
          workspaceAccessSource={workspaceAccess.source}
        />
      );
    }

    return (
      <main className="shell">
        <section className="card formCard">
          <div className="eyebrow">Workspace access</div>
          <h1 style={{ fontSize: "2.25rem", marginBottom: 12 }}>No pilot workspace is linked to this account</h1>
          <p className="muted signInHint">
            This sign-in is active, but it is not attached to a founder workspace yet. Ask Flowvory
            to resend your invite or confirm that the correct email address was provisioned.
          </p>
        </section>
      </main>
    );
  }

  redirect("/app/dashboard");

  const workspaceData = await getScenarioWorkspaceData(prisma, {
    userId: session.user.id,
    view: selectedView,
    filters: queueFilters,
    selectedScenarioId,
  });

  const selectedScenario = workspaceData.selectedScenario;
  const selectedViewMeta = getWorkspaceViewMeta(selectedView);
  const timeline = selectedScenario
    ? buildWorkspaceTimeline(selectedScenario, workspaceData.ownershipAuditEvents)
    : [];
  const queueTotal = workspaceData.scenarios.length;
  const activeFilterCount = [
    queueFilters.scenarioTypeId,
    queueFilters.urgency,
    queueFilters.ownerId,
    queueFilters.accountId,
    queueFilters.freshness !== "any" ? queueFilters.freshness : undefined,
  ].filter(Boolean).length;
  const openTaskCount = selectedScenario
    ? selectedScenario.tasks.filter((task) => task.status !== "COMPLETE" && task.status !== "CANCELED").length
    : 0;
  const blockedTaskCount = selectedScenario
    ? selectedScenario.tasks.filter((task) => task.status === "BLOCKED").length
    : 0;
  const proofSatisfiedCount = selectedScenario
    ? selectedScenario.prerequisites.filter(
        (prerequisite) => prerequisite.status === "SATISFIED" || prerequisite.status === "WAIVED",
      ).length
    : 0;
  const childArtifacts = selectedScenario ? getWorkspaceChildArtifacts(selectedScenario) : [];
  const blockerItems = selectedScenario ? getWorkspaceBlockers(selectedScenario) : [];
  const approvalItems = selectedScenario ? getWorkspaceApprovals(selectedScenario) : [];
  const latestOwnershipEvent = workspaceData.ownershipAuditEvents[0] ?? null;
  const latestEscalation = getLatestWorkspaceEscalation(workspaceData.ownershipAuditEvents);
  const hasEligibleOwners = workspaceData.ownershipOptions.length > 0;
  const canMutateOwnership = Boolean(
    selectedScenario
    && (session.user.role === "ADMIN"
      || (session.user.role === "EDITOR" && selectedScenario.owner?.id === session.user.id)),
  );
  const scenarioIsReadOnly = Boolean(
    selectedScenario && (selectedScenario.status === "ARCHIVED" || selectedScenario.status === "RESOLVED"),
  );
  const resolveNextAction = (scenario: (typeof workspaceData.scenarios)[number] | null) => {
    if (!scenario) {
      return "Review the scenario context and choose the next operator action.";
    }

    return resolveNextActionFallback({
      status: scenario.status,
      proofReadiness: scenario.proofReadiness,
      approvalStatus: scenario.approvalStatus,
      blockedReason: scenario.blockedReason,
      tasks: scenario.tasks.map((task) => ({
        title: task.title,
        status: task.status,
      })),
      recommendedNextAction: scenario.recommendedNextAction,
      playbookRecommendedNextAction: scenario.playbook?.recommendedNextAction ?? null,
    });
  };
  const reassignOptions = workspaceData.ownershipOptions.filter((option) => option.value !== selectedScenario?.owner?.id);
  const escalationButtonLabel = latestEscalation ? "Update escalation" : "Escalate";

  return (
    <main className="shell dashboard workspacePage">
      <header className="topbar workspaceHeader">
        <div className="topbarInner workspaceHeaderInner">
          <div>
            <div className="eyebrow">Scenario workspace</div>
            <h1 style={{ fontSize: "2.5rem", margin: "12px 0 0" }}>Workspace queue and scenario control surface</h1>
            <p className="muted workspaceIntro">
              Use the queue as the default shell surface, then move into evidence, playbooks,
              templates, reporting, or settings only when the active scenario requires it.
            </p>
          </div>
          <div className="workspaceHeaderActions">
            <div className="pill">{session.user.role}</div>
            <Link className="button buttonSecondary" href="/app/opportunities">
              Open intake support queue
            </Link>
          </div>
        </div>
        <AppShellNav activeKey="workspace" />
      </header>

      {notice ? (
        <section className="card dashboardCard workflowMessage workflowMessageNotice">{notice}</section>
      ) : null}

      <section className="statsGrid dashboardHeader workspaceStats">
        <article className="card dashboardCard">
          <p className="muted">Active queue</p>
          <p className="statValue">{queueTotal}</p>
        </article>
        <article className="card dashboardCard">
          <p className="muted">Selected view</p>
          <p className="workspaceStatLabel">{selectedViewMeta.label}</p>
        </article>
        <article className="card dashboardCard">
          <p className="muted">Open tasks</p>
          <p className="statValue">{openTaskCount}</p>
        </article>
        <article className="card dashboardCard">
          <p className="muted">Proof satisfied</p>
          <p className="statValue">
            {proofSatisfiedCount}
            {selectedScenario ? `/${selectedScenario.prerequisites.length}` : ""}
          </p>
        </article>
      </section>

      <section className="workspaceQuestionGrid">
        <article className="workspaceQuestionCard">
          <span className="metaLabel">What changed</span>
          <p>
            {selectedScenario
              ? `${selectedScenario.title} is ${formatEnumLabel(selectedScenario.status).toLowerCase()} and was updated ${formatRelativeTime(selectedScenario.updatedAt)}.`
              : "Select a scenario to load the latest meaningful change."}
          </p>
        </article>
        <article className="workspaceQuestionCard">
          <span className="metaLabel">What matters now</span>
          <p>
            {selectedScenario
              ? selectedScenario.sourceOpportunity?.whyNow ?? selectedScenario.signalSummary ?? "No urgency summary is attached yet."
              : "The queue keeps urgency, proof, and approval risk visible before detail view."}
          </p>
        </article>
        <article className="workspaceQuestionCard">
          <span className="metaLabel">What should happen next</span>
          <p>
            {selectedScenario
              ? resolveNextAction(selectedScenario)
              : "Choose a scenario to see the recommended next action and proof requirements."}
          </p>
        </article>
      </section>

      <section className="workspaceGrid">
        <aside className="card workspacePanel workspaceQueuePanel">
          <div className="workspacePanelHeader">
            <div>
              <h2>Queue</h2>
              <p className="muted" style={{ marginTop: 8 }}>
                {selectedViewMeta.description}
                {activeFilterCount > 0 ? ` · ${activeFilterCount} active filter${activeFilterCount === 1 ? "" : "s"}` : ""}
              </p>
            </div>
          </div>
          <form className="workspaceQueueControls" method="get">
            <input name="view" type="hidden" value={selectedView} />
            <div className="workspaceControlGrid">
              <label className="field">
                <span>Scenario type</span>
                <select className="workflowSelect" defaultValue={queueFilters.scenarioTypeId ?? ""} name="scenarioType">
                  <option value="">All scenario types</option>
                  {workspaceData.queueOptions.scenarioTypes.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Urgency</span>
                <select className="workflowSelect" defaultValue={queueFilters.urgency ?? ""} name="urgency">
                  <option value="">All urgency</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </label>
              <label className="field">
                <span>Owner</span>
                <select className="workflowSelect" defaultValue={queueFilters.ownerId ?? ""} name="owner">
                  <option value="">All owners</option>
                  {workspaceData.queueOptions.owners.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Account</span>
                <select className="workflowSelect" defaultValue={queueFilters.accountId ?? ""} name="account">
                  <option value="">All accounts</option>
                  {workspaceData.queueOptions.accounts.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Freshness</span>
                <select className="workflowSelect" defaultValue={queueFilters.freshness} name="freshness">
                  {WORKSPACE_FRESHNESS_WINDOWS.map((window) => (
                    <option key={window.key} value={window.key}>
                      {window.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Sort</span>
                <select className="workflowSelect" defaultValue={queueFilters.sort} name="sort">
                  {WORKSPACE_SORTS.map((sortOption) => (
                    <option key={sortOption.key} value={sortOption.key}>
                      {sortOption.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="buttonRow workspaceQueueControlsActions">
              <button className="button buttonPrimary" type="submit">
                Apply controls
              </button>
              <Link
                className="button buttonSecondary"
                href={{
                  pathname: "/app",
                  query: buildWorkspaceQuery({ view: selectedView }),
                }}
              >
                Reset
              </Link>
            </div>
          </form>
          <div className="workspaceViewList">
            {WORKSPACE_VIEWS.map((view) => {
              const count = workspaceData.viewCounts.find((entry) => entry.key === view.key)?.count ?? 0;
              return (
                <Link
                  className={`workspaceViewLink${selectedView === view.key ? " workspaceViewLinkActive" : ""}`}
                  href={{
                    pathname: "/app",
                    query: buildWorkspaceQuery({
                      view: view.key,
                      scenarioType: queueFilters.scenarioTypeId,
                      urgency: queueFilters.urgency,
                      owner: queueFilters.ownerId,
                      account: queueFilters.accountId,
                      freshness: queueFilters.freshness !== "any" ? queueFilters.freshness : undefined,
                      sort: queueFilters.sort,
                    }),
                  }}
                  key={view.key}
                >
                  <span>{view.label}</span>
                  <span className="pill workspaceCountPill">{count}</span>
                </Link>
              );
            })}
          </div>
          <div className="workspaceQueueList">
            {workspaceData.scenarios.length === 0 ? (
              <div className="workspaceEmptyState">
                <strong>No scenarios in this view.</strong>
                <p className="muted">Shift to another saved view or capture new intake from the support queue.</p>
              </div>
            ) : (
              workspaceData.scenarios.map((scenario) => {
                const health = getHealthTone(scenario);
                return (
                  <Link
                    className={`workspaceQueueCard${selectedScenario?.id === scenario.id ? " workspaceQueueCardActive" : ""}`}
                    href={{
                      pathname: "/app",
                      query: buildWorkspaceQuery({
                        view: selectedView,
                        scenario: scenario.id,
                        scenarioType: queueFilters.scenarioTypeId,
                        urgency: queueFilters.urgency,
                        owner: queueFilters.ownerId,
                        account: queueFilters.accountId,
                        freshness: queueFilters.freshness !== "any" ? queueFilters.freshness : undefined,
                        sort: queueFilters.sort,
                      }),
                    }}
                    key={scenario.id}
                  >
                    <div className="workspaceQueueCardHeader">
                      <div>
                        <strong>{scenario.title}</strong>
                        <p className="muted" style={{ marginTop: 6 }}>
                          {scenario.account.name} · {scenario.scenarioType.name}
                        </p>
                      </div>
                      <span className={`workspaceToneBadge workspaceToneBadge${health.tone}`}>
                        {health.label}
                      </span>
                    </div>
                    <div className="workspaceQueueMeta">
                      <span>{formatEnumLabel(scenario.status)}</span>
                      <span>{scenario.owner?.name ?? "Unassigned"}</span>
                    </div>
                    <p className="workspaceQueueAction">
                      Next: {resolveNextAction(scenario)}
                    </p>
                    <div className="workspaceBadgeRow">
                      <span className="pill">{formatEnumLabel(scenario.proofReadiness)}</span>
                      {scenario.approvalStatus !== "NOT_REQUIRED" ? (
                        <span className="pill">{formatEnumLabel(scenario.approvalStatus)}</span>
                      ) : null}
                      {scenario.blockedReason ? <span className="pill">Blocker</span> : null}
                    </div>
                    <div className="workspaceQueueMeta">
                      <span>{scenario.blockedReason ?? "No scenario-level blocker recorded"}</span>
                      <span>Updated {formatRelativeTime(scenario.updatedAt)}</span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </aside>

        <section className="card workspacePanel workspaceDetailPanel">
          {!selectedScenario ? (
            <div className="workspaceEmptyState workspaceDetailEmpty">
              <h2>No scenario selected</h2>
              <p className="muted">
                Choose a scenario from the queue to load the detail workspace and action rail.
              </p>
            </div>
          ) : (
            <>
              <section className="workspaceSection">
                <div className="workspaceScenarioHeader">
                  <div>
                    <div className="eyebrow">Scenario header</div>
                    <h2>{selectedScenario.title}</h2>
                    <p className="muted">
                      {selectedScenario.account.name} · {selectedScenario.scenarioType.name} ·{" "}
                      {selectedScenario.owner?.name ?? "Unassigned owner"}
                    </p>
                  </div>
                  <div className="workspaceHeaderPills">
                    <span className="pill">{formatEnumLabel(selectedScenario.priority)} priority</span>
                    <span className="pill">{formatEnumLabel(selectedScenario.urgency)} urgency</span>
                    <span className="pill">{getHealthTone(selectedScenario).label}</span>
                  </div>
                </div>
                <div className="workspaceFactsGrid">
                  <article className="workspaceFactCard">
                    <span className="metaLabel">Current stage</span>
                    <p className="metaValue">{formatEnumLabel(selectedScenario.status)}</p>
                  </article>
                  <article className="workspaceFactCard">
                    <span className="metaLabel">Business impact</span>
                    <p className="metaValue">{formatEnumLabel(selectedScenario.businessImpact)}</p>
                  </article>
                  <article className="workspaceFactCard">
                    <span className="metaLabel">Updated</span>
                    <p className="metaValue">{formatDate(selectedScenario.updatedAt)}</p>
                  </article>
                </div>
              </section>

              <section className="workspaceSection">
                <div className="workspaceSectionTitleRow">
                  <h3>Signal summary</h3>
                </div>
                <div className="workspaceSummaryGrid">
                  <article className="workspaceInlineCard">
                    <span className="metaLabel">What happened</span>
                    <p>{selectedScenario.summary}</p>
                  </article>
                  <article className="workspaceInlineCard">
                    <span className="metaLabel">Why this matters now</span>
                    <p>{selectedScenario.sourceOpportunity?.whyNow ?? selectedScenario.signalSummary ?? "No urgency summary is attached yet."}</p>
                  </article>
                  <article className="workspaceInlineCard">
                    <span className="metaLabel">Affected channel or surface</span>
                    <p>{selectedScenario.sourceOpportunity?.sourceName ?? "Unspecified signal source"}</p>
                  </article>
                  <article className="workspaceInlineCard">
                    <span className="metaLabel">Last meaningful outcome</span>
                    <p>{selectedScenario.outcome?.summary ?? "No outcome has been recorded yet."}</p>
                  </article>
                </div>
              </section>

              <section className="workspaceSection">
                <div className="workspaceSectionTitleRow">
                  <h3>Context timeline</h3>
                </div>
                <div className="workspaceTimeline">
                  {timeline.map((item) => (
                    <article className="workspaceTimelineItem" id={item.id} key={item.id}>
                      <div className="workspaceTimelineDot" />
                      <div>
                        <strong>{item.title}</strong>
                        <p className="muted">{item.detail}</p>
                        <p className="workspaceTimestamp">{formatDateTime(item.at)}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="workspaceSection">
                <div className="workspaceSectionTitleRow">
                  <h3>Scenario brief</h3>
                </div>
                <div className="workspaceContextGrid">
                  <article className="workspaceInlineCard">
                    <span className="metaLabel">Originating intake</span>
                    <p>
                      {selectedScenario.sourceOpportunity
                        ? `${selectedScenario.sourceOpportunity?.title ?? "Untitled intake"} · ${formatEnumLabel(selectedScenario.sourceOpportunity?.status ?? "INTAKE")}`
                        : "This scenario no longer has a linked intake record."}
                    </p>
                    {selectedScenario.sourceOpportunity ? (
                      <Link
                        className="button buttonSecondary"
                        href={{
                          pathname: "/app/opportunities",
                          query: { opportunity: selectedScenario.sourceOpportunity!.id },
                        }}
                      >
                        Open intake record
                      </Link>
                    ) : null}
                  </article>
                  <article className="workspaceInlineCard">
                    <span className="metaLabel">User problem or demand</span>
                    <p>{selectedScenario.sourceOpportunity?.briefQuestion ?? selectedScenario.summary}</p>
                  </article>
                  <article className="workspaceInlineCard">
                    <span className="metaLabel">Target audience</span>
                    <p>{selectedScenario.sourceOpportunity?.briefAudience ?? "Audience not captured yet."}</p>
                  </article>
                  <article className="workspaceInlineCard">
                    <span className="metaLabel">Scenario hypothesis</span>
                    <p>{selectedScenario.scenarioGoal ?? selectedScenario.playbook?.summary ?? "No reusable hypothesis is attached yet."}</p>
                  </article>
                  <article className="workspaceInlineCard">
                    <span className="metaLabel">Relevant playbook</span>
                    <p>{selectedScenario.playbook?.name ?? "No playbook linked"}</p>
                  </article>
                  <article className="workspaceInlineCard workspaceInlineCardSpan2">
                    <span className="metaLabel">Attached evidence summary</span>
                    {selectedScenario.evidenceLinks.length === 0 ? (
                      <p>No evidence assets are linked yet.</p>
                    ) : (
                      <div className="workspaceList">
                        {selectedScenario.evidenceLinks.map((link) => (
                          <div className="workspaceListRow" key={link.evidenceAsset.id}>
                            <div>
                              <strong>{link.evidenceAsset.title}</strong>
                              <p className="muted">
                                {link.evidenceAsset.proofAssetType} · {formatEnumLabel(link.evidenceAsset.readiness)}
                              </p>
                            </div>
                            <span className="pill">{link.isPrimary ? "Primary" : "Linked"}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </article>
                </div>
              </section>

              <section className="workspaceSection">
                <div className="workspaceSectionTitleRow">
                  <h3>Execution children</h3>
                </div>
                <div className="workspaceLaneGrid">
                  {(["Now", "Waiting", "Done"] as const).map((lane) => {
                    const laneTasks = selectedScenario.tasks.filter((task) => getTaskLaneLabel(task.status) === lane);
                    return (
                      <article className="workspaceLaneCard" key={lane}>
                        <h4>{lane}</h4>
                        {laneTasks.length === 0 ? (
                          <p className="muted">No tasks in this lane.</p>
                        ) : (
                          <div className="workspaceList">
                            {laneTasks.map((task) => (
                              <div className="workspaceListRow" key={task.id}>
                                <div>
                                  <strong>{task.title}</strong>
                                  <p className="muted">
                                    {formatEnumLabel(task.kind)} · {task.owner?.name ?? "Unassigned"}
                                  </p>
                                </div>
                                <span className="pill">{formatEnumLabel(task.status)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </article>
                    );
                  })}
                  <article className="workspaceLaneCard workspaceArtifactsCard">
                    <h4>Child artifacts</h4>
                    {childArtifacts.length === 0 ? (
                      <p className="muted">No child artifacts or inherited draft handoffs are attached yet.</p>
                    ) : (
                      <div className="workspaceList">
                        {childArtifacts.map((artifact) => (
                          <div className="workspaceListRow" key={artifact.id}>
                            <div>
                              <strong>{artifact.title}</strong>
                              <p className="muted">
                                {artifact.artifactType} · {artifact.relationshipLabel}
                              </p>
                              {artifact.ownerName ? <p className="muted">Owner: {artifact.ownerName}</p> : null}
                            </div>
                            <span className="pill">{artifact.statusLabel}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </article>
                </div>
              </section>

              <section className="workspaceSection">
                <div className="workspaceSectionTitleRow">
                  <h3>Outcome</h3>
                </div>
                <article className="workspaceOutcomeCard">
                  <div className="workspaceOutcomeGrid">
                  <div>
                    <span className="metaLabel">Last action taken</span>
                    <p>{resolveNextAction(selectedScenario)}</p>
                  </div>
                    <div>
                      <span className="metaLabel">Observed result</span>
                      <p>{selectedScenario.outcome?.summary ?? "Outcome not recorded yet."}</p>
                    </div>
                    <div>
                      <span className="metaLabel">Confidence level</span>
                      <p>{selectedScenario.proofReadiness === "READY" ? "High" : selectedScenario.proofReadiness === "PARTIAL" ? "Medium" : "Low"}</p>
                    </div>
                    <div>
                      <span className="metaLabel">Follow-up required</span>
                      <p>{selectedScenario.outcome?.status === "RESOLVED" ? "No" : "Yes or undecided"}</p>
                    </div>
                  </div>
                </article>
              </section>
            </>
          )}
        </section>

        <aside className="card workspacePanel workspaceRailPanel">
          {!selectedScenario ? (
            <div className="workspaceEmptyState">
              <strong>Action rail is empty.</strong>
              <p className="muted">Select a scenario to load proof, approvals, blockers, and ownership context.</p>
            </div>
          ) : (
            <div className="workspaceRail">
              <section className="workspaceRailSection">
                <h2>Next best action</h2>
                <article className="workspaceActionCard">
                  <strong>
                    {resolveNextAction(selectedScenario)}
                  </strong>
                  <p className="muted">
                    {selectedScenario.playbook?.proofGuidance
                      ?? "Recommended action is derived from the linked scenario and current proof state."}
                  </p>
                  <div className="workspaceActionMeta">
                    <span>Owner: {selectedScenario.owner?.name ?? "Unassigned"}</span>
                    <span>Open blockers: {blockedTaskCount}</span>
                  </div>
                  <div className="buttonRow">
                    {selectedScenario.sourceOpportunity ? (
                      <Link
                        className="button buttonPrimary"
                        href={{
                          pathname: "/app/opportunities",
                          query: { opportunity: selectedScenario.sourceOpportunity!.id },
                        }}
                      >
                        Back to intake queue
                      </Link>
                    ) : null}
                    <Link
                      className="button buttonSecondary"
                      href={{
                        pathname: "/app",
                        query: { view: "blocked", scenario: selectedScenario.id },
                      }}
                    >
                      Re-check blockers
                    </Link>
                  </div>
                </article>
              </section>

              <section className="workspaceRailSection">
                <h2>Blockers</h2>
                {blockerItems.length === 0 ? (
                  <article className="workspaceRailCard">
                    <strong>No active blocker is stopping progress.</strong>
                    <p className="muted">Remaining risk lives in proof completeness, approvals, and task execution timing.</p>
                  </article>
                ) : (
                  <div className="workspaceChecklist">
                    {blockerItems.map((blocker) => (
                      <article className="workspaceChecklistItem workspaceDecisionCard" key={blocker.id}>
                        <div className="workspaceChecklistHeader">
                          <strong>{blocker.summary}</strong>
                          <span className={`workspaceToneBadge workspaceToneBadge${blocker.tone}`}>
                            {blocker.typeLabel}
                          </span>
                        </div>
                        <p className="workspaceDecisionMeta">
                          {blocker.ownerName ? `Owner: ${blocker.ownerName}` : "Owner not assigned"} · {blocker.typeLabel}
                        </p>
                        <p className="workspaceDecisionMeta">
                          {blocker.raisedAt ? `Raised ${formatRelativeTime(blocker.raisedAt)}` : "Raised time not recorded"}
                        </p>
                        <p className="workspaceDecisionMeta">Blocking object: {blocker.linkedObjectLabel}</p>
                        <p className="muted">{blocker.note}</p>
                      </article>
                    ))}
                  </div>
                )}
              </section>

              <section className="workspaceRailSection">
                <h2>Approvals</h2>
                <div className="workspaceChecklist">
                  {approvalItems.map((approval) => (
                    <article className="workspaceChecklistItem workspaceDecisionCard" key={approval.id}>
                      <div className="workspaceChecklistHeader">
                        <strong>{approval.summary}</strong>
                        <span className={`workspaceToneBadge workspaceToneBadge${approval.tone}`}>
                          {approval.statusLabel}
                        </span>
                      </div>
                      <p className="workspaceDecisionMeta">
                        {approval.approverName ? `Approver: ${approval.approverName}` : "Approver not assigned"} · {approval.typeLabel}
                      </p>
                      <p className="workspaceDecisionMeta">
                        {approval.requestedAt
                          ? `Requested ${formatDateTime(approval.requestedAt)}`
                          : approval.resolvedAt
                            ? `Resolved ${formatDateTime(approval.resolvedAt)}`
                            : "No approval request is active"}
                        {approval.deadlineAt ? ` · Due ${formatDateTime(approval.deadlineAt)}` : ""}
                      </p>
                      <p className="workspaceDecisionMeta">Target: {approval.targetLabel}</p>
                      <p className="muted">{approval.note}</p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="workspaceRailSection">
                <h2>Required proof</h2>
                {selectedScenario.prerequisites.length === 0 ? (
                  <p className="muted">No prerequisites are defined for this playbook yet.</p>
                ) : (
                  <div className="workspaceChecklist">
                    {selectedScenario.prerequisites.map((prerequisite) => (
                      <article className="workspaceChecklistItem" key={prerequisite.id}>
                        <div className="workspaceChecklistHeader">
                          <strong>{prerequisite.title}</strong>
                          <span className={`workspaceToneBadge workspaceToneBadge${getPrerequisiteTone(prerequisite.status)}`}>
                            {formatEnumLabel(prerequisite.status)}
                          </span>
                        </div>
                        <p className="muted">
                          {prerequisite.evidenceAsset
                            ? `${prerequisite.evidenceAsset.title} · ${formatEnumLabel(prerequisite.evidenceAsset.readiness)}`
                            : prerequisite.blockingReason ?? prerequisite.description ?? "No satisfying proof is linked yet."}
                        </p>
                        <p className="workspaceChecklistMeta">
                          Owner: {prerequisite.owner?.name ?? prerequisite.playbookPrerequisite?.ownerRole ?? "Unassigned"}
                        </p>
                      </article>
                    ))}
                  </div>
                )}
              </section>

              <section className="workspaceRailSection">
                <h2>Escalate or reassign</h2>
                <article className="workspaceRailCard">
                  <p className="muted">
                    Owner: {selectedScenario.owner?.name ?? "Unassigned"} · Due {formatDate(selectedScenario.sourceOpportunity?.dueDate)}
                  </p>
                  <p className="muted">
                    {latestEscalation
                      ? `Current escalation: ${latestEscalation?.targetLabel ?? "Escalation target unavailable"}`
                      : "No active escalation has been recorded yet."}
                  </p>
                  {latestOwnershipEvent ? (
                    <p className="workspaceChecklistMeta">
                      Last changed {formatRelativeTime(latestOwnershipEvent.createdAt)} by {latestOwnershipEvent.actorName ?? "System"}:{" "}
                      {latestOwnershipEvent.summary.toLowerCase()}
                    </p>
                  ) : (
                    <p className="workspaceChecklistMeta">No ownership or escalation audit note is attached yet.</p>
                  )}
                  {latestOwnershipEvent ? (
                    <p>
                      <a className="workspaceInlineLink" href={`#${latestOwnershipEvent.anchorId}`}>
                        View latest audit note
                      </a>
                    </p>
                  ) : null}
                  {ownershipNotice ? (
                    <p className="workflowInlineNotice">{ownershipNotice}</p>
                  ) : null}
                  {scenarioIsReadOnly ? (
                    <p className="muted">
                      This scenario is closed, so ownership and escalation are view-only.
                    </p>
                  ) : !canMutateOwnership ? (
                    <p className="muted">
                      You can view ownership history, but only authorized leads can reassign or escalate this scenario.
                    </p>
                  ) : !hasEligibleOwners ? (
                    <p className="muted">
                      No eligible owners are available right now. Ask an admin to update scenario routing.
                    </p>
                  ) : (
                    <>
                      <div className="buttonRow workspaceMutationActions">
                        <Link
                          className={`button ${ownershipMode === "reassign" ? "buttonPrimary" : "buttonSecondary"}`}
                          href={{
                            pathname: "/app",
                            query: buildWorkspaceQuery({
                              view: selectedView,
                              scenario: selectedScenario.id,
                              scenarioType: queueFilters.scenarioTypeId,
                              urgency: queueFilters.urgency,
                              owner: queueFilters.ownerId,
                              account: queueFilters.accountId,
                              freshness: queueFilters.freshness !== "any" ? queueFilters.freshness : undefined,
                              sort: queueFilters.sort,
                              ownershipMode: "reassign",
                            }),
                          }}
                        >
                          Reassign owner
                        </Link>
                        <Link
                          className={`button ${ownershipMode === "escalate" ? "buttonPrimary" : "buttonSecondary"}`}
                          href={{
                            pathname: "/app",
                            query: buildWorkspaceQuery({
                              view: selectedView,
                              scenario: selectedScenario.id,
                              scenarioType: queueFilters.scenarioTypeId,
                              urgency: queueFilters.urgency,
                              owner: queueFilters.ownerId,
                              account: queueFilters.accountId,
                              freshness: queueFilters.freshness !== "any" ? queueFilters.freshness : undefined,
                              sort: queueFilters.sort,
                              ownershipMode: "escalate",
                            }),
                          }}
                        >
                          {escalationButtonLabel}
                        </Link>
                      </div>
                      {ownershipError ? (
                        <p className="workflowInlineError">{ownershipError}</p>
                      ) : null}
                      {ownershipMode === "reassign" ? (
                        <form action={reassignScenarioOwnerAction} className="workspaceMutationForm">
                          <WorkspaceContextFields
                            queueFilters={queueFilters}
                            selectedScenarioId={selectedScenario.id}
                            selectedView={selectedView}
                          />
                          <input name="ownershipMode" type="hidden" value="reassign" />
                          <input name="scenarioId" type="hidden" value={selectedScenario.id} />
                          {reassignOptions.length === 0 ? (
                            <p className="muted">
                              No eligible owners are available right now. Ask an admin to update scenario routing.
                            </p>
                          ) : (
                            <>
                              <label className="field">
                                <span>New owner</span>
                                <select className="workflowSelect" defaultValue={reassignmentTargetId} name="newOwnerId" required>
                                  <option value="">Select an owner</option>
                                  {reassignOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              </label>
                              <label className="field">
                                <span>Reason for reassignment</span>
                                <textarea
                                  defaultValue={ownershipReason}
                                  minLength={12}
                                  name="reason"
                                  required
                                  rows={4}
                                />
                              </label>
                              <p className="muted">
                                Use reassignment when the scenario should stay active, but a different operator should own the next step.
                              </p>
                              <div className="buttonRow workspaceMutationActions">
                                <button className="button buttonPrimary" type="submit">
                                  Submit reassignment
                                </button>
                                <Link
                                  className="button buttonSecondary"
                                  href={{
                                    pathname: "/app",
                                    query: buildWorkspaceQuery({
                                      view: selectedView,
                                      scenario: selectedScenario.id,
                                      scenarioType: queueFilters.scenarioTypeId,
                                      urgency: queueFilters.urgency,
                                      owner: queueFilters.ownerId,
                                      account: queueFilters.accountId,
                                      freshness: queueFilters.freshness !== "any" ? queueFilters.freshness : undefined,
                                      sort: queueFilters.sort,
                                    }),
                                  }}
                                >
                                  Cancel
                                </Link>
                              </div>
                            </>
                          )}
                        </form>
                      ) : null}
                      {ownershipMode === "escalate" ? (
                        <form action={escalateScenarioAction} className="workspaceMutationForm">
                          <WorkspaceContextFields
                            queueFilters={queueFilters}
                            selectedScenarioId={selectedScenario.id}
                            selectedView={selectedView}
                          />
                          <input name="ownershipMode" type="hidden" value="escalate" />
                          <input name="scenarioId" type="hidden" value={selectedScenario.id} />
                          <label className="field">
                            <span>Escalation target</span>
                            <select
                              className="workflowSelect"
                              defaultValue={escalationTargetId}
                              name="escalationTargetId"
                              required
                            >
                              <option value="">Select a target</option>
                              {workspaceData.ownershipOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="field">
                            <span>Escalation owner</span>
                            <select
                              className="workflowSelect"
                              defaultValue={escalationOwnerId}
                              name="escalationOwnerId"
                              required
                            >
                              <option value="">Select an owner</option>
                              {workspaceData.ownershipOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="field">
                            <span>Reason for escalation</span>
                            <textarea
                              defaultValue={ownershipReason}
                              minLength={12}
                              name="reason"
                              required
                              rows={4}
                            />
                          </label>
                          <p className="muted">
                            Use escalation when the current path cannot proceed without higher authority, cross-team action, or exception handling.
                          </p>
                          <div className="buttonRow workspaceMutationActions">
                            <button className="button buttonPrimary" type="submit">
                              Submit escalation
                            </button>
                            <Link
                              className="button buttonSecondary"
                              href={{
                                pathname: "/app",
                                query: buildWorkspaceQuery({
                                  view: selectedView,
                                  scenario: selectedScenario.id,
                                  scenarioType: queueFilters.scenarioTypeId,
                                  urgency: queueFilters.urgency,
                                  owner: queueFilters.ownerId,
                                  account: queueFilters.accountId,
                                  freshness: queueFilters.freshness !== "any" ? queueFilters.freshness : undefined,
                                  sort: queueFilters.sort,
                                }),
                              }}
                            >
                              Cancel
                            </Link>
                          </div>
                        </form>
                      ) : null}
                    </>
                  )}
                </article>
              </section>
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}
