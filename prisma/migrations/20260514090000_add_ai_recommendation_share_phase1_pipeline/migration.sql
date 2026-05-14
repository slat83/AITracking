-- AIT-272 Phase 1 AI Recommendation Share MVP pipeline foundation.
CREATE TYPE "AiRecommendationRunStatus" AS ENUM ('RUNNING', 'COMPLETED');
CREATE TYPE "AiRecommendationCheckValidity" AS ENUM ('VALID', 'INVALID');
CREATE TYPE "AiRecommendationClassification" AS ENUM ('RECOMMENDED', 'MENTIONED', 'NOT_MENTIONED', 'NEGATIVE_MENTION', 'UNCLASSIFIED');

CREATE TABLE "AiRecommendationQuery" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "querySetVersion" TEXT NOT NULL,
    "queryId" TEXT NOT NULL,
    "queryClass" TEXT NOT NULL,
    "promptText" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'en-US',
    "isCore" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiRecommendationQuery_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiRecommendationSource" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "sourceSetVersion" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "sourceTier" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiRecommendationSource_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiRecommendationRun" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "targetEntity" TEXT NOT NULL,
    "measurementWindow" TEXT NOT NULL,
    "methodologyVersion" TEXT NOT NULL,
    "querySetVersion" TEXT NOT NULL,
    "sourceSetVersion" TEXT NOT NULL,
    "classificationRuleVersion" TEXT NOT NULL,
    "targetAliasesVersion" TEXT NOT NULL,
    "status" "AiRecommendationRunStatus" NOT NULL DEFAULT 'RUNNING',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiRecommendationRun_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiRecommendationCheck" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "queryRecordId" TEXT NOT NULL,
    "sourceRecordId" TEXT NOT NULL,
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validity" "AiRecommendationCheckValidity" NOT NULL DEFAULT 'VALID',
    "invalidReason" TEXT,
    "rawResponse" TEXT NOT NULL,
    "normalizedResponse" TEXT,
    "responseTruncatedFlag" BOOLEAN NOT NULL DEFAULT false,
    "requestEnvelope" JSONB,
    "classification" "AiRecommendationClassification" NOT NULL DEFAULT 'UNCLASSIFIED',
    "classificationRationale" TEXT,
    "reviewRequired" BOOLEAN NOT NULL DEFAULT false,
    "reviewedAt" TIMESTAMP(3),
    "reviewerNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiRecommendationCheck_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AiRecommendationQuery_workspaceId_querySetVersion_queryId_key" ON "AiRecommendationQuery"("workspaceId", "querySetVersion", "queryId");
CREATE INDEX "AiRecommendationQuery_workspaceId_querySetVersion_isActive_idx" ON "AiRecommendationQuery"("workspaceId", "querySetVersion", "isActive");

CREATE UNIQUE INDEX "AiRecommendationSource_workspaceId_sourceSetVersion_sourceId_key" ON "AiRecommendationSource"("workspaceId", "sourceSetVersion", "sourceId");
CREATE INDEX "AiRecommendationSource_workspaceId_sourceSetVersion_isActive_idx" ON "AiRecommendationSource"("workspaceId", "sourceSetVersion", "isActive");

CREATE INDEX "AiRecommendationRun_workspaceId_createdAt_idx" ON "AiRecommendationRun"("workspaceId", "createdAt");
CREATE INDEX "AiRecommendationRun_workspaceId_status_measurementWindow_idx" ON "AiRecommendationRun"("workspaceId", "status", "measurementWindow");

CREATE UNIQUE INDEX "AiRecommendationCheck_runId_queryRecordId_sourceRecordId_attemptNumber_key" ON "AiRecommendationCheck"("runId", "queryRecordId", "sourceRecordId", "attemptNumber");
CREATE INDEX "AiRecommendationCheck_runId_capturedAt_idx" ON "AiRecommendationCheck"("runId", "capturedAt");
    CREATE INDEX "AiRecommendationCheck_runId_validity_classification_idx" ON "AiRecommendationCheck"("runId", "validity", "classification");



ALTER TABLE "AiRecommendationQuery"
ADD CONSTRAINT "AiRecommendationQuery_workspaceId_fkey"
FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "AiRecommendationSource"
ADD CONSTRAINT "AiRecommendationSource_workspaceId_fkey"
FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "AiRecommendationRun"
ADD CONSTRAINT "AiRecommendationRun_workspaceId_fkey"
FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "AiRecommendationCheck"
ADD CONSTRAINT "AiRecommendationCheck_runId_fkey"
FOREIGN KEY ("runId") REFERENCES "AiRecommendationRun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "AiRecommendationCheck"
ADD CONSTRAINT "AiRecommendationCheck_queryRecordId_fkey"
FOREIGN KEY ("queryRecordId") REFERENCES "AiRecommendationQuery"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "AiRecommendationCheck"
ADD CONSTRAINT "AiRecommendationCheck_sourceRecordId_fkey"
FOREIGN KEY ("sourceRecordId") REFERENCES "AiRecommendationSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
