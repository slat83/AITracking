import { describe, expect, it, vi } from "vitest";

import {
  addTrackedPost,
  createTrackedKeywordInputSchema,
  createTrackedThreadInputSchema,
  listTrackedPosts,
  markTrackedPostAnswered,
} from "@/server/dashboard/tracking";

function createDashboardDb() {
  const workspace = { id: "workspace-1", slug: "default-workspace", name: "Default Workspace", isDefault: true };
  const posts: Array<{
    id: string;
    workspaceId: string;
    url: string;
    title: string | null;
    subreddit: string | null;
    author: string | null;
    answeredAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }> = [];

  return {
    workspace: {
      upsert: vi.fn(async () => workspace),
    },
    trackedKeyword: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
    },
    trackedRedditThread: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
    },
    trackedRedditPost: {
      upsert: vi.fn(async ({ create, update, where }: {
        create: typeof posts[number];
        update: Partial<typeof posts[number]>;
        where: { workspaceId_url: { workspaceId: string; url: string } };
      }) => {
        const existing = posts.find((post) => (
          post.workspaceId === where.workspaceId_url.workspaceId && post.url === where.workspaceId_url.url
        ));

        if (existing) {
          Object.assign(existing, update, { updatedAt: new Date("2026-05-11T10:00:00.000Z") });
          return existing;
        }

        const next = {
          ...create,
          id: `post-${posts.length + 1}`,
          createdAt: new Date("2026-05-11T09:00:00.000Z"),
          updatedAt: new Date("2026-05-11T09:00:00.000Z"),
          answeredAt: create.answeredAt ?? null,
        };
        posts.push(next);
        return next;
      }),
      findFirst: vi.fn(async ({ where }: { where: { id?: string; workspaceId: string; url?: string } }) => (
        posts.find((post) => (
          post.workspaceId === where.workspaceId
          && (where.id ? post.id === where.id : post.url === where.url)
        )) ?? null
      )),
      findMany: vi.fn(async ({ where }: {
        where: { workspaceId: string; answeredAt: null | { not: null } };
      }) => {
        const filtered = posts.filter((post) => (
          post.workspaceId === where.workspaceId
          && (where.answeredAt === null ? post.answeredAt === null : post.answeredAt !== null)
        ));

        return filtered.map((post) => ({ ...post }));
      }),
      update: vi.fn(async ({ where, data }: {
        where: { id: string };
        data: { answeredAt: Date };
      }) => {
        const post = posts.find((entry) => entry.id === where.id);

        if (!post) {
          throw new Error("Post not found.");
        }

        post.answeredAt = data.answeredAt;
        post.updatedAt = data.answeredAt;
        return { ...post };
      }),
    },
  };
}

describe("dashboard tracking", () => {
  it("validates tracked keywords and trims whitespace", () => {
    expect(createTrackedKeywordInputSchema.parse({ keyword: "  best vin decoder  " })).toEqual({
      keyword: "best vin decoder",
    });
  });

  it("validates tracked threads as URLs", () => {
    expect(createTrackedThreadInputSchema.safeParse({
      url: "https://www.reddit.com/r/saas/comments/abc123/thread-title/",
    }).success).toBe(true);
    expect(createTrackedThreadInputSchema.safeParse({ url: "not-a-url" }).success).toBe(false);
  });

  it("moves answered posts out of the active list instead of deleting them", async () => {
    const db = createDashboardDb();

    await addTrackedPost({
      url: "https://www.reddit.com/r/saas/comments/abc123/launch_feedback/",
      title: "Launch feedback",
      subreddit: "saas",
      author: "founder_ops",
    }, db as never);

    const beforeAnswer = await listTrackedPosts(db as never);
    expect(beforeAnswer.postsToAnswer).toHaveLength(1);
    expect(beforeAnswer.answeredPosts).toHaveLength(0);

    await markTrackedPostAnswered({ url: "https://www.reddit.com/r/saas/comments/abc123/launch_feedback/" }, db as never);

    const afterAnswer = await listTrackedPosts(db as never);
    expect(afterAnswer.postsToAnswer).toHaveLength(0);
    expect(afterAnswer.answeredPosts).toHaveLength(1);
    expect(afterAnswer.answeredPosts[0]?.answeredAt).toBeInstanceOf(Date);
  });
});
