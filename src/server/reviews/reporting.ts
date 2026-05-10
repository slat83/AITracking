import { ReviewInviteStatus, ReviewReportWindow } from "@prisma/client";

import { prisma } from "@/server/db/client";
import { buildReviewReportMetrics, getReviewReportPeriod } from "@/server/reviews/reporting-utils";

type ReviewSnapshot = {
  invitesQueued: number;
  invitesSent: number;
  feedbackReceived: number;
  publicShareReady: number;
  publicReviewsCompleted: number;
  supportFollowupsNeeded: number;
};

type AggregateReviewAcquisitionReportInput = {
  window: keyof typeof ReviewReportWindow;
  anchorDate?: Date;
};

export async function getReviewAcquisitionSnapshot(): Promise<ReviewSnapshot> {
  const [invitesQueued, invitesSent, feedbackReceived, publicShareReady, publicReviewsCompleted] =
    await Promise.all([
      prisma.reviewInvite.count({
        where: {
          status: {
            in: [ReviewInviteStatus.DRAFT, ReviewInviteStatus.SCHEDULED],
          },
        },
      }),
      prisma.reviewInvite.count({
        where: {
          status: {
            in: [
              ReviewInviteStatus.SENT,
              ReviewInviteStatus.FEEDBACK_RECEIVED,
              ReviewInviteStatus.PUBLIC_SHARE_READY,
              ReviewInviteStatus.COMPLETED,
              ReviewInviteStatus.CLOSED_NO_SHARE,
            ],
          },
        },
      }),
      prisma.reviewInvite.count({
        where: {
          status: {
            in: [
              ReviewInviteStatus.FEEDBACK_RECEIVED,
              ReviewInviteStatus.PUBLIC_SHARE_READY,
              ReviewInviteStatus.COMPLETED,
              ReviewInviteStatus.CLOSED_NO_SHARE,
            ],
          },
        },
      }),
      prisma.reviewInvite.count({
        where: {
          status: ReviewInviteStatus.PUBLIC_SHARE_READY,
        },
      }),
      prisma.reviewInvite.count({
        where: {
          status: ReviewInviteStatus.COMPLETED,
        },
      }),
    ]);

  const supportFollowupsNeeded = await prisma.reviewFeedback.count({
    where: {
      supportFollowupNeeded: true,
    },
  });

  return {
    invitesQueued,
    invitesSent,
    feedbackReceived,
    publicShareReady,
    publicReviewsCompleted,
    supportFollowupsNeeded,
  };
}

export async function aggregateReviewAcquisitionReport(
  input: AggregateReviewAcquisitionReportInput,
) {
  const { periodStart, periodEnd } = getReviewReportPeriod(input.window, input.anchorDate);
  const invites = await prisma.reviewInvite.findMany({
    include: {
      feedback: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
  const metrics = buildReviewReportMetrics(invites, periodStart, periodEnd);

  return prisma.reviewAcquisitionReport.upsert({
    where: {
      window_periodStart_periodEnd: {
        window: input.window,
        periodStart,
        periodEnd,
      },
    },
    update: {
      invitesCreated: metrics.invitesCreated,
      invitesSent: metrics.invitesSent,
      responsesReceived: metrics.responsesReceived,
      publicShareReady: metrics.publicShareReady,
      publicReviewsCompleted: metrics.publicReviewsCompleted,
      closedWithoutShare: metrics.closedWithoutShare,
      negativeFeedbackCount: metrics.negativeFeedbackCount,
      responseRate: metrics.responseRate,
      sentimentBreakdown: metrics.sentimentBreakdown,
      triggerBreakdown: metrics.triggerBreakdown,
    },
    create: {
      window: input.window,
      periodStart,
      periodEnd,
      invitesCreated: metrics.invitesCreated,
      invitesSent: metrics.invitesSent,
      responsesReceived: metrics.responsesReceived,
      publicShareReady: metrics.publicShareReady,
      publicReviewsCompleted: metrics.publicReviewsCompleted,
      closedWithoutShare: metrics.closedWithoutShare,
      negativeFeedbackCount: metrics.negativeFeedbackCount,
      responseRate: metrics.responseRate,
      sentimentBreakdown: metrics.sentimentBreakdown,
      triggerBreakdown: metrics.triggerBreakdown,
    },
  });
}
