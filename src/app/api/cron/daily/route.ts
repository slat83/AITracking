import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { aggregateAiVisibilityReport } from "@/server/analytics/visibility";
import { processDueJobs } from "@/server/jobs";

export const runtime = "nodejs";

function getYesterdayUtcDate() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1));
}

function authorizeCron(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { ok: false, error: "CRON_SECRET is required in production." },
        { status: 500 },
      );
    }

    return null;
  }

  const authorization = request.headers.get("authorization");

  if (authorization !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  return null;
}

export async function GET(request: NextRequest) {
  const authorizationError = authorizeCron(request);

  if (authorizationError) {
    return authorizationError;
  }

  const reportDate = getYesterdayUtcDate();
  const analyticsSummary = await aggregateAiVisibilityReport({ reportDate });
  const processedJobs = await processDueJobs();

  return NextResponse.json({
    ok: true,
    reportDate: analyticsSummary.reportDate.toISOString(),
    analytics: {
      pages: analyticsSummary.pages,
      events: analyticsSummary.events,
    },
    jobs: {
      processed: processedJobs,
    },
  });
}
