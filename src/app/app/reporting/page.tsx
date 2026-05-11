import Link from "next/link";

import { AppShellNav } from "@/components/app-shell-nav";
import { requireUser } from "@/server/auth";
import { prisma } from "@/server/db/client";
import { getScenarioReportingDashboard, type ScenarioReportingMetrics } from "@/server/scenarios/reporting";

export const runtime = "nodejs";

function formatDate(value: Date) {
  return value.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatHours(value: number) {
  return `${value.toFixed(1)}h`;
}

function formatRate(value: number) {
  return `${value.toFixed(0)}%`;
}

function renderBreakdownRows(values: Record<string, number>, emptyLabel: string) {
  const entries = Object.entries(values).sort((left, right) => right[1] - left[1]);

  if (entries.length === 0) {
    return <p className="muted">{emptyLabel}</p>;
  }

  return (
    <div className="workspaceList">
      {entries.map(([label, count]) => (
        <div className="workspaceListRow" key={label}>
          <strong>{label.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())}</strong>
          <span className="pill">{count}</span>
        </div>
      ))}
    </div>
  );
}

function MetricsSection({ title, metrics }: { title: string; metrics: ScenarioReportingMetrics }) {
  return (
    <section className="card dashboardCard workflowSection">
      <div className="workflowSectionHeader">
        <div>
          <h2>{title}</h2>
          <p className="muted" style={{ marginTop: 8 }}>
            {formatDate(metrics.periodStart)} to {formatDate(metrics.periodEnd)}
          </p>
        </div>
      </div>

      <div className="statsGrid dashboardHeader">
        <article className="card dashboardCard">
          <p className="muted">Scenarios captured</p>
          <p className="statValue">{metrics.scenariosCaptured}</p>
        </article>
        <article className="card dashboardCard">
          <p className="muted">Triaged</p>
          <p className="statValue">{metrics.scenariosTriaged}</p>
        </article>
        <article className="card dashboardCard">
          <p className="muted">Next action created</p>
          <p className="statValue">{metrics.scenariosActivated}</p>
        </article>
        <article className="card dashboardCard">
          <p className="muted">Outcomes recorded</p>
          <p className="statValue">{metrics.outcomesRecorded}</p>
        </article>
      </div>

      <div className="workspaceSummaryGrid" style={{ marginTop: 24 }}>
        <article className="workspaceInlineCard">
          <span className="metaLabel">Average time to triage</span>
          <p>{formatHours(metrics.avgTimeToTriageHours)}</p>
        </article>
        <article className="workspaceInlineCard">
          <span className="metaLabel">Average time to next action</span>
          <p>{formatHours(metrics.avgTimeToNextActionHours)}</p>
        </article>
        <article className="workspaceInlineCard">
          <span className="metaLabel">Average approval latency</span>
          <p>{formatHours(metrics.avgApprovalLatencyHours)}</p>
        </article>
        <article className="workspaceInlineCard">
          <span className="metaLabel">Outcome capture rate</span>
          <p>{formatRate(metrics.outcomeCaptureRate)}</p>
        </article>
        <article className="workspaceInlineCard">
          <span className="metaLabel">Resolved outcome rate</span>
          <p>{formatRate(metrics.resolvedOutcomeRate)}</p>
        </article>
        <article className="workspaceInlineCard">
          <span className="metaLabel">Blocked in period</span>
          <p>{metrics.scenariosBlocked}</p>
        </article>
      </div>

      <div className="workspaceContextGrid" style={{ marginTop: 24 }}>
        <article className="workspaceInlineCard">
          <span className="metaLabel">Outcome mix</span>
          {renderBreakdownRows(metrics.outcomeBreakdown, "No outcomes landed in this period.")}
        </article>
        <article className="workspaceInlineCard">
          <span className="metaLabel">Blocker causes in period</span>
          {renderBreakdownRows(metrics.blockerCauseBreakdown, "No blockers landed in this period.")}
        </article>
      </div>
    </section>
  );
}

export default async function ReportingPage() {
  const session = await requireUser("VIEWER");
  const dashboard = await getScenarioReportingDashboard(prisma);

  return (
    <main className="shell dashboard workflowPage">
      <header className="topbar">
        <div className="topbarInner">
          <div>
            <div className="eyebrow">Reporting</div>
            <h1 style={{ fontSize: "2.5rem", margin: "12px 0 0" }}>Scenario performance reporting</h1>
            <p className="muted" style={{ marginTop: 10, maxWidth: 760 }}>
              Track queue progression, next-action speed, approval latency, outcome capture, and
              the blocker causes slowing scenario execution down.
            </p>
          </div>
          <div className="stack" style={{ justifyItems: "end" }}>
            <div className="pill">{session.user.role}</div>
            <Link className="button buttonSecondary" href="/app">
              Back to workspace
            </Link>
          </div>
        </div>
        <AppShellNav activeKey="reporting" />
      </header>

      <section className="card dashboardCard workflowSection">
        <div className="workflowSectionHeader">
          <div>
            <h2>Current blocker snapshot</h2>
            <p className="muted" style={{ marginTop: 8 }}>
              Active queue blockers grouped by their strongest current cause.
            </p>
          </div>
        </div>
        {renderBreakdownRows(dashboard.currentBlockers, "No active blockers in the queue.")}
      </section>

      <MetricsSection title="This week" metrics={dashboard.week} />
      <MetricsSection title="This month" metrics={dashboard.month} />
    </main>
  );
}
