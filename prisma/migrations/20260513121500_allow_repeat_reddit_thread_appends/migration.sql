-- Allow repeated tracking appends for the same Reddit thread URL within a workspace.
DROP INDEX IF EXISTS "TrackedRedditThread_workspaceId_url_key";
CREATE INDEX IF NOT EXISTS "TrackedRedditThread_workspaceId_url_idx" ON "TrackedRedditThread"("workspaceId", "url");
