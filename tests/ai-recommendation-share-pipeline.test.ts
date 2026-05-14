import {
  AiRecommendationCheckValidity,
  AiRecommendationClassification,
  AiRecommendationRunStatus,
} from "@prisma/client";
import { describe, expect, it, vi } from "vitest";

import {
  buildRecommendationRunSummary,
  completeRecommendationRun,
  createRecommendationRun,
  recordRecommendationCheck,
  summarizeRecommendationChecks,
} from "@/server/ai-recommendation-share/pipeline";

function createPipelineDb() {
  const run = {
    id: "run-1",
    workspaceId: "workspace-1",
    targetEntity: "EpicVIN",
    measurementWindow: "2026-W20",
    methodologyVersion: "METH_v1",
    querySetVersion: "QSET_v1",
    sourceSetVersion: "SSET_v1",
    classificationRuleVersion: "CLASS_v1",
    targetAliasesVersion: "ALIAS_v1",
    status: AiRecommendationRunStatus.RUNNING,
    startedAt: new Date("2026-05-14T00:00:00.000Z"),
    completedAt: null,
    notes: null,
    createdAt: new Date("2026-05-14T00:00:00.000Z"),
    updatedAt: new Date("2026-05-14T00:00:00.000Z"),
  };

  return {
    aiRecommendationRun: {
      create: vi.fn(async ({ data }: { data: typeof run }) => ({ ...run, ...data })),
      update: vi.fn(async ({ where, data }: { where: { id: string }; data: { status: AiRecommendationRunStatus; completedAt: Date } }) => ({
        ...run,
        id: where.id,
        ...data,
      })),
      findUniqueOrThrow: vi.fn(async ({ where }: { where: { id: string } }) => ({ ...run, id: where.id })),
    },
    aiRecommendationCheck: {
      create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({ id: "check-1", ...data })),
      findMany: vi.fn(async () => ([
        { validity: AiRecommendationCheckValidity.VALID, classification: AiRecommendationClassification.RECOMMENDED },
        { validity: AiRecommendationCheckValidity.VALID, classification: AiRecommendationClassification.MENTIONED },
        { validity: AiRecommendationCheckValidity.INVALID, classification: AiRecommendationClassification.UNCLASSIFIED },
      ])),
    },
    aiRecommendationQuery: {
      count: vi.fn(async () => 2),
    },
    aiRecommendationSource: {
      count: vi.fn(async () => 2),
    },
  };
}

describe("ai recommendation share pipeline", () => {
  it("summarizes coverage and recommendation share from check rows", () => {
    const summary = summarizeRecommendationChecks([
      { validity: AiRecommendationCheckValidity.VALID, classification: AiRecommendationClassification.RECOMMENDED },
      { validity: AiRecommendationCheckValidity.VALID, classification: AiRecommendationClassification.NOT_MENTIONED },
      { validity: AiRecommendationCheckValidity.INVALID, classification: AiRecommendationClassification.UNCLASSIFIED },
    ], 6);

    expect(summary.attemptedChecks).toBe(3);
    expect(summary.validChecks).toBe(2);
    expect(summary.invalidChecks).toBe(1);
    expect(summary.achievedCoverageRate).toBe(0.5);
    expect(summary.recommendationShare).toBe(0.5);
    expect(summary.classCounts[AiRecommendationClassification.RECOMMENDED]).toBe(1);
  });

  it("creates, records, and completes a run", async () => {
    const db = createPipelineDb();

    const createdRun = await createRecommendationRun({
      workspaceId: "workspace-1",
      targetEntity: "EpicVIN",
      measurementWindow: "2026-W20",
      methodologyVersion: "METH_v1",
      querySetVersion: "QSET_v1",
      sourceSetVersion: "SSET_v1",
      classificationRuleVersion: "CLASS_v1",
      targetAliasesVersion: "ALIAS_v1",
    }, db as never);

    expect(createdRun.status).toBe(AiRecommendationRunStatus.RUNNING);

    await recordRecommendationCheck({
      runId: "run-1",
      queryRecordId: "query-1",
      sourceRecordId: "source-1",
      validity: AiRecommendationCheckValidity.VALID,
      rawResponse: "EpicVIN is a solid option for VIN reports.",
      classification: AiRecommendationClassification.RECOMMENDED,
    }, db as never);

    await completeRecommendationRun("run-1", db as never);

    expect(db.aiRecommendationRun.create).toHaveBeenCalledTimes(1);
    expect(db.aiRecommendationCheck.create).toHaveBeenCalledTimes(1);
    expect(db.aiRecommendationRun.update).toHaveBeenCalledTimes(1);
  });

  it("builds run summary from active query/source catalogs", async () => {
    const db = createPipelineDb();
    const summary = await buildRecommendationRunSummary("run-1", db as never);

    expect(summary.plannedChecks).toBe(4);
    expect(summary.attemptedChecks).toBe(3);
    expect(summary.validChecks).toBe(2);
    expect(summary.invalidChecks).toBe(1);
    expect(summary.achievedCoverageRate).toBe(0.75);
    expect(summary.recommendationShare).toBe(0.5);
  });
});
