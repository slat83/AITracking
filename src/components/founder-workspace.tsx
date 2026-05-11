import type { PilotContactStatus, PilotInvoiceStatus, PilotStatus } from "@prisma/client";

import { saveFounderOnboardingAction } from "@/app/app/founder-actions";
import { resolvePilotInvoiceStatus, type PilotBillingSummary } from "@/server/pilots/commercial";
import { formatEnumLabel } from "@/server/pilots/workflow";

type FounderWorkspacePilot = {
  id: string;
  brandName: string;
  websiteUrl: string;
  status: PilotStatus;
  primaryContactName: string;
  primaryContactEmail: string;
  storePlatform: string | null;
  targetGeography: string | null;
  topCompetitors: string[];
  businessQuestion: string;
  currentRequest: string | null;
  currentStageNote: string | null;
  prioritySurfaces: string[];
  supportingContext: string | null;
  findingsSummary: string | null;
  actionPlan: string | null;
  targetDeliveryDate: Date | null;
  invitedAt: Date | null;
  onboardingStartedAt: Date | null;
  onboardingCompletedAt: Date | null;
  deliveredAt: Date | null;
  contacts: Array<{
    id: string;
    name: string;
    email: string;
    isPrimary: boolean;
    status: PilotContactStatus;
    acceptedAt: Date | null;
  }>;
  invoices: Array<{
    id: string;
    invoiceNumber: string;
    status: PilotInvoiceStatus;
    amountCents: number;
    description: string;
    dueAt: Date | null;
    sentAt: Date | null;
    paidAt: Date | null;
    voidedAt: Date | null;
    issuedAt: Date | null;
  }>;
};

type FounderWorkspaceProps = {
  pilot: FounderWorkspacePilot;
  acceptedAt: Date | null;
  error?: string;
  notice?: string;
  billing: PilotBillingSummary;
  workspaceAccessSource: string;
};

type ChecklistState = "Not started" | "In progress" | "Complete" | "Needs update";

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

