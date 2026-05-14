import Link from "next/link";

import { AppShellNav } from "@/components/app-shell-nav";
import { DashboardWorkbench } from "@/components/dashboard-workbench";
import { buildRecommendationRunSummary } from "@/server/ai-recommendation-share/pipeline";
import { requireUser } from "@/server/auth";
import { prisma } from "@/server/db/client";
import { getDashboardSnapshot } from "@/server/dashboard/tracking";

export const runtime = "nodejs";

function formatSharePercentage(value: number | null) {
  return value === null ? "N/A" : `${(value * 100).toFixed(1)}%`;
}

async function getLatestRecommendationRunSnapshot() {
  try {
    const run = await prisma.aiRecommendationRun.findFirst({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        targetEntity: true,
        measurementWindow: true,
        createdAt: true,
        completedAt: true,
      },
    });

    if (!run) {
      return null;
    }

    const summary = await buildRecommendationRunSummary(run.id);
    return { run, summary };
  } catch (error) {
    console.error("Failed to load recommendation-share summary for /app/dashboard.", error);
    return null;
  }
}

export default async function DashboardPage() {
  const session = await requireUser("EDITOR");
  const dashboard = await getDashboardSnapshot();
  const latestRecommendationRun = await getLatestRecommendationRunSnapshot();

  return (
    <main className="shell dashboard workflowPage">
      <header className="topbar workspaceHeader">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/app"
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "8px 12px",
              borderRadius: 999,
              border: "1px solid var(--line)",
              background: "var(--surface-strong)",
              color: "var(--muted)",
              fontSize: "0.86rem",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            Flowvory operator shell
          </Link>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span
              style={{
                fontSize: "0.8rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--muted)",
              }}
            >
              Live monitoring surface
            </span>
            <div className="pill">{session.user.role}</div>
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div>
            <div className="eyebrow">Operator workflow</div>
            <h1 style={{ fontSize: "clamp(2rem, 4.4vw, 3.1rem)", lineHeight: 1.02, letterSpacing: "-0.03em", margin: "12px 0 0" }}>
              Community monitoring dashboard
            </h1>
            <p className="muted workspaceIntro" style={{ marginLeft: "auto", marginRight: "auto" }}>
              This shell is intentionally scoped to tracked Reddit keywords, threads, and posts.
            </p>
          </div>
        </div>
        <AppShellNav
          activeKey="dashboard"
          panelMode="embedded"
          secondaryItems={[
            { key: "playbooks", label: "Playbooks", href: "/app/playbooks" },
            { key: "reporting", label: "Reporting", href: "/app/reporting" },
            { key: "settings", label: "Settings", href: "/app/settings" },
          ]}
        />
      </header>
      <section className="card dashboardCard workflowSection">
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div className="eyebrow">AI Recommendation Share</div>
            <h2 style={{ margin: "10px 0 0", fontSize: "1.5rem" }}>Phase 1 run visibility</h2>
            <p className="muted" style={{ marginTop: 10, maxWidth: 760 }}>
              Monitoring is live. Review the latest run summary here or open the full run board.
            </p>
          </div>
          <Link className="button buttonSecondary" href="/app/ai-recommendation-share">
            Open run board
          </Link>
        </div>

        {latestRecommendationRun ? (
          <div className="workspaceSummaryGrid" style={{ marginTop: 16 }}>
            <article className="card dashboardCard">
              <p className="muted">Latest run</p>
              <p className="statValue">{latestRecommendationRun.run.status}</p>
              <p className="muted">
                {latestRecommendationRun.run.targetEntity} · {latestRecommendationRun.run.measurementWindow}
              </p>
              <p className="muted">
                {latestRecommendationRun.run.completedAt
                  ? `Completed ${latestRecommendationRun.run.completedAt.toISOString()}`
                  : `Started ${latestRecommendationRun.run.createdAt.toISOString()}`}
              </p>
            </article>
            <article className="card dashboardCard">
              <p className="muted">Recommendation share</p>
              <p className="statValue">{formatSharePercentage(latestRecommendationRun.summary.recommendationShare)}</p>
              <p className="muted">Recommended among valid checks</p>
            </article>
            <article className="card dashboardCard">
              <p className="muted">Mention share</p>
              <p className="statValue">{formatSharePercentage(latestRecommendationRun.summary.mentionShare)}</p>
              <p className="muted">Mentioned among valid checks</p>
            </article>
            <article className="card dashboardCard">
              <p className="muted">Coverage</p>
              <p className="statValue">{formatSharePercentage(latestRecommendationRun.summary.achievedCoverageRate)}</p>
              <p className="muted">
                {latestRecommendationRun.summary.validChecks}/{latestRecommendationRun.summary.plannedChecks} valid/planned checks
              </p>
            </article>
          </div>
        ) : (
          <p className="muted" style={{ marginTop: 16 }}>
            No recommendation-share runs are visible in this workspace yet.
          </p>
        )}
      </section>
      <DashboardWorkbench initialDashboard={dashboard} />
    </main>
  );
}
