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
import { requireUser } from "@/server/auth";
import { prisma } from "@/server/db/client";
import { saveFounderOnboardingAction } from "@/app/app/founder-actions";
import { resolvePilotCommercialState, resolvePilotInvoiceStatus } from "@/server/pilots/commercial";
import {
  WORKSPACE_VIEWS,
  type WorkspaceScenario,
  getScenarioWorkspaceData,
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

function buildTimeline(selectedScenario: WorkspaceScenario) {
  const items = [
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
    ...selectedScenario.artifacts.map((artifact) => ({
      id: `artifact-${artifact.id}`,
      title: "Artifact updated",
      detail: `${artifact.title} is in ${formatEnumLabel(artifact.status).toLowerCase()}.`,
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

  return items.sort((left, right) => left.at.getTime() - right.at.getTime()).slice(-10);
}

export default async function WorkspacePage({ searchParams }: PageProps) {
  const session = await requireUser("VIEWER");
  const params = (await searchParams) ?? {};
  const error = getMessage(params.error);
  const selectedView = parseWorkspaceView(params.view);
  const selectedScenarioId = getMessage(params.scenario);
  const notice = getMessage(params.notice);

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
      const isOnboardingComplete = Boolean(pilot.onboardingCompletedAt);
      const commercial = resolvePilotCommercialState(pilot, session.user.id);
      const workspaceAccess = commercial.workspaceAccess;

      if (!workspaceAccess?.hasAccess) {
        redirect(`/sign-in?error=${encodeURIComponent(workspaceAccess?.reason ?? "Workspace access is unavailable.")}`);
      }

      const openInvoice = commercial.billing.activeInvoice;
      const founderAction =
        pilot.status === PilotStatus.WAITING_ON_FOUNDER
          ? pilot.currentRequest ?? "Flowvory needs an update from you before the audit can continue."
          : isOnboardingComplete
            ? "No action required right now."
            : "Complete the onboarding inputs so the audit can begin.";

      return (
        <main className="shell dashboard workspacePage">
          <header className="topbar workspaceHeader">
            <div className="topbarInner workspaceHeaderInner">
              <div>
                <div className="eyebrow">Founder workspace</div>
                <h1 style={{ fontSize: "2.5rem", margin: "12px 0 0" }}>{pilot.brandName}</h1>
                <p className="muted workspaceIntro">
                  This workspace tracks your Flowvory pilot status, required inputs, and delivered outputs.
                </p>
              </div>
              <div className="workspaceHeaderActions">
                <div className="pill">{formatEnumLabel(pilot.status)}</div>
              </div>
            </div>
            <nav className="workspaceNav card" aria-label="Founder workspace navigation">
              <a className="workspaceNavLink workspaceNavLinkActive" href="#overview">Overview</a>
              <a className="workspaceNavLink" href="#inputs">Inputs</a>
              <a className="workspaceNavLink" href="#findings">Findings</a>
              <a className="workspaceNavLink" href="#action-plan">Action plan</a>
            </nav>
          </header>

          {error ? (
            <section className="card dashboardCard workflowMessage workflowMessageError">{error}</section>
          ) : null}
          {notice ? (
            <section className="card dashboardCard workflowMessage workflowMessageNotice">{notice}</section>
          ) : null}

          <section className="statsGrid dashboardHeader workspaceStats" id="overview">
            <article className="card dashboardCard">
              <p className="muted">Current stage</p>
              <p className="workspaceStatLabel">{formatEnumLabel(pilot.status)}</p>
            </article>
            <article className="card dashboardCard">
              <p className="muted">Next milestone</p>
              <p className="workspaceStatLabel">{formatDate(pilot.targetDeliveryDate)}</p>
            </article>
            <article className="card dashboardCard">
              <p className="muted">Required action</p>
              <p className="workspaceStatLabel">{founderAction}</p>
            </article>
            <article className="card dashboardCard">
              <p className="muted">Manual invoice</p>
              <p className="workspaceStatLabel">
                {openInvoice
                  ? `${formatEnumLabel(openInvoice.status)} · $${(openInvoice.amountCents / 100).toFixed(2)}`
                  : "No open invoice"}
              </p>
            </article>
          </section>

          <section className="workspaceQuestionGrid">
            <article className="workspaceQuestionCard">
              <span className="metaLabel">What Flowvory is doing now</span>
              <p>{pilot.currentStageNote ?? "The audit team is reviewing your workspace and next milestone."}</p>
            </article>
            <article className="workspaceQuestionCard">
              <span className="metaLabel">What Flowvory needs from you</span>
              <p>{founderAction}</p>
            </article>
            <article className="workspaceQuestionCard">
              <span className="metaLabel">Primary business question</span>
              <p>{pilot.businessQuestion}</p>
            </article>
          </section>

          <section className="workspaceGrid" id="inputs">
            <section className="card workspacePanel workspaceDetailPanel">
              <section className="workspaceSection">
                <div className="workspaceSectionTitleRow">
                  <h3>Onboarding inputs</h3>
                </div>
                <form action={saveFounderOnboardingAction} className="stack">
                  <input name="pilotId" type="hidden" value={pilot.id} />
                  <div className="workflowFormGrid">
                    <label className="field">
                      <span>Brand name</span>
                      <input defaultValue={pilot.brandName} name="brandName" required />
                    </label>
                    <label className="field">
                      <span>Website URL</span>
                      <input defaultValue={pilot.websiteUrl} name="websiteUrl" required />
                    </label>
                    <label className="field">
                      <span>Store platform</span>
                      <input defaultValue={pilot.storePlatform ?? ""} name="storePlatform" />
                    </label>
                    <label className="field">
                      <span>Target geography</span>
                      <input defaultValue={pilot.targetGeography ?? ""} name="targetGeography" />
                    </label>
                    <label className="field workflowFieldSpan2">
                      <span>Priority surfaces</span>
                      <textarea defaultValue={pilot.prioritySurfaces.join("\n")} name="prioritySurfaces" rows={3} />
                    </label>
                    <label className="field workflowFieldSpan2">
                      <span>Top competitors or substitutes</span>
                      <textarea defaultValue={pilot.topCompetitors.join("\n")} name="topCompetitors" rows={3} />
                    </label>
                    <label className="field workflowFieldSpan2">
                      <span>Primary business question</span>
                      <textarea defaultValue={pilot.businessQuestion} name="businessQuestion" rows={3} required />
                    </label>
                    <label className="field workflowFieldSpan2">
                      <span>Supporting context</span>
                      <textarea defaultValue={pilot.supportingContext ?? ""} name="supportingContext" rows={4} />
                    </label>
                  </div>
                  <div className="buttonRow">
                    <button className="button buttonPrimary" type="submit">
                      Save inputs
                    </button>
                  </div>
                </form>
              </section>

              <section className="workspaceSection" id="findings">
                <div className="workspaceSectionTitleRow">
                  <h3>Findings</h3>
                </div>
                <article className="workspaceInlineCard">
                  <p>{pilot.findingsSummary ?? "Findings will appear here once Flowvory publishes the audit output."}</p>
                </article>
              </section>

              <section className="workspaceSection" id="action-plan">
                <div className="workspaceSectionTitleRow">
                  <h3>30-day action plan</h3>
                </div>
                <article className="workspaceInlineCard">
                  <p>{pilot.actionPlan ?? "Your action plan will be published here when the audit is delivered."}</p>
                </article>
              </section>
            </section>

            <aside className="card workspacePanel workspaceRail">
              <section className="workspaceRailSection">
                <h2>Workspace status</h2>
                <div className="workspaceList">
                  <div className="workspaceListRow">
                    <span>Invite accepted</span>
                    <span>{formatDate(founderMembership.acceptedAt)}</span>
                  </div>
                  <div className="workspaceListRow">
                    <span>Inputs completed</span>
                    <span>{formatDate(pilot.onboardingCompletedAt)}</span>
                  </div>
                  <div className="workspaceListRow">
                    <span>Target delivery</span>
                    <span>{formatDate(pilot.targetDeliveryDate)}</span>
                  </div>
                  <div className="workspaceListRow">
                    <span>Delivered</span>
                    <span>{formatDate(pilot.deliveredAt)}</span>
                  </div>
                </div>
              </section>

              <section className="workspaceRailSection">
                <h2>Commercial status</h2>
                <div className="workspaceList">
                  <div className="workspaceListRow">
                    <span>Billing provider</span>
                    <span>{commercial.billing.provider}</span>
                  </div>
                  <div className="workspaceListRow">
                    <span>Workspace entitlement</span>
                    <span>{workspaceAccess.source}</span>
                  </div>
                  {pilot.invoices.length === 0 ? (
                    <p className="muted">No invoice has been attached yet.</p>
                  ) : (
                    pilot.invoices.map((invoice) => (
                      <div className="workspaceListRow" key={invoice.id}>
                        <div>
                          <strong>{invoice.invoiceNumber}</strong>
                          <p className="muted">{invoice.description}</p>
                        </div>
                        <span className="pill">{formatEnumLabel(resolvePilotInvoiceStatus(invoice))}</span>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </aside>
          </section>
        </main>
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

  const workspaceData = await getScenarioWorkspaceData(prisma, {
    userId: session.user.id,
    view: selectedView,
    selectedScenarioId,
  });

  const selectedScenario = workspaceData.selectedScenario;
  const selectedViewMeta = getWorkspaceViewMeta(selectedView);
  const timeline = selectedScenario ? buildTimeline(selectedScenario) : [];
  const queueTotal = workspaceData.scenarios.length;
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

  return (
    <main className="shell dashboard workspacePage">
      <header className="topbar workspaceHeader">
        <div className="topbarInner workspaceHeaderInner">
          <div>
            <div className="eyebrow">Invite-only audit workspace</div>
            <h1 style={{ fontSize: "2.5rem", margin: "12px 0 0" }}>Flowvory workspace</h1>
            <p className="muted workspaceIntro">
              Review active audits, track what changed, and keep proof, approvals, and next actions
              visible in one place.
            </p>
          </div>
          <div className="workspaceHeaderActions">
            <div className="pill">{session.user.role}</div>
            <Link className="button buttonSecondary" href="/app/opportunities">
              Open intake queue
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
              ? selectedScenario.recommendedNextAction ?? selectedScenario.playbook?.recommendedNextAction ?? "Review the scenario and set the next operator action."
              : "Choose a scenario to see the recommended next action and proof requirements."}
          </p>
        </article>
      </section>

      <section className="workspaceGrid">
        <aside className="card workspacePanel workspaceQueuePanel">
          <div className="workspacePanelHeader">
            <div>
              <h2>Queue</h2>
              <p className="muted" style={{ marginTop: 8 }}>{selectedViewMeta.description}</p>
            </div>
          </div>
          <div className="workspaceViewList">
            {WORKSPACE_VIEWS.map((view) => {
              const count = workspaceData.viewCounts.find((entry) => entry.key === view.key)?.count ?? 0;
              return (
                <Link
                  className={`workspaceViewLink${selectedView === view.key ? " workspaceViewLinkActive" : ""}`}
                  href={{
                    pathname: "/app",
                    query: { view: view.key },
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
                <p className="muted">Shift to another saved view or capture new intake from the queue.</p>
              </div>
            ) : (
              workspaceData.scenarios.map((scenario) => {
                const health = getHealthTone(scenario);
                return (
                  <Link
                    className={`workspaceQueueCard${selectedScenario?.id === scenario.id ? " workspaceQueueCardActive" : ""}`}
                    href={{
                      pathname: "/app",
                      query: { view: selectedView, scenario: scenario.id },
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
                      Next: {scenario.recommendedNextAction ?? scenario.playbook?.recommendedNextAction ?? "Review the scenario context."}
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
                  <h3>Situation summary</h3>
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
                    <article className="workspaceTimelineItem" key={item.id}>
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
                  <h3>Scenario context</h3>
                </div>
                <div className="workspaceContextGrid">
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
                  <h3>Task and artifact lane</h3>
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
                    <h4>Artifacts</h4>
                    {selectedScenario.artifacts.length === 0 ? (
                      <p className="muted">No child artifacts are attached yet.</p>
                    ) : (
                      <div className="workspaceList">
                        {selectedScenario.artifacts.map((artifact) => (
                          <div className="workspaceListRow" key={artifact.id}>
                            <div>
                              <strong>{artifact.title}</strong>
                              <p className="muted">
                                {artifact.artifactType} · Created from this scenario
                              </p>
                            </div>
                            <span className="pill">{formatEnumLabel(artifact.status)}</span>
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
                      <p>{selectedScenario.recommendedNextAction ?? "No recommended action recorded."}</p>
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
                    {selectedScenario.recommendedNextAction
                      ?? selectedScenario.playbook?.recommendedNextAction
                      ?? "Review scenario context and choose the next operator action."}
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
                    <Link className="button buttonPrimary" href="/app/opportunities">
                      Review signal intake
                    </Link>
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
                <h2>Approvals</h2>
                <article className="workspaceRailCard">
                  <div className="workspaceChecklistHeader">
                    <strong>{formatEnumLabel(selectedScenario.approvalStatus)}</strong>
                    <span className={`workspaceToneBadge workspaceToneBadge${selectedScenario.approvalStatus === "APPROVED" || selectedScenario.approvalStatus === "NOT_REQUIRED" ? "success" : selectedScenario.approvalStatus === "PENDING" ? "warning" : "danger"}`}>
                      {selectedScenario.approvalStatus === "NOT_REQUIRED" ? "No approval gate" : "Approval state"}
                    </span>
                  </div>
                  <p className="muted">
                    {selectedScenario.approvalStatus === "PENDING"
                      ? "Execution should pause until the pending approval resolves."
                      : selectedScenario.approvalStatus === "REJECTED"
                        ? "Approval was rejected and needs revision or escalation."
                        : "No additional approval record is blocking this scenario right now."}
                  </p>
                </article>
              </section>

              <section className="workspaceRailSection">
                <h2>Blockers</h2>
                <article className="workspaceRailCard">
                  {selectedScenario.blockedReason ? (
                    <>
                      <strong>{selectedScenario.blockedReason}</strong>
                      <p className="muted">Raised from the current proof or approval state on this scenario.</p>
                    </>
                  ) : (
                    <p className="muted">No scenario-level blocker is recorded. Remaining risk lives in proof completeness and task execution.</p>
                  )}
                </article>
              </section>

              <section className="workspaceRailSection">
                <h2>Escalate or reassign</h2>
                <article className="workspaceRailCard">
                  <p className="muted">
                    Owner: {selectedScenario.owner?.name ?? "Unassigned"} · Due{" "}
                    {formatDate(selectedScenario.sourceOpportunity?.dueDate)}
                  </p>
                  <p className="muted">
                    Reassign and escalation mutations should stay behind explicit product review.
                    This shell exposes the operating context without guessing on dedicated UX flows.
                  </p>
                </article>
              </section>
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}
