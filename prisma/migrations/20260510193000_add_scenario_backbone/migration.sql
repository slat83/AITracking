-- CreateEnum
CREATE TYPE "ScenarioStatus" AS ENUM (
    'INTAKE',
    'TRIAGE',
    'READY_FOR_DRAFT',
    'ACTIVE',
    'BLOCKED',
    'IN_OBSERVATION',
    'RESOLVED',
    'ARCHIVED'
);

-- CreateEnum
CREATE TYPE "ScenarioPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "ScenarioUrgency" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "BusinessImpact" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "ProofReadiness" AS ENUM ('MISSING', 'PARTIAL', 'READY', 'RESTRICTED');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('NOT_REQUIRED', 'PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'BLOCKED', 'COMPLETE', 'CANCELED');

-- CreateEnum
CREATE TYPE "TaskKind" AS ENUM (
    'QUALIFY',
    'DRAFT',
    'REVIEW',
    'RESPOND',
    'OUTREACH',
    'PUBLISH',
    'ESCALATE',
    'MEASURE'
);

-- CreateEnum
CREATE TYPE "ArtifactStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ExecutionTargetStatus" AS ENUM ('ACTIVE', 'PAUSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "OutcomeStatus" AS ENUM (
    'IN_OBSERVATION',
    'RESOLVED',
    'PARTIALLY_RESOLVED',
    'NO_EFFECT',
    'BRANCHED'
);

-- CreateTable
CREATE TABLE "Workspace" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScenarioType" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "family" TEXT NOT NULL,
    "description" TEXT,
    "launchPack" TEXT,
    "launchLabel" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScenarioType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Playbook" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "scenarioTypeId" TEXT NOT NULL,
    "recommendedNextAction" TEXT,
    "defaultTaskKind" "TaskKind",
    "proofGuidance" TEXT,
    "guardrails" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Playbook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scenario" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "sourceOpportunityId" TEXT,
    "scenarioTypeId" TEXT NOT NULL,
    "playbookId" TEXT,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "status" "ScenarioStatus" NOT NULL DEFAULT 'INTAKE',
    "priority" "ScenarioPriority" NOT NULL DEFAULT 'MEDIUM',
    "urgency" "ScenarioUrgency" NOT NULL DEFAULT 'MEDIUM',
    "businessImpact" "BusinessImpact" NOT NULL DEFAULT 'MEDIUM',
    "proofReadiness" "ProofReadiness" NOT NULL DEFAULT 'MISSING',
    "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'NOT_REQUIRED',
    "blockedReason" TEXT,
    "scenarioGoal" TEXT,
    "signalSummary" TEXT,
    "recommendedNextAction" TEXT,
    "ownerId" TEXT,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Scenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "kind" "TaskKind" NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
    "ownerId" TEXT,
    "dueAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Artifact" (
    "id" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "artifactType" TEXT NOT NULL,
    "body" TEXT,
    "status" "ArtifactStatus" NOT NULL DEFAULT 'DRAFT',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Artifact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExecutionTarget" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "accountId" TEXT,
    "name" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "details" JSONB,
    "status" "ExecutionTargetStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExecutionTarget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Outcome" (
    "id" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "status" "OutcomeStatus" NOT NULL,
    "summary" TEXT,
    "nextScenarioId" TEXT,
    "observedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Outcome_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_slug_key" ON "Workspace"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Account_workspaceId_slug_key" ON "Account"("workspaceId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "ScenarioType_slug_key" ON "ScenarioType"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Playbook_slug_key" ON "Playbook"("slug");

-- CreateIndex
CREATE INDEX "Playbook_scenarioTypeId_isDefault_idx" ON "Playbook"("scenarioTypeId", "isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "Scenario_sourceOpportunityId_key" ON "Scenario"("sourceOpportunityId");

-- CreateIndex
CREATE INDEX "Scenario_workspaceId_status_priority_idx" ON "Scenario"("workspaceId", "status", "priority");

-- CreateIndex
CREATE INDEX "Scenario_scenarioTypeId_updatedAt_idx" ON "Scenario"("scenarioTypeId", "updatedAt");

-- CreateIndex
CREATE INDEX "Task_scenarioId_status_idx" ON "Task"("scenarioId", "status");

-- CreateIndex
CREATE INDEX "Artifact_scenarioId_status_idx" ON "Artifact"("scenarioId", "status");

-- CreateIndex
CREATE INDEX "ExecutionTarget_workspaceId_status_idx" ON "ExecutionTarget"("workspaceId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Outcome_scenarioId_key" ON "Outcome"("scenarioId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_workspaceId_fkey"
FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Playbook" ADD CONSTRAINT "Playbook_scenarioTypeId_fkey"
FOREIGN KEY ("scenarioTypeId") REFERENCES "ScenarioType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scenario" ADD CONSTRAINT "Scenario_workspaceId_fkey"
FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scenario" ADD CONSTRAINT "Scenario_accountId_fkey"
FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scenario" ADD CONSTRAINT "Scenario_sourceOpportunityId_fkey"
FOREIGN KEY ("sourceOpportunityId") REFERENCES "Opportunity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scenario" ADD CONSTRAINT "Scenario_scenarioTypeId_fkey"
FOREIGN KEY ("scenarioTypeId") REFERENCES "ScenarioType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scenario" ADD CONSTRAINT "Scenario_playbookId_fkey"
FOREIGN KEY ("playbookId") REFERENCES "Playbook"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scenario" ADD CONSTRAINT "Scenario_ownerId_fkey"
FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_scenarioId_fkey"
FOREIGN KEY ("scenarioId") REFERENCES "Scenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_ownerId_fkey"
FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Artifact" ADD CONSTRAINT "Artifact_scenarioId_fkey"
FOREIGN KEY ("scenarioId") REFERENCES "Scenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Artifact" ADD CONSTRAINT "Artifact_createdById_fkey"
FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionTarget" ADD CONSTRAINT "ExecutionTarget_workspaceId_fkey"
FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionTarget" ADD CONSTRAINT "ExecutionTarget_accountId_fkey"
FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Outcome" ADD CONSTRAINT "Outcome_scenarioId_fkey"
FOREIGN KEY ("scenarioId") REFERENCES "Scenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
