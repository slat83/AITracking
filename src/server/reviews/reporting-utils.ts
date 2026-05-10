import { Prisma, ReviewReportWindow, ReviewSentiment, ReviewTrigger } from "@prisma/client";

type ReviewReportingWindow = keyof typeof ReviewReportWindow;
type ReviewMetricInvite = {
  trigger: ReviewTrigger;
  createdAt: Date;
  sentAt: Date | null;
  respondedAt: Date | null;
  publicShareReadyAt: Date | null;
  closedAt: Date | null;
  feedback: {
    sentiment: ReviewSentiment;
    supportFollowupNeeded: boolean;
    createdAt: Date;
    publicReviewPostedAt: Date | null;
  } | null;
};

type ReviewReportMetrics = {
  invitesCreated: number;
  invitesSent: number;
  responsesReceived: number;
  publicShareReady: number;
  publicReviewsCompleted: number;
  closedWithoutShare: number;
  negativeFeedbackCount: number;
  sentimentBreakdown: Record<ReviewSentiment, number>;
  triggerBreakdown: Record<ReviewTrigger, number>;
  responseRate: Prisma.Decimal;
};

function startOfUtcDay(value: Date) {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
}

export function getReviewReportPeriod(window: ReviewReportingWindow, anchorDate = new Date()) {
  const date = startOfUtcDay(anchorDate);

  if (window === "WEEK") {
    const day = date.getUTCDay();
    const diff = day === 0 ? -6 : 1 - day;
    const periodStart = new Date(date);
    periodStart.setUTCDate(periodStart.getUTCDate() + diff);
    const periodEnd = new Date(periodStart);
    periodEnd.setUTCDate(periodEnd.getUTCDate() + 7);

    return { periodStart, periodEnd };
  }

  const periodStart = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
  const periodEnd = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1));

  return { periodStart, periodEnd };
}

export function toPercentage(numerator: number, denominator: number) {
  if (denominator === 0) {
    return new Prisma.Decimal(0);
  }

  return new Prisma.Decimal(((numerator / denominator) * 100).toFixed(2));
}

function isWithinPeriod(value: Date | null, periodStart: Date, periodEnd: Date) {
  return value !== null && value >= periodStart && value < periodEnd;
}

export function buildReviewReportMetrics(
  invites: ReviewMetricInvite[],
  periodStart: Date,
  periodEnd: Date,
): ReviewReportMetrics {
  const sentimentBreakdown: Record<ReviewSentiment, number> = {
    POSITIVE: 0,
    NEUTRAL: 0,
    NEGATIVE: 0,
    MIXED: 0,
  };
  const triggerBreakdown: Record<ReviewTrigger, number> = {
    REPORT_DELIVERED: 0,
    SUPPORT_RESOLVED: 0,
    REFUND_RESOLVED: 0,
  };

  let invitesCreated = 0;
  let invitesSent = 0;
  let responsesReceived = 0;
  let publicShareReady = 0;
  let publicReviewsCompleted = 0;
  let closedWithoutShare = 0;
  let negativeFeedbackCount = 0;

  for (const invite of invites) {
    if (isWithinPeriod(invite.createdAt, periodStart, periodEnd)) {
      invitesCreated += 1;
      triggerBreakdown[invite.trigger] += 1;
    }

    if (isWithinPeriod(invite.sentAt, periodStart, periodEnd)) {
      invitesSent += 1;
    }

    if (isWithinPeriod(invite.respondedAt, periodStart, periodEnd)) {
      responsesReceived += 1;
    }

    if (isWithinPeriod(invite.publicShareReadyAt, periodStart, periodEnd)) {
      publicShareReady += 1;
    }

    if (isWithinPeriod(invite.closedAt, periodStart, periodEnd)) {
      closedWithoutShare += 1;
    }

    if (invite.feedback && isWithinPeriod(invite.feedback.createdAt, periodStart, periodEnd)) {
      sentimentBreakdown[invite.feedback.sentiment] += 1;

      if (
        invite.feedback.sentiment === ReviewSentiment.NEGATIVE
        || invite.feedback.supportFollowupNeeded
      ) {
        negativeFeedbackCount += 1;
      }
    }

    if (
      invite.feedback
      && isWithinPeriod(invite.feedback.publicReviewPostedAt, periodStart, periodEnd)
    ) {
      publicReviewsCompleted += 1;
    }
  }

  return {
    invitesCreated,
    invitesSent,
    responsesReceived,
    publicShareReady,
    publicReviewsCompleted,
    closedWithoutShare,
    negativeFeedbackCount,
    sentimentBreakdown,
    triggerBreakdown,
    responseRate: toPercentage(responsesReceived, invitesSent),
  };
}
