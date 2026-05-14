import { NextResponse } from "next/server";

import { requireDashboardPermission } from "@/server/dashboard/api-auth";
import { prisma } from "@/server/db/client";
import { buildRecommendationRunSummary } from "@/server/ai-recommendation-share/pipeline";

export const runtime = "nodejs";

type RouteParams = {
  params: Promise<{ runId: string }>;
};

export async function GET(request: Request, { params }: RouteParams) {
  const auth = await requireDashboardPermission(request, "dashboard:read");

  if (!auth.ok) {
    return auth.response;
  }

  const { runId } = await params;
  const run = await prisma.aiRecommendationRun.findUnique({
    where: { id: runId },
  });

  if (!run) {
    return NextResponse.json({ ok: false, error: "Run not found." }, { status: 404 });
  }

  const checks = await prisma.aiRecommendationCheck.findMany({
    where: { runId },
    include: {
      queryRecord: true,
      sourceRecord: true,
    },
    orderBy: { capturedAt: "desc" },
  });

  const summary = await buildRecommendationRunSummary(runId);

  return NextResponse.json({
    ok: true,
    summary,
    checks: checks.map((check) => ({
      id: check.id,
      runId: check.runId,
      query: {
        id: check.queryRecordId,
        queryId: check.queryRecord.queryId,
        queryClass: check.queryRecord.queryClass,
        promptText: check.queryRecord.promptText,
        promptLocale: check.queryRecord.locale,
      },
      source: {
        id: check.sourceRecordId,
        sourceId: check.sourceRecord.sourceId,
        sourceName: check.sourceRecord.sourceName,
        sourceTier: check.sourceRecord.sourceTier,
      },
      capturedAt: check.capturedAt.toISOString(),
      validity: check.validity,
      invalidReason: check.invalidReason,
      classification: check.classification,
      reviewRequired: check.reviewRequired,
      classificationRationale: check.classificationRationale,
      rawResponse: check.rawResponse,
      responseTruncatedFlag: check.responseTruncatedFlag,
    })),
  });
}
