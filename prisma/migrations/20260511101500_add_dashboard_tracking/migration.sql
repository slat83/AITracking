CREATE TABLE "TrackedKeyword" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrackedKeyword_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TrackedRedditThread" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrackedRedditThread_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TrackedRedditPost" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "subreddit" TEXT,
    "author" TEXT,
    "answeredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrackedRedditPost_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TrackedKeyword_workspaceId_keyword_key" ON "TrackedKeyword"("workspaceId", "keyword");
CREATE INDEX "TrackedKeyword_workspaceId_createdAt_idx" ON "TrackedKeyword"("workspaceId", "createdAt");

CREATE UNIQUE INDEX "TrackedRedditThread_workspaceId_url_key" ON "TrackedRedditThread"("workspaceId", "url");
CREATE INDEX "TrackedRedditThread_workspaceId_createdAt_idx" ON "TrackedRedditThread"("workspaceId", "createdAt");

CREATE UNIQUE INDEX "TrackedRedditPost_workspaceId_url_key" ON "TrackedRedditPost"("workspaceId", "url");
CREATE INDEX "TrackedRedditPost_workspaceId_answeredAt_createdAt_idx" ON "TrackedRedditPost"("workspaceId", "answeredAt", "createdAt");

ALTER TABLE "TrackedKeyword"
ADD CONSTRAINT "TrackedKeyword_workspaceId_fkey"
FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "TrackedRedditThread"
ADD CONSTRAINT "TrackedRedditThread_workspaceId_fkey"
FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "TrackedRedditPost"
ADD CONSTRAINT "TrackedRedditPost_workspaceId_fkey"
FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
