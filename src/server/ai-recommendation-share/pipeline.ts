import {
  AiRecommendationCheckValidity,
  AiRecommendationClassification,
  AiRecommendationRunStatus,
} from "@prisma/client";

import { prisma } from "@/server/db/client";

type PipelineDb = Pick<
  typeof prisma,
  "aiRecommendationRun" | "aiRecommendationCheck" | "aiRecommendationQuery" | "aiRecommendationSource"
>;

const DEFAULT_DB: PipelineDb = prisma;

export type CreateRecommendationRunInput = {
  workspaceId: string;
  targetEntity: string;
  measurementWindow: string;
  methodologyVersion: string;
  querySetVersion: string;
  sourceSetVersion: string;
  classificationRuleVersion: string;
  targetAliasesVersion: string;
  notes?: string | null;
};

export type RecordRecommendationCheckInput = {
  runId: string;
  queryRecordId: string;
  sourceRecordId: string;
  attemptNumber?: number;
  capturedAt?: Date;
  validity: AiRecommendationCheckValidity;
  invalidReason?: string | null;
  rawResponse: string;
  normalizedResponse?: string | null;
  requestEnvelope?: Record<string, unknown> | null;
  responseTruncatedFlag?: boolean;
  classification: AiRecommendationClassification;
  classificationRationale?: string | null;
  reviewRequired?: boolean;
  reviewedAt?: Date | null;
  reviewerNote?: string | null;
};

export type RecommendationRunSummary = {
  runId: string;
  targetEntity: string;
  measurementWindow: string;
  methodologyVersion: string;
  querySetVersion: string;
  sourceSetVersion: string;
  classificationRuleVersion: string;
  targetAliasesVersion: string;
  runStatus: AiRecommendationRunStatus;
  plannedChecks: number;
  attemptedChecks: number;
  validChecks: number;
  invalidChecks: number;
  achievedCoverageRate: number;
  recommendationShare: number | null;
  mentionShare: number | null;
  negativeMentionRate: number | null;
  classCounts: Record<AiRecommendationClassification, number>;
  queryClassShare: Array<{ queryClass: string; recommendationShare: number }>;
  sourceShare: Array<{ sourceName: string; recommendationShare: number }>;
};

export async function createRecommendationRun(input: CreateRecommendationRunInput, db: PipelineDb = DEFAULT_DB) {
  return db.aiRecommendationRun.create({
    data: {
      workspaceId: input.workspaceId,
      targetEntity: input.targetEntity,
      measurementWindow: input.measurementWindow,
      methodologyVersion: input.methodologyVersion,
      querySetVersion: input.querySetVersion,
      sourceSetVersion: input.sourceSetVersion,
      classificationRuleVersion: input.classificationRuleVersion,
      targetAliasesVersion: input.targetAliasesVersion,
      notes: input.notes ?? null,
      status: AiRecommendationRunStatus.RUNNING,
    },
  });
}

export async function recordRecommendationCheck(input: RecordRecommendationCheckInput, db: PipelineDb = DEFAULT_DB) {
  return db.aiRecommendationCheck.create({
    data: {
      runId: input.runId,
      queryRecordId: input.queryRecordId,
      sourceRecordId: input.sourceRecordId,
      attemptNumber: input.attemptNumber ?? 1,
      capturedAt: input.capturedAt ?? new Date(),
      validity: input.validity,
      invalidReason: input.invalidReason ?? null,
      rawResponse: input.rawResponse,
      normalizedResponse: input.normalizedResponse ?? null,
      requestEnvelope: input.requestEnvelope ?? null,
      responseTruncatedFlag: input.responseTruncatedFlag ?? false,
      classification: input.classification,
      classificationRationale: input.classificationRationale ?? null,
      reviewRequired: input.reviewRequired ?? false,
      reviewedAt: input.reviewedAt ?? null,
      reviewerNote: input.reviewerNote ?? null,
    },
  });
}

export async function completeRecommendationRun(runId: string, db: PipelineDb = DEFAULT_DB) {
  return db.aiRecommendationRun.update({
    where: { id: runId },
    data: {
      status: AiRecommendationRunStatus.COMPLETED,
      completedAt: new Date(),
    },
  });
}

