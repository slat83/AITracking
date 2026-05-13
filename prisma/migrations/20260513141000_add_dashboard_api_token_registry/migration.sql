-- Phase-2 dashboard API token hardening: registry-backed tokens with scoped permissions.
CREATE TABLE "DashboardApiToken" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT,
    "label" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "scopes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "consumerId" TEXT,
    "notes" TEXT,
    "lastUsedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DashboardApiToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DashboardApiToken_tokenHash_key" ON "DashboardApiToken"("tokenHash");
CREATE INDEX "DashboardApiToken_workspaceId_revokedAt_idx" ON "DashboardApiToken"("workspaceId", "revokedAt");
CREATE INDEX "DashboardApiToken_revokedAt_createdAt_idx" ON "DashboardApiToken"("revokedAt", "createdAt");

ALTER TABLE "DashboardApiToken"
ADD CONSTRAINT "DashboardApiToken_workspaceId_fkey"
FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;
