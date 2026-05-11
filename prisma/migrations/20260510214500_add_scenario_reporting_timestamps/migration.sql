ALTER TABLE "Scenario"
ADD COLUMN "triagedAt" TIMESTAMP(3),
ADD COLUMN "firstTaskAt" TIMESTAMP(3),
ADD COLUMN "blockedAt" TIMESTAMP(3),
ADD COLUMN "approvalRequestedAt" TIMESTAMP(3),
ADD COLUMN "approvalResolvedAt" TIMESTAMP(3),
ADD COLUMN "firstOutcomeAt" TIMESTAMP(3);
