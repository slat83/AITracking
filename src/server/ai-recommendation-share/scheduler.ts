import { type PrismaClient } from "@prisma/client";
import { z } from "zod";

import { prisma } from "@/server/db/client";
import { classifyRecommendation } from "@/server/ai-recommendation-share/classifier";
import {
  createRecommendationRun,
  recordRecommendationCheck,
  completeRecommendationRun,
} from "@/server/ai-recommendation-share/pipeline";
import { getDefaultRecommendationAdapters } from "@/server/ai-recommendation-share/adapters";

type RecommendationSchedulerDb = Pick<
  PrismaClient,
  "workspace" | "aiRecommendationRun" | "aiRecommendationQuery" | "aiRecommendationSource" | "aiRecommendationCheck" | "jobRun"
>;

const DEFAULT_WORKSPACE_SLUG = "default-workspace";
const DEFAULT_WORKSPACE_NAME = "Default Workspace";

const METHODOLOGY_VERSION = "METH_v1";
const QUERY_SET_VERSION = "QSET_v1";
const SOURCE_SET_VERSION = "SSET_v1";
const CLASS_RULE_VERSION = "RULE_v1";
const TARGET_ALIAS_VERSION = "ALIAS_v1";
const DEFAULT_TARGET = "EpicVIN";

const createDefaultQueriesPayload = z.object({
  targetEntity: z.string().trim().min(1),
});

export const AI_RECOMMENDATION_SHARE_JOB_KIND = "run-ai-recommendation-share";

export type RecommendationSharePlanInput = {
  targetEntity?: string;
  measurementWindow?: string;
  workspaceId?: string;
  scheduledFor?: Date;
};

async function ensureDefaultWorkspace(db: RecommendationSchedulerDb) {
  return db.workspace.upsert({
    where: { slug: DEFAULT_WORKSPACE_SLUG },
    update: {
      name: DEFAULT_WORKSPACE_NAME,
      isDefault: true,
    },
    create: {
      slug: DEFAULT_WORKSPACE_SLUG,
      name: DEFAULT_WORKSPACE_NAME,
      isDefault: true,
    },
  });
}

async function resolveWorkspace(db: RecommendationSchedulerDb, requestedWorkspaceId?: string) {
  if (requestedWorkspaceId) {
    const workspace = await db.workspace.findUnique({ where: { id: requestedWorkspaceId }});

    if (!workspace) {
      throw new Error(`Workspace not found: ${requestedWorkspaceId}`);
    }

    return workspace;
  }

  return ensureDefaultWorkspace(db);
}

async function ensureDefaultCatalogs(workspaceId: string, db: RecommendationSchedulerDb = prisma) {
  const queryCount = await db.aiRecommendationQuery.count({
    where: {
      workspaceId,
      querySetVersion: QUERY_SET_VERSION,
      isActive: true,
    },
  });

  if (queryCount === 0) {
    await db.aiRecommendationQuery.createMany({
      data: [
        {
          workspaceId,
          querySetVersion: QUERY_SET_VERSION,
          queryId: "Q1",
          queryClass: "generic",
          promptText: "best VIN check provider",
          locale: "en-US",
        },
        {
          workspaceId,
          querySetVersion: QUERY_SET_VERSION,
          queryId: "Q2",
          queryClass: "alternatives",
          promptText: "EpicVIN alternatives",
          locale: "en-US",
        },
      ],
      skipDuplicates: true,
    });
  }

  const sourceCount = await db.aiRecommendationSource.count({
    where: {
      workspaceId,
      sourceSetVersion: SOURCE_SET_VERSION,
      isActive: true,
    },
  });

  if (sourceCount === 0) {
    const adapters = getDefaultRecommendationAdapters();
    await db.aiRecommendationSource.createMany({
      data: adapters.map((adapter) => ({
        workspaceId,
        sourceSetVersion: SOURCE_SET_VERSION,
        sourceId: adapter.sourceId,
        sourceName: adapter.sourceName,
        sourceTier: adapter.sourceTier,
      })),
      skipDuplicates: true,
    });
  }
}

export async function getDefaultWorkspaceForRecommendationShare(db: RecommendationSchedulerDb = prisma) {
  return ensureDefaultWorkspace(db);
}

