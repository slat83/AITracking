ALTER TABLE "Opportunity"
ADD COLUMN "scenario" TEXT,
ADD COLUMN "whyNow" TEXT,
ADD COLUMN "suggestedAssetAngle" TEXT,
ADD COLUMN "briefAudience" TEXT,
ADD COLUMN "briefQuestion" TEXT,
ADD COLUMN "assetType" TEXT,
ADD COLUMN "proofRequirement" TEXT,
ADD COLUMN "targetCta" TEXT,
ADD COLUMN "rejectionReason" TEXT,
ADD COLUMN "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "dueDate" TIMESTAMP(3);
