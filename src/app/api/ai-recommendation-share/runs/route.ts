import { NextResponse } from "next/server";
import { JobRunStatus } from "@prisma/client";
import { z } from "zod";

import { requireDashboardPermission } from "@/server/dashboard/api-auth";
import { prisma } from "@/server/db/client";
import {
  AI_RECOMMENDATION_SHARE_JOB_KIND,
  scheduleRecommendationShareRun,
} from "@/server/ai-recommendation-share/scheduler";

export const runtime = "nodejs";

const scheduleRunSchema = z.object({
  targetEntity: z.string().trim().min(1).max(120).optional(),
  measurementWindow: z.string().trim().min(7).max(40).optional(),
  workspaceId: z.string().trim().min(1).max(120).optional(),
});

export async function GET(request: Request) {
  const auth = await requireDashboardPermission(request, "dashboard:read");

  if (!auth.ok) {
    return auth.response;
  }

  const runs = await prisma.aiRecommendationRun.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      targetEntity: true,
      measurementWindow: true,
      status: true,
      methodologyVersion: true,
      querySetVersion: true,
      sourceSetVersion: true,
      completedAt: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ ok: true, runs });
}

export async function POST(request: Request) {
  const auth = await requireDashboardPermission(request, "dashboard:write");

  if (!auth.ok) {
    return auth.response;
  }

  try {
    const body = scheduleRunSchema.parse(await request.json());
    const workspaceId = body.workspaceId;
    const job = await scheduleRecommendationShareRun({
      targetEntity: body.targetEntity,
      measurementWindow: body.measurementWindow,
      workspaceId,
    });
    const kindCount = await prisma.jobRun.count({
      where: { kind: AI_RECOMMENDATION_SHARE_JOB_KIND, status: JobRunStatus.PENDING },
    });

    return NextResponse.json({
      ok: true,
      job: {
        id: job.id,
        kind: job.kind,
        scheduledFor: job.scheduledFor.toISOString(),
      },
      queue: {
        pendingAiRecommendationRuns: kindCount,
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: "Invalid recommendation share run payload.", issues: error.flatten() }, { status: 400 });
    }

    console.error("Failed to schedule AI recommendation share run", error);
    return NextResponse.json({ ok: false, error: "Failed to schedule AI recommendation share run." }, { status: 500 });
  }
}
