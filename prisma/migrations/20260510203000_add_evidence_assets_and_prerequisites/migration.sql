-- CreateEnum
CREATE TYPE "PrerequisiteType" AS ENUM ('EVIDENCE', 'APPROVAL', 'DEPENDENCY', 'ACCESS');

-- CreateEnum
CREATE TYPE "ScenarioPrerequisiteStatus" AS ENUM ('MISSING', 'SATISFIED', 'WAIVED', 'BLOCKED');

-- CreateTable
CREATE TABLE "EvidenceAsset" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "accountId" TEXT,
    "scenarioTypeId" TEXT,
    "slug" TEXT,
    "title" TEXT NOT NULL,
    "proofAssetType" TEXT NOT NULL,
    "claimSupported" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "notes" TEXT,
    "evidenceOwnerId" TEXT,
    "readiness" "ProofReadiness" NOT NULL DEFAULT 'MISSING',
    "verificationMethod" TEXT,
    "allowedUsage" TEXT,
    "restrictedChannels" TEXT[],
    "sensitivityLevel" TEXT,
    "lastVerifiedAt" TIMESTAMP(3),
    "expirationReviewAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EvidenceAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScenarioEvidenceAsset" (
    "scenarioId" TEXT NOT NULL,
    "evidenceAssetId" TEXT NOT NULL,
    "usageSummary" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScenarioEvidenceAsset_pkey" PRIMARY KEY ("scenarioId","evidenceAssetId")
);

-- CreateTable
CREATE TABLE "PlaybookPrerequisite" (
    "id" TEXT NOT NULL,
    "playbookId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "prerequisiteType" "PrerequisiteType" NOT NULL,
    "requiredProofAssetType" TEXT,
    "requiredUsage" TEXT,
    "ownerRole" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlaybookPrerequisite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScenarioPrerequisite" (
    "id" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "playbookPrerequisiteId" TEXT,
    "evidenceAssetId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "prerequisiteType" "PrerequisiteType" NOT NULL,
    "status" "ScenarioPrerequisiteStatus" NOT NULL DEFAULT 'MISSING',
    "blockingReason" TEXT,
    "ownerId" TEXT,
    "satisfiedAt" TIMESTAMP(3),
    "waivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScenarioPrerequisite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EvidenceAsset_slug_key" ON "EvidenceAsset"("slug");

-- CreateIndex
CREATE INDEX "EvidenceAsset_workspaceId_readiness_idx" ON "EvidenceAsset"("workspaceId", "readiness");

-- CreateIndex
CREATE INDEX "EvidenceAsset_scenarioTypeId_proofAssetType_idx" ON "EvidenceAsset"("scenarioTypeId", "proofAssetType");

-- CreateIndex
CREATE INDEX "ScenarioEvidenceAsset_evidenceAssetId_idx" ON "ScenarioEvidenceAsset"("evidenceAssetId");

-- CreateIndex
CREATE UNIQUE INDEX "PlaybookPrerequisite_playbookId_title_key" ON "PlaybookPrerequisite"("playbookId", "title");

-- CreateIndex
CREATE INDEX "PlaybookPrerequisite_playbookId_sortOrder_idx" ON "PlaybookPrerequisite"("playbookId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "ScenarioPrerequisite_scenarioId_playbookPrerequisiteId_key" ON "ScenarioPrerequisite"("scenarioId", "playbookPrerequisiteId");

-- CreateIndex
CREATE INDEX "ScenarioPrerequisite_scenarioId_status_idx" ON "ScenarioPrerequisite"("scenarioId", "status");

-- AddForeignKey
ALTER TABLE "EvidenceAsset" ADD CONSTRAINT "EvidenceAsset_workspaceId_fkey"
FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceAsset" ADD CONSTRAINT "EvidenceAsset_accountId_fkey"
FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceAsset" ADD CONSTRAINT "EvidenceAsset_scenarioTypeId_fkey"
FOREIGN KEY ("scenarioTypeId") REFERENCES "ScenarioType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceAsset" ADD CONSTRAINT "EvidenceAsset_evidenceOwnerId_fkey"
FOREIGN KEY ("evidenceOwnerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScenarioEvidenceAsset" ADD CONSTRAINT "ScenarioEvidenceAsset_scenarioId_fkey"
FOREIGN KEY ("scenarioId") REFERENCES "Scenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScenarioEvidenceAsset" ADD CONSTRAINT "ScenarioEvidenceAsset_evidenceAssetId_fkey"
FOREIGN KEY ("evidenceAssetId") REFERENCES "EvidenceAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaybookPrerequisite" ADD CONSTRAINT "PlaybookPrerequisite_playbookId_fkey"
FOREIGN KEY ("playbookId") REFERENCES "Playbook"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScenarioPrerequisite" ADD CONSTRAINT "ScenarioPrerequisite_scenarioId_fkey"
FOREIGN KEY ("scenarioId") REFERENCES "Scenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScenarioPrerequisite" ADD CONSTRAINT "ScenarioPrerequisite_playbookPrerequisiteId_fkey"
FOREIGN KEY ("playbookPrerequisiteId") REFERENCES "PlaybookPrerequisite"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScenarioPrerequisite" ADD CONSTRAINT "ScenarioPrerequisite_evidenceAssetId_fkey"
FOREIGN KEY ("evidenceAssetId") REFERENCES "EvidenceAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScenarioPrerequisite" ADD CONSTRAINT "ScenarioPrerequisite_ownerId_fkey"
FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
