import { JobRunStatus, ReviewReportWindow } from "@prisma/client";

import { requireUser } from "@/server/auth";
import { prisma } from "@/server/db/client";
import { getReviewAcquisitionSnapshot } from "@/server/reviews/reporting";

export const runtime = "nodejs";

export default async function DashboardPage() {
  const session = await requireUser("VIEWER");
  const latestReport = await prisma.aiVisibilityReport.findFirst({
    orderBy: {
      reportDate: "desc",
    },
    select: {
      reportDate: true,
    },
  });

  const [
    opportunityCount,
    draftCount,
    taskCount,
    dueJobCount,
    reviewSnapshot,
    latestReviewReport,
    recentReviewInvites,
    latestOpportunities,
    aiVisibilitySummary,
    aiVisibilityPages,
  ] =
    await Promise.all([
      prisma.opportunity.count(),
      prisma.draft.count(),
      prisma.distributionTask.count(),
      prisma.jobRun.count({
        where: {
          status: JobRunStatus.PENDING,
        },
      }),
      getReviewAcquisitionSnapshot(),
      prisma.reviewAcquisitionReport.findFirst({
        where: {
          window: ReviewReportWindow.MONTH,
        },
        orderBy: {
          periodStart: "desc",
        },
      }),
      prisma.reviewInvite.findMany({
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
        take: 5,
        include: {
          feedback: true,
        },
      }),
      prisma.opportunity.findMany({
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
        },
      }),
      latestReport
        ? prisma.aiVisibilityReport.aggregate({
            where: {
              reportDate: latestReport.reportDate,
            },
            _sum: {
              pageViews: true,
              uniqueVisitors: true,
              ctaClicks: true,
            },
          })
        : Promise.resolve(null),
      latestReport
        ? prisma.aiVisibilityReport.findMany({
            where: {
              reportDate: latestReport.reportDate,
            },
            orderBy: [{ pageViews: "desc" }, { pathname: "asc" }],
            take: 5,
          })
        : Promise.resolve([]),
    ]);

  const reportDateLabel = latestReport?.reportDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
  const reviewPeriodLabel = latestReviewReport
    ? latestReviewReport.periodStart.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      })
    : null;
  const reviewResponseRate = latestReviewReport
    ? Number(latestReviewReport.responseRate).toFixed(1)
    : "0.0";

  return (
    <main className="shell dashboard">
      <header className="topbar">
        <div className="topbarInner">
          <div>
            <div className="eyebrow">Operator surface</div>
            <h1 style={{ fontSize: "2.5rem", margin: "12px 0 0" }}>
              Welcome back, {session.user.name}.
            </h1>
          </div>
          <div className="pill">{session.user.role}</div>
        </div>
      </header>
      <section className="statsGrid dashboardHeader">
        <article className="card dashboardCard">
          <p className="muted">Opportunities</p>
          <p className="statValue">{opportunityCount}</p>
        </article>
        <article className="card dashboardCard">
          <p className="muted">Drafts</p>
          <p className="statValue">{draftCount}</p>
        </article>
        <article className="card dashboardCard">
          <p className="muted">Distribution tasks</p>
          <p className="statValue">{taskCount}</p>
        </article>
        <article className="card dashboardCard">
          <p className="muted">Queued jobs</p>
          <p className="statValue">{dueJobCount}</p>
        </article>
        <article className="card dashboardCard">
          <p className="muted">Review invites queued</p>
          <p className="statValue">{reviewSnapshot.invitesQueued}</p>
        </article>
        <article className="card dashboardCard">
          <p className="muted">Review response rate</p>
          <p className="statValue">{reviewResponseRate}%</p>
        </article>
        <article className="card dashboardCard">
          <p className="muted">AI visibility page views</p>
          <p className="statValue">{aiVisibilitySummary?._sum.pageViews ?? 0}</p>
        </article>
        <article className="card dashboardCard">
          <p className="muted">AI visibility CTA clicks</p>
          <p className="statValue">{aiVisibilitySummary?._sum.ctaClicks ?? 0}</p>
        </article>
      </section>
      <section className="dashboardGrid">
        <article className="card dashboardCard">
          <h2>Recent opportunities</h2>
          <ul className="clean" style={{ marginTop: 18 }}>
            {latestOpportunities.map((opportunity) => (
              <li className="row" key={opportunity.id}>
                <div>
                  <strong>{opportunity.title}</strong>
                  <p className="muted" style={{ margin: "6px 0 0" }}>
                    {opportunity.status}
                  </p>
                </div>
                <span className="pill">{opportunity.priority}</span>
              </li>
            ))}
          </ul>
        </article>
        <aside className="card dashboardCard">
          <h2>Baseline status</h2>
          <div className="stack" style={{ marginTop: 18 }}>
            <div>
              <strong>Auth and access</strong>
              <p className="muted">Credential sign-in with role-aware route protection.</p>
            </div>
            <div>
              <strong>Data layer</strong>
              <p className="muted">Prisma schema covers the next planned workflow entities.</p>
            </div>
            <div>
              <strong>Job runner seam</strong>
              <p className="muted">Pending jobs can be claimed and processed through a script.</p>
            </div>
            <div>
              <strong>Review workflow</strong>
              <p className="muted">
                Neutral invite, feedback, and public-share readiness states are now modeled
                end to end.
              </p>
            </div>
          </div>
        </aside>
      </section>
      <section className="dashboardGrid">
        <article className="card dashboardCard">
          <h2>Review acquisition workflow</h2>
          <p className="muted" style={{ marginTop: 8 }}>
            Ask for feedback first, route friction to support, and only invite public sharing
            after a real experience is confirmed.
          </p>
          <ul className="clean" style={{ marginTop: 18 }}>
            {recentReviewInvites.map((invite) => (
              <li className="row" key={invite.id}>
                <div>
                  <strong>{invite.customerName}</strong>
                  <p className="muted" style={{ margin: "6px 0 0" }}>
                    {invite.trigger} • {invite.status}
                  </p>
                  <p className="muted" style={{ margin: "6px 0 0" }}>
                    {invite.feedback?.frictionPoint ?? invite.notes ?? "No operator note yet."}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <strong>{invite.wantsPublicReview ? "Public share" : "Private feedback"}</strong>
                  <p className="muted" style={{ margin: "6px 0 0" }}>
                    {invite.experienceConfirmed ? "Experience confirmed" : "Awaiting confirmation"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </article>
        <aside className="card dashboardCard">
          <h2>Review KPI snapshot</h2>
          <div className="stack" style={{ marginTop: 18 }}>
            <div>
              <strong>Reporting window</strong>
              <p className="muted">
                {reviewPeriodLabel
                  ? `Monthly rollup for ${reviewPeriodLabel}.`
                  : "No monthly review rollup has been generated yet."}
              </p>
            </div>
            <div>
              <strong>Feedback received</strong>
              <p className="muted">{reviewSnapshot.feedbackReceived} invite responses captured.</p>
            </div>
            <div>
              <strong>Public review progress</strong>
              <p className="muted">
                {reviewSnapshot.publicShareReady} ready to share and{" "}
                {reviewSnapshot.publicReviewsCompleted} completed publicly.
              </p>
            </div>
            <div>
              <strong>Support follow-up load</strong>
              <p className="muted">
                {reviewSnapshot.supportFollowupsNeeded} feedback threads still need operator action.
              </p>
            </div>
          </div>
        </aside>
      </section>
      <section className="dashboardGrid">
        <article className="card dashboardCard">
          <h2>AI visibility report</h2>
          <p className="muted" style={{ marginTop: 8 }}>
            {reportDateLabel
              ? `Daily rollup for ${reportDateLabel}.`
              : "No aggregated AI visibility report has been generated yet."}
          </p>
          {aiVisibilityPages.length > 0 ? (
            <ul className="clean" style={{ marginTop: 18 }}>
              {aiVisibilityPages.map((page) => (
                <li className="row" key={page.id}>
                  <div>
                    <strong>{page.pageTitle}</strong>
                    <p className="muted" style={{ margin: "6px 0 0" }}>
                      {page.pathname}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <strong>{page.pageViews} views</strong>
                    <p className="muted" style={{ margin: "6px 0 0" }}>
                      {page.uniqueVisitors} visitors • {page.ctaClicks} clicks
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </article>
        <aside className="card dashboardCard">
          <h2>Reporting pipeline</h2>
          <div className="stack" style={{ marginTop: 18 }}>
            <div>
              <strong>Capture</strong>
              <p className="muted">Public AI visibility pages emit page-view and CTA events.</p>
            </div>
            <div>
              <strong>Persist</strong>
              <p className="muted">Events land in first-party tables for auditing and replay.</p>
            </div>
            <div>
              <strong>Roll up</strong>
              <p className="muted">The job runner aggregates daily visibility reports for operators.</p>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
