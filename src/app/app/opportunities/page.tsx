import { TaskStatus, OpportunityStatus } from "@prisma/client";
import Link from "next/link";

import { AppShellNav } from "@/components/app-shell-nav";
import { requireUser } from "@/server/auth";
import { hasRequiredRole } from "@/server/auth/roles";
import { prisma } from "@/server/db/client";
import { getScenarioTypeOptionLabel, listActiveScenarioTypes } from "@/server/scenarios/service";

import { createOpportunityAction, updateOpportunityAction } from "./actions";

export const runtime = "nodejs";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function formatDateInput(value: Date | null) {
  if (!value) {
    return "";
  }

  return value.toISOString().slice(0, 10);
}

function getMessage(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getSectionTitle(status: OpportunityStatus) {
  if (status === OpportunityStatus.INTAKE) {
    return "New intake";
  }

  if (status === OpportunityStatus.TRIAGE) {
    return "Active triage";
  }

  if (status === OpportunityStatus.READY_FOR_DRAFT) {
    return "Ready for draft";
  }

  return "Archived or rejected";
}

function formatEnumLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getHealthLabel(input: {
  blockedReason: string | null;
  proofReadiness: string;
  status: string;
}) {
  if (input.status === "BLOCKED" || input.blockedReason || input.proofReadiness === "RESTRICTED") {
    return "Blocked";
  }

  if (input.proofReadiness === "PARTIAL") {
    return "At risk";
  }

  return "On track";
}

export default async function OpportunitiesPage({ searchParams }: PageProps) {
  const session = await requireUser("VIEWER");
  const canEdit = hasRequiredRole(session.user.role, "EDITOR");
  const params = (await searchParams) ?? {};
  const error = getMessage(params.error);
  const notice = getMessage(params.notice);
  const focusedOpportunityId = getMessage(params.opportunity);

  const [opportunities, users, scenarioTypes] = await Promise.all([
    prisma.opportunity.findMany({
      include: {
        owner: {
          select: {
            id: true,
            name: true,
          },
        },
        drafts: {
          select: {
            id: true,
          },
        },
        scenarioRecord: {
          select: {
            id: true,
            status: true,
            proofReadiness: true,
            blockedReason: true,
            recommendedNextAction: true,
            scenarioType: {
              select: {
                name: true,
              },
            },
            tasks: {
              where: {
                status: {
                  in: [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.BLOCKED],
                },
              },
              orderBy: [{ updatedAt: "desc" }],
              select: {
                id: true,
                title: true,
                kind: true,
                status: true,
                owner: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: [{ status: "asc" }, { priority: "desc" }, { capturedAt: "desc" }],
    }),
    prisma.user.findMany({
      orderBy: [{ role: "desc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        role: true,
      },
    }),
    listActiveScenarioTypes(prisma),
  ]);

  const scenarioOptions = scenarioTypes.map((type) => getScenarioTypeOptionLabel(type));
  const defaultScenarioOption = scenarioOptions[0] ?? "";

  const grouped = Object.values(OpportunityStatus).map((status) => ({
    status,
    items: opportunities.filter((opportunity) => opportunity.status === status),
  }));

  const queueCounts = {
    intake: grouped.find((group) => group.status === OpportunityStatus.INTAKE)?.items.length ?? 0,
    triage: grouped.find((group) => group.status === OpportunityStatus.TRIAGE)?.items.length ?? 0,
    ready:
      grouped.find((group) => group.status === OpportunityStatus.READY_FOR_DRAFT)?.items.length ?? 0,
    archived:
      grouped.find((group) => group.status === OpportunityStatus.ARCHIVED)?.items.length ?? 0,
  };

  return (
    <main className="shell dashboard workflowPage">
      <header className="topbar workspaceHeader">
        <div className="topbarInner workspaceHeaderInner">
          <div>
            <div className="eyebrow">Workspace support flow</div>
            <h1 style={{ fontSize: "2.5rem", margin: "12px 0 0" }}>Detached intake and triage support queue</h1>
            <p className="muted workspaceIntro">
              Capture new intake, qualify it against the active seeded scenario
              types, and hand it into the scenario workspace once the brief is complete enough for
              a downstream operator to execute.
            </p>
          </div>
          <div className="workspaceHeaderActions">
            <div className="pill">{session.user.role}</div>
            <Link className="button buttonSecondary" href="/app">
              Return to workspace
            </Link>
          </div>
        </div>
        <AppShellNav activeKey="workspace" />
      </header>

      <section className="card dashboardCard workflowMessage workflowMessageNotice">
        The primary shell lives in the scenario workspace. Use this page when intake needs cleanup,
        triage, or a linked source record from the active scenario.
      </section>

      <section className="statsGrid dashboardHeader">
        <article className="card dashboardCard">
          <p className="muted">New intake</p>
          <p className="statValue">{queueCounts.intake}</p>
        </article>
        <article className="card dashboardCard">
          <p className="muted">In triage</p>
          <p className="statValue">{queueCounts.triage}</p>
        </article>
        <article className="card dashboardCard">
          <p className="muted">Ready for draft</p>
          <p className="statValue">{queueCounts.ready}</p>
        </article>
        <article className="card dashboardCard">
          <p className="muted">Archived</p>
          <p className="statValue">{queueCounts.archived}</p>
        </article>
      </section>

      {error ? (
        <section className="card dashboardCard workflowMessage workflowMessageError">{error}</section>
      ) : null}
      {notice ? (
        <section className="card dashboardCard workflowMessage workflowMessageNotice">{notice}</section>
      ) : null}

      {canEdit ? (
        <section className="card dashboardCard workflowSection">
          <div className="workflowSectionHeader">
            <div>
              <h2>Capture opportunity</h2>
              <p className="muted" style={{ marginTop: 8 }}>
                The intake form matches the required weekly queue fields from the GTM operating
                loop.
              </p>
            </div>
          </div>
          <form action={createOpportunityAction} className="stack">
            <div className="workflowFormGrid">
              <label className="field">
                <span>Title</span>
                <input name="title" placeholder="Short opportunity title" required />
              </label>
              <label className="field">
                <span>Source</span>
                <input name="sourceName" placeholder="Search console, customer note, competitor page" required />
              </label>
              <label className="field workflowFieldSpan2">
                <span>Summary</span>
                <textarea
                  name="summary"
                  rows={3}
                  placeholder="What exactly was observed or captured?"
                  required
                />
              </label>
              <label className="field">
                <span>Source URL</span>
                <input name="sourceUrl" placeholder="https://..." />
              </label>
              <label className="field">
                <span>Priority scenario</span>
                <select name="scenario" defaultValue={defaultScenarioOption} className="workflowSelect">
                  {scenarioOptions.map((scenario) => (
                    <option key={scenario} value={scenario}>
                      {scenario}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field workflowFieldSpan2">
                <span>Why it matters now</span>
                <textarea
                  name="whyNow"
                  rows={3}
                  placeholder="Why this should enter the queue this week."
                  required
                />
              </label>
              <label className="field workflowFieldSpan2">
                <span>Suggested asset or distribution angle</span>
                <textarea
                  name="suggestedAssetAngle"
                  rows={3}
                  placeholder="How this could turn into a draft, placement, or distribution task."
                  required
                />
              </label>
              <label className="field">
                <span>Priority</span>
                <select name="priority" defaultValue="MEDIUM" className="workflowSelect">
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </label>
              <label className="field">
                <span>Owner</span>
                <select name="ownerId" defaultValue={users[0]?.id} className="workflowSelect">
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.role})
                    </option>
                  ))}
                </select>
              </label>
              <label className="field workflowFieldSpan2">
                <span>Tags</span>
                <input name="tags" placeholder="trust, serp, comparison" />
              </label>
            </div>
            <div className="buttonRow">
              <button className="button buttonPrimary" type="submit">
                Add opportunity
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <section className="stack">
        {grouped.map((group) => (
          <section className="card dashboardCard workflowSection" key={group.status}>
            <div className="workflowSectionHeader">
              <div>
                <h2>{getSectionTitle(group.status)}</h2>
                <p className="muted" style={{ marginTop: 8 }}>
                  {group.items.length} item{group.items.length === 1 ? "" : "s"} in this queue.
                </p>
              </div>
            </div>
            {group.items.length === 0 ? (
              <p className="muted">No opportunities in this state.</p>
            ) : (
              <div className="stack">
                {group.items.map((opportunity) => (
                  <form
                    action={updateOpportunityAction}
                    className={`workflowOpportunityCard${focusedOpportunityId === opportunity.id ? " workflowOpportunityCardActive" : ""}`}
                    id={`opportunity-${opportunity.id}`}
                    key={opportunity.id}
                  >
                    <input name="opportunityId" type="hidden" value={opportunity.id} />
                    <div className="workflowOpportunityHeader">
                      <div>
                        <h3 style={{ margin: 0 }}>{opportunity.title}</h3>
                        <p className="muted" style={{ marginTop: 8 }}>
                          Captured {opportunity.capturedAt.toLocaleDateString("en-US", { timeZone: "UTC" })} by{" "}
                          {opportunity.owner?.name ?? "Unassigned"}
                        </p>
                      </div>
                      <div className="workflowPillRow">
                        <span className="pill">{opportunity.priority}</span>
                        <span className="pill">{opportunity.status}</span>
                        <span className="pill">{opportunity.drafts.length} draft links</span>
                      </div>
                    </div>
                    {opportunity.scenarioRecord ? (
                      <section className="workflowScenarioSummary">
                        <div className="workflowScenarioSummaryHeader">
                          <div>
                            <div className="eyebrow">Linked scenario</div>
                            <strong>{opportunity.scenarioRecord.scenarioType.name}</strong>
                            {focusedOpportunityId === opportunity.id ? (
                              <p className="muted" style={{ marginTop: 8 }}>
                                This intake is currently being reviewed from the scenario workspace.
                              </p>
                            ) : null}
                          </div>
                          <Link
                            className="button buttonSecondary"
                            href={{ pathname: "/app", query: { scenario: opportunity.scenarioRecord.id } }}
                          >
                            Open workspace
                          </Link>
                        </div>
                        <div className="workflowScenarioMeta">
                          <span className="pill">{formatEnumLabel(opportunity.scenarioRecord.status)}</span>
                          <span className="pill">{getHealthLabel(opportunity.scenarioRecord)}</span>
                          <span className="pill">{formatEnumLabel(opportunity.scenarioRecord.proofReadiness)}</span>
                          <span className="pill">{opportunity.drafts.length} intake draft handoff{opportunity.drafts.length === 1 ? "" : "s"}</span>
                        </div>
                        <div className="workflowScenarioGrid">
                          <article className="workflowScenarioCard">
                            <span className="metaLabel">Next best action</span>
                            <p className="metaValue">
                              {opportunity.scenarioRecord.recommendedNextAction ?? "Review the scenario context."}
                            </p>
                          </article>
                          <article className="workflowScenarioCard">
                            <span className="metaLabel">Active task</span>
                            {opportunity.scenarioRecord.tasks[0] ? (
                              <div className="stack" style={{ gap: 6 }}>
                                <p className="metaValue">{opportunity.scenarioRecord.tasks[0].title}</p>
                                <p className="muted" style={{ margin: 0 }}>
                                  {formatEnumLabel(opportunity.scenarioRecord.tasks[0].kind)} ·{" "}
                                  {formatEnumLabel(opportunity.scenarioRecord.tasks[0].status)} ·{" "}
                                  {opportunity.scenarioRecord.tasks[0].owner?.name ?? "Unassigned"}
                                </p>
                              </div>
                            ) : (
                              <p className="metaValue">No open task</p>
                            )}
                          </article>
                        </div>
                        {opportunity.scenarioRecord.blockedReason ? (
                          <p className="workflowScenarioBlocker">
                            <strong>Blocker:</strong> {opportunity.scenarioRecord.blockedReason}
                          </p>
                        ) : null}
                      </section>
                    ) : null}
                    <div className="workflowFormGrid">
                      <label className="field">
                        <span>Title</span>
                        <input defaultValue={opportunity.title} name="title" required />
                      </label>
                      <label className="field">
                        <span>Source</span>
                        <input defaultValue={opportunity.sourceName} name="sourceName" required />
                      </label>
                      <label className="field workflowFieldSpan2">
                        <span>Summary</span>
                        <textarea defaultValue={opportunity.summary} name="summary" rows={3} required />
                      </label>
                      <label className="field">
                        <span>Source URL</span>
                        <input defaultValue={opportunity.sourceUrl ?? ""} name="sourceUrl" />
                      </label>
                      <label className="field">
                        <span>Priority scenario</span>
                        <select
                          className="workflowSelect"
                          defaultValue={opportunity.scenario ?? defaultScenarioOption}
                          name="scenario"
                        >
                          {scenarioOptions.map((scenario) => (
                            <option key={scenario} value={scenario}>
                              {scenario}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="field workflowFieldSpan2">
                        <span>Why it matters now</span>
                        <textarea defaultValue={opportunity.whyNow ?? ""} name="whyNow" rows={3} required />
                      </label>
                      <label className="field workflowFieldSpan2">
                        <span>Suggested asset or distribution angle</span>
                        <textarea
                          defaultValue={opportunity.suggestedAssetAngle ?? ""}
                          name="suggestedAssetAngle"
                          rows={3}
                          required
                        />
                      </label>
                      <label className="field">
                        <span>Priority</span>
                        <select className="workflowSelect" defaultValue={opportunity.priority} name="priority">
                          <option value="HIGH">High</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="LOW">Low</option>
                        </select>
                      </label>
                      <label className="field">
                        <span>Owner</span>
                        <select className="workflowSelect" defaultValue={opportunity.ownerId ?? ""} name="ownerId">
                          <option value="">Unassigned</option>
                          {users.map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.name} ({user.role})
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="field workflowFieldSpan2">
                        <span>Tags</span>
                        <input defaultValue={opportunity.tags.join(", ")} name="tags" />
                      </label>
                      <label className="field">
                        <span>Target audience</span>
                        <input defaultValue={opportunity.briefAudience ?? ""} name="briefAudience" />
                      </label>
                      <label className="field">
                        <span>Target question</span>
                        <input defaultValue={opportunity.briefQuestion ?? ""} name="briefQuestion" />
                      </label>
                      <label className="field">
                        <span>Asset type</span>
                        <input defaultValue={opportunity.assetType ?? ""} name="assetType" />
                      </label>
                      <label className="field">
                        <span>Key proof requirement</span>
                        <input defaultValue={opportunity.proofRequirement ?? ""} name="proofRequirement" />
                      </label>
                      <label className="field">
                        <span>Target CTA</span>
                        <input defaultValue={opportunity.targetCta ?? ""} name="targetCta" />
                      </label>
                      <label className="field">
                        <span>Due date</span>
                        <input defaultValue={formatDateInput(opportunity.dueDate)} name="dueDate" type="date" />
                      </label>
                      <label className="field workflowFieldSpan2">
                        <span>Rejection or archive note</span>
                        <textarea defaultValue={opportunity.rejectionReason ?? ""} name="rejectionReason" rows={2} />
                      </label>
                    </div>
                    {canEdit ? (
                      <div className="buttonRow">
                        <button className="button buttonSecondary" name="intent" type="submit" value="save">
                          Save details
                        </button>
                        {opportunity.status === OpportunityStatus.INTAKE ? (
                          <button className="button buttonSecondary" name="intent" type="submit" value="start-triage">
                            Move to triage
                          </button>
                        ) : null}
                        {opportunity.status === OpportunityStatus.INTAKE
                        || opportunity.status === OpportunityStatus.TRIAGE ? (
                          <button className="button buttonPrimary" name="intent" type="submit" value="ready">
                            Mark ready for draft
                          </button>
                        ) : null}
                        {opportunity.status !== OpportunityStatus.ARCHIVED ? (
                          <button className="button buttonSecondary" name="intent" type="submit" value="reject">
                            Reject / park
                          </button>
                        ) : null}
                        {opportunity.status !== OpportunityStatus.ARCHIVED ? (
                          <button className="button buttonSecondary" name="intent" type="submit" value="archive">
                            Archive
                          </button>
                        ) : null}
                      </div>
                    ) : null}
                  </form>
                ))}
              </div>
            )}
          </section>
        ))}
      </section>
    </main>
  );
}