export function summarizeRecommendationChecks(
  checks: Array<{ validity: AiRecommendationCheckValidity; classification: AiRecommendationClassification }>,
  plannedChecks: number,
) {
  const classCounts: Record<AiRecommendationClassification, number> = {
    [AiRecommendationClassification.RECOMMENDED]: 0,
    [AiRecommendationClassification.MENTIONED]: 0,
    [AiRecommendationClassification.NOT_MENTIONED]: 0,
    [AiRecommendationClassification.NEGATIVE_MENTION]: 0,
    [AiRecommendationClassification.UNCLASSIFIED]: 0,
  };

  let validChecks = 0;
  let invalidChecks = 0;

  for (const check of checks) {
    classCounts[check.classification] += 1;

    if (check.validity === AiRecommendationCheckValidity.VALID) {
      validChecks += 1;
    } else {
      invalidChecks += 1;
    }
  }

  const attemptedChecks = checks.length;
  const recommendationShare = validChecks === 0 ? null : classCounts[AiRecommendationClassification.RECOMMENDED] / validChecks;

  return {
    attemptedChecks,
    validChecks,
    invalidChecks,
    achievedCoverageRate: plannedChecks === 0 ? 0 : attemptedChecks / plannedChecks,
    recommendationShare,
    classCounts,
  };
}

export async function buildRecommendationRunSummary(runId: string, db: PipelineDb = DEFAULT_DB): Promise<RecommendationRunSummary> {
  const run = await db.aiRecommendationRun.findUniqueOrThrow({
    where: { id: runId },
  });

  const [queryCount, sourceCount, checks] = await Promise.all([
    db.aiRecommendationQuery.count({
      where: {
        workspaceId: run.workspaceId,
        querySetVersion: run.querySetVersion,
        isActive: true,
      },
    }),
    db.aiRecommendationSource.count({
      where: {
        workspaceId: run.workspaceId,
        sourceSetVersion: run.sourceSetVersion,
        isActive: true,
      },
    }),
    db.aiRecommendationCheck.findMany({
      where: { runId },
      select: {
        validity: true,
        classification: true,
        queryRecord: {
          select: {
            queryClass: true,
          },
        },
        sourceRecord: {
          select: {
            sourceName: true,
          },
        },
      },
    }),
  ]);

  const plannedChecks = queryCount * sourceCount;
  const aggregates = summarizeRecommendationChecks(checks, plannedChecks);
  const recommendationClassifiers = checks.filter((check) => check.validity === AiRecommendationCheckValidity.VALID);
  const recommendationShare = aggregates.validChecks === 0
    ? null
    : aggregates.classCounts[AiRecommendationClassification.RECOMMENDED] / aggregates.validChecks;
  const mentionShare = aggregates.validChecks === 0
    ? null
    : aggregates.classCounts[AiRecommendationClassification.MENTIONED] / aggregates.validChecks;
  const negativeMentionRate = aggregates.validChecks === 0
    ? null
    : aggregates.classCounts[AiRecommendationClassification.NEGATIVE_MENTION] / aggregates.validChecks;

  const queryClassCounts: Record<string, { valid: number; recommended: number }> = {};
  const sourceNameCounts: Record<string, { valid: number; recommended: number }> = {};

  for (const check of recommendationClassifiers) {
    const queryClass = check.queryRecord?.queryClass ?? "unknown";
    const sourceName = check.sourceRecord?.sourceName ?? "unknown";

    queryClassCounts[queryClass] = queryClassCounts[queryClass] ?? { valid: 0, recommended: 0 };
    sourceNameCounts[sourceName] = sourceNameCounts[sourceName] ?? { valid: 0, recommended: 0 };

    queryClassCounts[queryClass].valid += 1;
    sourceNameCounts[sourceName].valid += 1;

    if (check.classification === AiRecommendationClassification.RECOMMENDED) {
      queryClassCounts[queryClass].recommended += 1;
      sourceNameCounts[sourceName].recommended += 1;
    }
  }

  return {
    runId: run.id,
    targetEntity: run.targetEntity,
    measurementWindow: run.measurementWindow,
    methodologyVersion: run.methodologyVersion,
    querySetVersion: run.querySetVersion,
    sourceSetVersion: run.sourceSetVersion,
    classificationRuleVersion: run.classificationRuleVersion,
    targetAliasesVersion: run.targetAliasesVersion,
    runStatus: run.status,
    plannedChecks,
    attemptedChecks: aggregates.attemptedChecks,
    validChecks: aggregates.validChecks,
    invalidChecks: aggregates.invalidChecks,
    achievedCoverageRate: aggregates.achievedCoverageRate,
    recommendationShare,
    mentionShare,
    negativeMentionRate,
    classCounts: aggregates.classCounts,
    queryClassShare: Object.entries(queryClassCounts).map(([queryClass, values]) => ({
      queryClass,
      recommendationShare: values.valid === 0 ? 0 : values.recommended / values.valid,
    })),
    sourceShare: Object.entries(sourceNameCounts).map(([sourceName, values]) => ({
      sourceName,
      recommendationShare: values.valid === 0 ? 0 : values.recommended / values.valid,
    })),
  };
}
