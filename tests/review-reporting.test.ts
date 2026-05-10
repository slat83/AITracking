import { ReviewSentiment, ReviewTrigger } from "@prisma/client";
import { describe, expect, it } from "vitest";

import {
  buildReviewReportMetrics,
  getReviewReportPeriod,
  toPercentage,
} from "@/server/reviews/reporting-utils";

describe("review reporting utilities", () => {
  it("aligns weekly reports to UTC monday boundaries", () => {
    const { periodStart, periodEnd } = getReviewReportPeriod("WEEK", new Date("2026-05-10T15:00:00Z"));

    expect(periodStart.toISOString()).toBe("2026-05-04T00:00:00.000Z");
    expect(periodEnd.toISOString()).toBe("2026-05-11T00:00:00.000Z");
  });

  it("aligns monthly reports to calendar month boundaries", () => {
    const { periodStart, periodEnd } = getReviewReportPeriod("MONTH", new Date("2026-05-10T15:00:00Z"));

    expect(periodStart.toISOString()).toBe("2026-05-01T00:00:00.000Z");
    expect(periodEnd.toISOString()).toBe("2026-06-01T00:00:00.000Z");
  });

  it("returns decimal percentages with two decimal precision", () => {
    expect(toPercentage(2, 3).toNumber()).toBeCloseTo(66.67, 2);
    expect(toPercentage(0, 0).toNumber()).toBe(0);
  });

  it("counts review KPIs by event timestamp instead of invite creation alone", () => {
    const periodStart = new Date("2026-05-01T00:00:00.000Z");
    const periodEnd = new Date("2026-06-01T00:00:00.000Z");
    const metrics = buildReviewReportMetrics(
      [
        {
          trigger: ReviewTrigger.REPORT_DELIVERED,
          createdAt: new Date("2026-04-30T23:00:00.000Z"),
          sentAt: new Date("2026-05-01T00:30:00.000Z"),
          respondedAt: new Date("2026-05-02T00:30:00.000Z"),
          publicShareReadyAt: new Date("2026-05-02T00:30:00.000Z"),
          closedAt: null,
          feedback: {
            sentiment: ReviewSentiment.POSITIVE,
            supportFollowupNeeded: false,
            createdAt: new Date("2026-05-02T00:30:00.000Z"),
            publicReviewPostedAt: new Date("2026-05-03T00:30:00.000Z"),
          },
        },
        {
          trigger: ReviewTrigger.REFUND_RESOLVED,
          createdAt: new Date("2026-05-15T10:00:00.000Z"),
          sentAt: new Date("2026-05-16T10:00:00.000Z"),
          respondedAt: new Date("2026-05-16T11:00:00.000Z"),
          publicShareReadyAt: null,
          closedAt: new Date("2026-05-16T11:00:00.000Z"),
          feedback: {
            sentiment: ReviewSentiment.NEGATIVE,
            supportFollowupNeeded: true,
            createdAt: new Date("2026-05-16T11:00:00.000Z"),
            publicReviewPostedAt: null,
          },
        },
      ],
      periodStart,
      periodEnd,
    );

    expect(metrics.invitesCreated).toBe(1);
    expect(metrics.invitesSent).toBe(2);
    expect(metrics.responsesReceived).toBe(2);
    expect(metrics.publicShareReady).toBe(1);
    expect(metrics.publicReviewsCompleted).toBe(1);
    expect(metrics.closedWithoutShare).toBe(1);
    expect(metrics.negativeFeedbackCount).toBe(1);
    expect(metrics.sentimentBreakdown).toEqual({
      POSITIVE: 1,
      NEUTRAL: 0,
      NEGATIVE: 1,
      MIXED: 0,
    });
    expect(metrics.triggerBreakdown).toEqual({
      REPORT_DELIVERED: 0,
      SUPPORT_RESOLVED: 0,
      REFUND_RESOLVED: 1,
    });
    expect(metrics.responseRate.toNumber()).toBe(100);
  });
});
