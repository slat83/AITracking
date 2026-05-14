import { AiRecommendationCheckValidity, AiRecommendationClassification, AiRecommendationRunStatus } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";

import { executeRecommendationShareRun, scheduleRecommendationShareRun } from "@/server/ai-recommendation-share/scheduler";

function createSchedulerDb() {
  const now = new Date("2026-05-14T00:00:00.000Z");

  return {
    workspace: {
      upsert: vi.fn(async () => ({
        id: "workspace-default",
        name: "Default Workspace",
        slug: "default-workspace",
      })),
      findUnique: vi.fn(),
    },
    aiRecommendationRun: {
      create: vi.fn(async () => ({
        id: "run-1",
        workspaceId: "workspace-default",
      })),
      update: vi.fn(async () => ({
        id: "run-1",
        status: AiRecommendationRunStatus.COMPLETED,
        completedAt: now,
      })),
    },
    aiRecommendationCheck: {
      create: vi.fn(async ({ data }) => ({ id: "check-1", ...data })),
      findMany: vi.fn(),
    },
    aiRecommendationQuery: {
      findMany: vi.fn(async () => [
        {
          id: "query-1",
          queryClass: "generic",
          promptText: "best VIN check provider",
          locale: "en-US",
        },
        {
          id: "query-2",
          queryClass: "alternatives",
          promptText: "EpicVIN alternatives",
          locale: "en-US",
        },
      ]),
      count: vi.fn(),
    },
    aiRecommendationSource: {
      findMany: vi.fn(async () => [
        {
          id: "source-1",
          sourceId: "chatgpt",
          sourceName: "ChatGPT",
          sourceTier: 1,
        },
      ]),
      count: vi.fn(),
    },
    jobRun: {
      create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({
        id: "job-1",
        kind: data.kind,
      })),
    },
  };
}

describe("ai recommendation share scheduler", () => {
  it("executes recommendation share run for each active query-source pair", async () => {
    const db = createSchedulerDb();

    const completedRun = await executeRecommendationShareRun({
      workspaceId: "workspace-default",
      targetEntity: "EpicVIN",
      measurementWindow: "2026-W20",
      methodologyVersion: "METH_v1",
      querySetVersion: "QSET_v1",
      sourceSetVersion: "SSET_v1",
      classificationRuleVersion: "RULE_v1",
      targetAliasesVersion: "ALIAS_v1",
    }, db as never);

    expect(completedRun.status).toBe(AiRecommendationRunStatus.COMPLETED);
    expect(db.aiRecommendationRun.create).toHaveBeenCalledTimes(1);
    expect(db.aiRecommendationQuery.findMany).toHaveBeenCalledTimes(1);
    expect(db.aiRecommendationSource.findMany).toHaveBeenCalledTimes(1);
    expect(db.aiRecommendationCheck.create).toHaveBeenCalledTimes(2);
    expect(db.aiRecommendationCheck.create).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          requestEnvelope: expect.objectContaining({
            sourceId: "chatgpt",
            transport: "simulated-local",
          }),
          classification: AiRecommendationClassification.RECOMMENDED,
          validity: AiRecommendationCheckValidity.VALID,
        }),
      }),
    );
  });

  it("schedules recommendation share job payload with defaults", async () => {
    const db = createSchedulerDb();

    await scheduleRecommendationShareRun({}, db as never);

    expect(db.jobRun.create).toHaveBeenCalledTimes(1);
    expect(db.jobRun.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          kind: "run-ai-recommendation-share",
          scheduledFor: expect.any(Date),
          payload: expect.objectContaining({
            targetEntity: "EpicVIN",
            methodologyVersion: "METH_v1",
            querySetVersion: "QSET_v1",
            sourceSetVersion: "SSET_v1",
            classificationRuleVersion: "RULE_v1",
            targetAliasesVersion: "ALIAS_v1",
          }),
        }),
      }),
    );
  });
});
