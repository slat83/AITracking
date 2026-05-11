import { describe, expect, it } from "vitest";

import { buildDashboardLoadResult } from "@/components/dashboard-workbench";

describe("dashboard workbench loading", () => {
  it("keeps successful keyword data when another section fails", () => {
    const result = buildDashboardLoadResult({
      keywords: {
        status: "fulfilled",
        value: {
          keywords: [
            {
              id: "kw-1",
              keyword: "best carfax alternative",
              createdAt: "2026-05-11T10:00:00.000Z",
              updatedAt: "2026-05-11T10:00:00.000Z",
            },
          ],
        },
      },
      threads: {
        status: "rejected",
        reason: new Error("Failed to load tracked threads."),
      },
      posts: {
        status: "fulfilled",
        value: {
          postsToAnswer: [],
          answeredPosts: [],
        },
      },
    });

    expect(result.snapshot.keywords).toHaveLength(1);
    expect(result.snapshot.threads).toHaveLength(0);
    expect(result.error).toContain("Threads: Failed to load tracked threads.");
  });
});