function formatMoney(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function getChecklistState(input: {
  completed: number;
  total: number;
  needsUpdate: boolean;
}): ChecklistState {
  if (input.needsUpdate && input.completed < input.total) {
    return "Needs update";
  }

  if (input.completed === 0) {
    return "Not started";
  }

  if (input.completed === input.total) {
    return "Complete";
  }

  return "In progress";
}

function getChecklistTone(state: ChecklistState) {
  if (state === "Complete") {
    return "success";
  }

  if (state === "Needs update") {
    return "danger";
  }

  if (state === "In progress") {
    return "warning";
  }

  return "neutral";
}

function buildChecklist(pilot: FounderWorkspacePilot) {
  const needsUpdate = pilot.status === "WAITING_ON_FOUNDER";
  const items = [
    {
      title: "Brand basics",
      detail: "Brand name, website, store platform, and target geography.",
      completed: [pilot.brandName, pilot.websiteUrl, pilot.storePlatform, pilot.targetGeography].filter(Boolean).length,
      total: 4,
    },
    {
      title: "Priority surfaces",
      detail: "The pages and channels Flowvory should evaluate first.",
      completed: pilot.prioritySurfaces.length > 0 ? 1 : 0,
      total: 1,
    },
    {
      title: "Competitor set",
      detail: "Top competitors or substitutes that shape the review frame.",
      completed: pilot.topCompetitors.length > 0 ? 1 : 0,
      total: 1,
    },
    {
      title: "Business question",
      detail: "The primary growth or visibility question for this audit.",
      completed: pilot.businessQuestion ? 1 : 0,
      total: 1,
    },
    {
      title: "Supporting context",
      detail: "Launch timing, constraints, and any extra guidance for the audit.",
      completed: pilot.supportingContext ? 1 : 0,
      total: 1,
    },
  ].map((item) => {
    const state = getChecklistState({
      completed: item.completed,
      total: item.total,
      needsUpdate,
    });

    return {
      ...item,
      state,
      tone: getChecklistTone(state),
    };
  });

  const completedCount = items.filter((item) => item.state === "Complete").length;

  return {
    items,
    completedCount,
    totalCount: items.length,
  };
}

function buildUpdates(pilot: FounderWorkspacePilot, acceptedAt: Date | null) {
  return [
    {
      id: "invite",
      title: "Invite accepted",
      detail: "Workspace access was activated for the primary founder contact.",
      at: acceptedAt,
    },
    {
      id: "start",
      title: "Onboarding opened",
      detail: "Flowvory seeded the workspace and is waiting for the founder inputs below.",
      at: pilot.onboardingStartedAt ?? pilot.invitedAt,
    },
    {
      id: "ready",
      title: "Audit queued",
      detail: "The onboarding checklist is complete and the audit is ready to start.",
      at: pilot.onboardingCompletedAt,
    },
    {
      id: "delivered",
      title: "Delivery published",
      detail: "Findings and the 30-day action plan are available in this workspace.",
      at: pilot.deliveredAt,
    },
  ]
    .filter((item): item is { id: string; title: string; detail: string; at: Date } => Boolean(item.at))
    .sort((left, right) => left.at.getTime() - right.at.getTime());
}

function getFounderAction(pilot: FounderWorkspacePilot) {
  if (pilot.status === "WAITING_ON_FOUNDER") {
    return pilot.currentRequest ?? "Flowvory needs an update from you before the audit can continue.";
  }

  if (pilot.onboardingCompletedAt) {
    return "No action required right now.";
  }

  return "Complete the onboarding checklist so the audit can begin.";
}

function getFindingsNote(pilot: FounderWorkspacePilot) {
  if (pilot.findingsSummary) {
    return pilot.findingsSummary;
  }

  if (pilot.status === "DELIVERY_READY" || pilot.status === "DELIVERED" || pilot.status === "FOLLOW_UP") {
    return "Flowvory has prepared the audit output and will publish the summary here.";
  }

  return "The audit is still in progress, so findings are not complete yet.";
}

function getActionPlanNote(pilot: FounderWorkspacePilot) {
  if (pilot.actionPlan) {
    return pilot.actionPlan;
  }

  if (pilot.status === "DELIVERY_READY" || pilot.status === "DELIVERED" || pilot.status === "FOLLOW_UP") {
    return "The 30-day action plan is being finalized and will appear here when published.";
  }

  return "Your action plan will be published here when the audit is delivered.";
}

export function FounderWorkspace({
  pilot,
  acceptedAt,
  error,
  notice,
  billing,
  workspaceAccessSource,
}: FounderWorkspaceProps) {
  const checklist = buildChecklist(pilot);
  const founderAction = getFounderAction(pilot);
  const updates = buildUpdates(pilot, acceptedAt);
  const readinessLabel = `${checklist.completedCount} of ${checklist.totalCount} checklist sections complete`;
  const activeRequest = pilot.currentRequest ?? "No open founder request.";
  const primaryContact = pilot.contacts.find((contact) => contact.isPrimary) ?? null;
  const collaboratorCount = pilot.contacts.filter((contact) => !contact.isPrimary).length;
  const isOnboardingOpen = !pilot.onboardingCompletedAt;

  return (
    <main className="shell dashboard workspacePage">
      <header className="topbar workspaceHeader">
        <div className="topbarInner workspaceHeaderInner">
          <div>
            <div className="eyebrow">Founder workspace</div>
            <h1 style={{ fontSize: "2.5rem", margin: "12px 0 0" }}>{pilot.brandName}</h1>
            <p className="muted workspaceIntro">
              This workspace tracks your Flowvory pilot status, required inputs, delivered findings,
              and the next action expected from either side.
            </p>
          </div>
          <div className="workspaceHeaderActions">
            <div className="pill">{formatEnumLabel(pilot.status)}</div>
          </div>
        </div>
        <nav className="workspaceNav card" aria-label="Founder workspace navigation">
          <a className="workspaceNavLink workspaceNavLinkActive" href={isOnboardingOpen ? "#onboarding-guide" : "#overview"}>
            {isOnboardingOpen ? "Onboarding guide" : "Overview"}
          </a>
          {isOnboardingOpen ? <a className="workspaceNavLink" href="#overview">Overview</a> : null}
          <a className="workspaceNavLink" href="#inputs">Inputs</a>
          <a className="workspaceNavLink" href="#findings">Findings</a>
          <a className="workspaceNavLink" href="#action-plan">Action plan</a>
          <a className="workspaceNavLink" href="#messages">Messages</a>
          <a className="workspaceNavLink" href="#settings">Settings</a>
        </nav>
      </header>

      {error ? <section className="card dashboardCard workflowMessage workflowMessageError">{error}</section> : null}
      {notice ? <section className="card dashboardCard workflowMessage workflowMessageNotice">{notice}</section> : null}

      {isOnboardingOpen ? (
        <section className="card workspacePanel workspaceDetailPanel" id="onboarding-guide" style={{ marginBottom: 20 }}>
          <section className="workspaceSection">
            <div className="workspaceSectionTitleRow">
              <div>
                <div className="eyebrow">Onboarding guide</div>
                <h2 style={{ margin: "14px 0 0" }}>Complete these steps to start your audit</h2>
              </div>
              <span className="pill">{readinessLabel}</span>
            </div>
            <p className="muted">
              Work through the steps below, then save the inputs form. Once the required steps are complete,
              Flowvory can move this workspace to the audit queue.
            </p>
            <div className="buttonRow" style={{ marginTop: 0 }}>
              <a className="button buttonPrimary" href="#inputs">Start onboarding form</a>
              <a className="button buttonSecondary" href="#overview">See workspace status</a>
            </div>
            <div className="workspaceChecklist">
              {checklist.items.map((item, index) => (
                <article className="workspaceChecklistItem" key={`guide-${item.title}`}>
                  <div className="workspaceChecklistHeader">
                    <div>
                      <span className="metaLabel">Step {index + 1}</span>
                      <p style={{ marginTop: 8, fontSize: "1.1rem" }}><strong>{item.title}</strong></p>
                      <p className="workspaceChecklistMeta">{item.detail}</p>
                    </div>
                    <span className={`workspaceToneBadge workspaceToneBadge${item.tone}`}>{item.state}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </section>
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
          <p className="muted">Checklist progress</p>
          <p className="workspaceStatLabel">{readinessLabel}</p>
        </article>
      </section>

      <section className="workspaceQuestionGrid">
        <article className="workspaceQuestionCard">
          <span className="metaLabel">What Flowvory is doing now</span>
          <p>{pilot.currentStageNote ?? "The audit team is reviewing your workspace and preparing the next milestone."}</p>
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

      <section className="workspaceGrid">
        <section className="card workspacePanel workspaceDetailPanel">
          <section className="workspaceSection">
            <div className="workspaceSectionTitleRow">
              <h3>{isOnboardingOpen ? "Onboarding checklist" : "Completed onboarding checklist"}</h3>
              <span className="pill">{readinessLabel}</span>
            </div>
            <div className="workspaceChecklist">
              {checklist.items.map((item, index) => (
                <article className="workspaceChecklistItem" key={item.title}>
                  <div className="workspaceChecklistHeader">
                    <div>
                      <span className="metaLabel">Step {index + 1}</span>
                      <p style={{ marginTop: 8 }}><strong>{item.title}</strong></p>
                      <p className="workspaceChecklistMeta">{item.detail}</p>
                    </div>
                    <span className={`workspaceToneBadge workspaceToneBadge${item.tone}`}>{item.state}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="workspaceSection">
            <div className="workspaceSectionTitleRow">
              <h3>Recent updates</h3>
            </div>
            {updates.length === 0 ? (
              <article className="workspaceInlineCard">
                <p>Updates will appear here as the pilot moves from onboarding to delivery.</p>
              </article>
            ) : (
              <div className="workspaceTimeline">
                {updates.map((item) => (
                  <article className="workspaceTimelineItem" key={item.id}>
                    <span className="workspaceTimelineDot" aria-hidden="true" />
                    <div className="workspaceInlineCard">
                      <div className="workspaceChecklistHeader">
                        <strong>{item.title}</strong>
                        <span className="workspaceTimestamp">{formatDateTime(item.at)}</span>
                      </div>
                      <p>{item.detail}</p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="workspaceSection" id="inputs">
            <div className="workspaceSectionTitleRow">
              <h3>{isOnboardingOpen ? "Onboarding form" : "Inputs"}</h3>
            </div>
            <article className="workspaceInlineCard">
              <span className="metaLabel">{isOnboardingOpen ? "How to complete onboarding" : "Source inputs"}</span>
              <p>
                {isOnboardingOpen
                  ? "Fill in the form from top to bottom, then save. Brand basics, priority surfaces, competitor context, and the core business question should all be complete before the audit begins."
                  : "These are the source inputs Flowvory is currently using for your audit and delivery plan."}
              </p>
            </article>
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
                  <textarea defaultValue={pilot.businessQuestion} name="businessQuestion" required rows={3} />
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
            <div className="workspaceSummaryGrid">
              <article className="workspaceInlineCard">
                <span className="metaLabel">Diagnostic readout</span>
                <p>{getFindingsNote(pilot)}</p>
              </article>
              <article className="workspaceInlineCard">
                <span className="metaLabel">Completeness</span>
                <p>
                  {pilot.deliveredAt
                    ? "Published delivery is available in this workspace."
                    : "This audit is still partial until Flowvory publishes the final delivery."}
                </p>
              </article>
            </div>
          </section>

          <section className="workspaceSection" id="action-plan">
            <div className="workspaceSectionTitleRow">
              <h3>30-day action plan</h3>
            </div>
            <div className="workspaceSummaryGrid">
              <article className="workspaceInlineCard workspaceInlineCardSpan2">
                <span className="metaLabel">Next actions</span>
                <p>{getActionPlanNote(pilot)}</p>
              </article>
            </div>
          </section>

          <section className="workspaceSection" id="messages">
            <div className="workspaceSectionTitleRow">
              <h3>Messages</h3>
            </div>
            <div className="workspaceChecklist">
              <article className="workspaceChecklistItem">
                <div className="workspaceChecklistHeader">
                  <div>
                    <strong>Current founder request</strong>
                    <p className="workspaceChecklistMeta">{activeRequest}</p>
                  </div>
                  <span className={`workspaceToneBadge workspaceToneBadge${pilot.status === "WAITING_ON_FOUNDER" ? "danger" : "neutral"}`}>
                    {pilot.status === "WAITING_ON_FOUNDER" ? "Waiting on you" : "No blocker"}
                  </span>
                </div>
              </article>
              <article className="workspaceChecklistItem">
                <div className="workspaceChecklistHeader">
                  <div>
                    <strong>Latest Flowvory update</strong>
                    <p className="workspaceChecklistMeta">
                      {pilot.currentStageNote ?? "No manual update has been posted yet."}
                    </p>
                  </div>
                  <span className="workspaceToneBadge workspaceToneBadgeneutral">Updates log</span>
                </div>
              </article>
              <article className="workspaceChecklistItem">
                <div className="workspaceChecklistHeader">
                  <div>
                    <strong>Reply path</strong>
                    <p className="workspaceChecklistMeta">
                      Reply to the latest Flowvory email if you need to clarify inputs, unblock access, or respond to an open request.
                    </p>
                  </div>
                  <span className="workspaceToneBadge workspaceToneBadgeneutral">Manual in v1</span>
                </div>
              </article>
            </div>
          </section>

          <section className="workspaceSection" id="settings">
            <div className="workspaceSectionTitleRow">
              <h3>Settings</h3>
            </div>
            <div className="workspaceSummaryGrid">
              <article className="workspaceInlineCard">
                <span className="metaLabel">Workspace name</span>
                <p>{pilot.brandName}</p>
              </article>
              <article className="workspaceInlineCard">
                <span className="metaLabel">Primary contact</span>
                <p>{primaryContact?.name ?? pilot.primaryContactName}</p>
                <p className="workspaceChecklistMeta">{primaryContact?.email ?? pilot.primaryContactEmail}</p>
              </article>
              <article className="workspaceInlineCard">
                <span className="metaLabel">Collaborators</span>
                <p>{collaboratorCount === 0 ? "No collaborators added yet." : `${collaboratorCount} collaborator${collaboratorCount === 1 ? "" : "s"} linked`}</p>
              </article>
              <article className="workspaceInlineCard">
                <span className="metaLabel">Notifications</span>
                <p>Flowvory sends milestone and access updates by email in v1.</p>
              </article>
            </div>
          </section>
        </section>

        <aside className="card workspacePanel workspaceRail">
          <section className="workspaceRailSection">
            <h2>Workspace status</h2>
            <div className="workspaceList">
              <div className="workspaceListRow">
                <span>Invite accepted</span>
                <span>{formatDate(acceptedAt)}</span>
              </div>
              <div className="workspaceListRow">
                <span>Onboarding started</span>
                <span>{formatDate(pilot.onboardingStartedAt)}</span>
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
                <span>{billing.provider}</span>
              </div>
              <div className="workspaceListRow">
                <span>Open invoice</span>
                <span>{billing.activeInvoice ? formatMoney(billing.activeInvoice.amountCents) : "No open invoice"}</span>
              </div>
              <div className="workspaceListRow">
                <span>Workspace entitlement</span>
                <span>{workspaceAccessSource}</span>
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
                    <span className="pill">
                      {formatEnumLabel(resolvePilotInvoiceStatus(invoice))}
                    </span>
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
