-- Allow repeated tracking appends for the same Reddit URL within a workspace.
DROP INDEX IF EXISTS "TrackedRedditPost_workspaceId_url_key";
CREATE INDEX IF NOT EXISTS "TrackedRedditPost_workspaceId_url_idx" ON "TrackedRedditPost"("workspaceId", "url");
