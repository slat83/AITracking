import Link from "next/link";

import { AppShellNav } from "@/components/app-shell-nav";
import { requireUser } from "@/server/auth";
import { prisma } from "@/server/db/client";
import { buildRecommendationRunSummary } from "@/server/ai-recommendation-share/pipeline";

export const runtime = "nodejs";

export default async function AiRecommendationSharePage() {
  const session = await requireUser("VIEWER");
  const runs = await prisma.aiRecommendationRun.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      targetEntity: true,
      measurementWindow: true,
      status: true,
      createdAt: true,
      completedAt: true,
      methodologyVersion: true,
    },
  });

  const runSummaries = await Promise.all(
    runs.map(async (run) => {
      const summary = await buildRecommendationRunSummary(run.id);
      return {
        run,
        recommendationShare: summary.recommendationShare,
        mentionShare: summary.mentionShare,
        negativeMentionRate: summary.negativeMentionRate,
      };
    }),
  );

  return (
    <main className="shell dashboard workflowPage">
      <header className="topbar">
        <div className="topbarInner">
          <div>
            <div className="eyebrow">AI Recommendation Share</div>
            <h1 style={{ fontSize: "2.5rem", margin: "12px 0 0" }}>Phase 1 recommendation-share runs</h1>
            <p className="muted" style={{ marginTop: 10, maxWidth: 760 }}>
              Inspect scheduled run health, valid check coverage, recommendation share, and review flags.
            </p>
          </div>
          <div className="stack" style={{ justifyItems: "end" }}>
            <div className="pill">{session.user.role}</div>
            <Link className="button buttonSecondary" href="/app">Back to workspace</Link>
          </div>
        </div>
        <AppShellNav activeKey="aiRecommendationShare" />
      </header>

      <section className="workspaceSummaryGrid" style={{ marginTop: 18 }}>
        {runSummaries.length === 0 ? (
          <article className="card dashboardCard">
            <p className="muted">No runs yet. Trigger one from the AI recommendation share API.</p>
          </article>
        ) : (
          runSummaries.map((entry) => (
            <article className="card dashboardCard" key={entry.run.id}>
              <p className="muted">{entry.run.targetEntity} · {entry.run.measurementWindow}</p>
              <p className="statValue">{entry.run.status}</p>
              <p className="muted">Methodology: {entry.run.methodologyVersion}</p>
              <p>Recommendation share: {entry.recommendationShare === null ? "N/A" : `${(entry.recommendationShare * 100).toFixed(1)}%`}</p>
              <p>Mention share: {entry.mentionShare === null ? "N/A" : `${(entry.mentionShare * 100).toFixed(1)}%`}</p>
              <p>Negative mention rate: {entry.negativeMentionRate === null ? "N/A" : `${(entry.negativeMentionRate * 100).toFixed(1)}%`}</p>
              <Link href={`/api/ai-recommendation-share/runs/${entry.run.id}`}>View run checks</Link>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