export async function scheduleRecommendationShareRun(input: RecommendationSharePlanInput = {}, db: RecommendationSchedulerDb = prisma) {
  const parsedInput = createDefaultQueriesPayload.parse({
    targetEntity: input.targetEntity ?? DEFAULT_TARGET,
  });
  const workspace = await resolveWorkspace(db, input.workspaceId);
  const measurementWindow = input.measurementWindow ?? `${new Date().toISOString().slice(0, 10)}`;

  await ensureDefaultCatalogs(workspace.id, db);

  const payload = {
      workspaceId: workspace.id,
      targetEntity: parsedInput.targetEntity,
      measurementWindow,
      methodologyVersion: METHODOLOGY_VERSION,
      querySetVersion: QUERY_SET_VERSION,
      sourceSetVersion: SOURCE_SET_VERSION,
      classificationRuleVersion: CLASS_RULE_VERSION,
      targetAliasesVersion: TARGET_ALIAS_VERSION,
  };

  return db.jobRun.create({
    data: {
      kind: AI_RECOMMENDATION_SHARE_JOB_KIND,
      scheduledFor: input.scheduledFor ?? new Date(),
      payload,
    },
  });
}

export async function executeRecommendationShareRun(jobPayload: Record<string, unknown>, db: RecommendationSchedulerDb = prisma) {
  const resolvedPayload = z
    .object({
      workspaceId: z.string().trim().min(1),
      targetEntity: z.string().trim().min(1),
      measurementWindow: z.string().trim().min(1),
      methodologyVersion: z.string().trim().min(1),
      querySetVersion: z.string().trim().min(1),
      sourceSetVersion: z.string().trim().min(1),
      classificationRuleVersion: z.string().trim().min(1),
      targetAliasesVersion: z.string().trim().min(1),
    })
    .parse(jobPayload);

  const run = await createRecommendationRun({
    workspaceId: resolvedPayload.workspaceId,
    targetEntity: resolvedPayload.targetEntity,
    measurementWindow: resolvedPayload.measurementWindow,
    methodologyVersion: resolvedPayload.methodologyVersion,
    querySetVersion: resolvedPayload.querySetVersion,
    sourceSetVersion: resolvedPayload.sourceSetVersion,
    classificationRuleVersion: resolvedPayload.classificationRuleVersion,
    targetAliasesVersion: resolvedPayload.targetAliasesVersion,
  }, db);

  const activeQueries = await db.aiRecommendationQuery.findMany({
    where: {
      workspaceId: run.workspaceId,
      querySetVersion: resolvedPayload.querySetVersion,
      isActive: true,
    },
    orderBy: { queryId: "asc" },
  });

  const activeSources = await db.aiRecommendationSource.findMany({
    where: {
      workspaceId: run.workspaceId,
      sourceSetVersion: resolvedPayload.sourceSetVersion,
      isActive: true,
    },
    orderBy: { sourceId: "asc" },
  });

  const adapters = getDefaultRecommendationAdapters();
  const adapterMap = new Map(adapters.map((adapter) => [adapter.sourceId, adapter]));
  const targetAliases = Array.from(new Set([resolvedPayload.targetEntity.toLowerCase()]));

  for (const query of activeQueries) {
    for (const source of activeSources) {
      const adapter = adapterMap.get(source.sourceId) ?? adapters[0];
      const captured = await adapter.capture({
        targetEntity: resolvedPayload.targetEntity,
        prompt: query.promptText,
        locale: query.locale,
      });
      const classification = classifyRecommendation({
        rawResponse: captured.rawResponse,
        targetAliases,
      });

      await recordRecommendationCheck({
        runId: run.id,
        queryRecordId: query.id,
        sourceRecordId: source.id,
        validity: classification.validity,
        invalidReason: classification.invalidReason,
        rawResponse: captured.rawResponse,
        normalizedResponse: classification.normalizedResponse,
        requestEnvelope: captured.requestEnvelope,
        responseTruncatedFlag: captured.responseTruncatedFlag,
        classification: classification.classification,
        classificationRationale: classification.classificationRationale,
        reviewRequired: classification.reviewRequired,
      }, db);
    }
  }

  return completeRecommendationRun(run.id, db);
}
