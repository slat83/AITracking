import { VisibilityEventType, type Prisma } from "@prisma/client";

import { aiVisibilityPages, resolveAiVisibilityPathname } from "@/content/ai-visibility";
import { prisma } from "@/server/db/client";
import { enqueueJob } from "@/server/jobs";

export const AI_VISIBILITY_REPORT_JOB_KIND = "aggregate-ai-visibility-report";

type TrackVisibilityEventInput = {
  pathname: string;
  eventType: VisibilityEventType;
  sessionId: string;
  pageTitle?: string | null;
  ctaLabel?: string | null;
  ctaHref?: string | null;
  referrer?: string | null;
  userAgent?: string | null;
};

type AggregateAiVisibilityReportInput = {
  reportDate: Date;
};

type PageMetrics = {
  pageTitle: string;
  pageViews: number;
  uniqueVisitors: Set<string>;
  ctaClicks: number;
  primaryCtaClicks: number;
  secondaryCtaClicks: number;
  referrers: Map<string, number>;
};

function getStartOfUtcDay(value: Date) {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
}

function getEndOfUtcDay(value: Date) {
  const start = getStartOfUtcDay(value);
  return new Date(start.getTime() + 24 * 60 * 60 * 1000);
}

function getNextUtcMidnight(value: Date) {
  return getEndOfUtcDay(value);
}

export class UnknownAiVisibilityPathnameError extends Error {
  constructor(pathname: string) {
    super(`Unknown AI visibility pathname: ${pathname}`);
    this.name = "UnknownAiVisibilityPathnameError";
  }
}

function getKnownPageTitle(pathname: string) {
  return aiVisibilityPages.find((page) => page.pathname === pathname)?.title ?? pathname;
}

export async function trackVisibilityEvent(input: TrackVisibilityEventInput) {
  const pathname = resolveAiVisibilityPathname(input.pathname);

  if (!pathname) {
    throw new UnknownAiVisibilityPathnameError(input.pathname);
  }

  return prisma.visibilityEvent.create({
    data: {
      pathname,
      eventType: input.eventType,
      pageTitle: input.pageTitle ?? getKnownPageTitle(pathname),
      ctaLabel: input.ctaLabel ?? null,
      ctaHref: input.ctaHref ?? null,
      sessionId: input.sessionId,
      referrer: input.referrer ?? null,
      userAgent: input.userAgent ?? null,
    },
  });
}

export async function ensureAiVisibilityReportJob(reportDate: Date, scheduledFor?: Date) {
  const runAt = scheduledFor ?? getNextUtcMidnight(reportDate);
  const existingJob = await prisma.jobRun.findFirst({
    where: {
      kind: AI_VISIBILITY_REPORT_JOB_KIND,
      status: {
        in: ["PENDING", "RUNNING"],
      },
      scheduledFor: runAt,
    },
  });

  if (existingJob) {
    return existingJob;
  }

  return enqueueJob({
    kind: AI_VISIBILITY_REPORT_JOB_KIND,
    scheduledFor: runAt,
    payload: {
      reportDate: getStartOfUtcDay(reportDate).toISOString(),
    } satisfies Prisma.InputJsonValue,
  });
}

export async function aggregateAiVisibilityReport(input: AggregateAiVisibilityReportInput) {
  const reportDate = getStartOfUtcDay(input.reportDate);
  const nextDay = getEndOfUtcDay(reportDate);
  const events = await prisma.visibilityEvent.findMany({
    where: {
      occurredAt: {
        gte: reportDate,
        lt: nextDay,
      },
    },
    orderBy: {
      occurredAt: "asc",
    },
  });

  const pageMetrics = new Map<string, PageMetrics>();

  for (const event of events) {
    const metrics = pageMetrics.get(event.pathname) ?? {
      pageTitle: event.pageTitle ?? getKnownPageTitle(event.pathname),
      pageViews: 0,
      uniqueVisitors: new Set<string>(),
      ctaClicks: 0,
      primaryCtaClicks: 0,
      secondaryCtaClicks: 0,
      referrers: new Map<string, number>(),
    };

    metrics.uniqueVisitors.add(event.sessionId);

    if (event.eventType === VisibilityEventType.PAGE_VIEW) {
      metrics.pageViews += 1;
    }

    if (event.eventType === VisibilityEventType.CTA_CLICK) {
      metrics.ctaClicks += 1;

      if (event.ctaLabel === "primary") {
        metrics.primaryCtaClicks += 1;
      }

      if (event.ctaLabel === "secondary") {
        metrics.secondaryCtaClicks += 1;
      }
    }

    if (event.referrer) {
      metrics.referrers.set(event.referrer, (metrics.referrers.get(event.referrer) ?? 0) + 1);
    }

    pageMetrics.set(event.pathname, metrics);
  }

  await prisma.$transaction(async (tx) => {
    for (const [pathname, metrics] of pageMetrics.entries()) {
      const topReferrer =
        [...metrics.referrers.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ?? null;

      await tx.aiVisibilityReport.upsert({
        where: {
          reportDate_pathname: {
            reportDate,
            pathname,
          },
        },
        update: {
          pageTitle: metrics.pageTitle,
          pageViews: metrics.pageViews,
          uniqueVisitors: metrics.uniqueVisitors.size,
          ctaClicks: metrics.ctaClicks,
          primaryCtaClicks: metrics.primaryCtaClicks,
          secondaryCtaClicks: metrics.secondaryCtaClicks,
          topReferrer,
        },
        create: {
          reportDate,
          pathname,
          pageTitle: metrics.pageTitle,
          pageViews: metrics.pageViews,
          uniqueVisitors: metrics.uniqueVisitors.size,
          ctaClicks: metrics.ctaClicks,
          primaryCtaClicks: metrics.primaryCtaClicks,
          secondaryCtaClicks: metrics.secondaryCtaClicks,
          topReferrer,
        },
      });
    }
  });

  const nextReportDate = nextDay;
  await ensureAiVisibilityReportJob(nextReportDate);

  return {
    reportDate,
    pages: pageMetrics.size,
    events: events.length,
  };
}
