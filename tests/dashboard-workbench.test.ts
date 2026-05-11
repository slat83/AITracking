import { describe, expect, it } from "vitest";

import { buildDashboardLoadResult, filterKeywords, filterPosts, filterThreads } from "@/components/dashboard-workbench";

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

describe("dashboard workbench filters", () => {
  it("filters keywords case-insensitively", () => {
    const result = filterKeywords(
      [
        {
          id: "kw-1",
          keyword: "best carfax alternative",
          createdAt: "2026-05-11T10:00:00.000Z",
          updatedAt: "2026-05-11T10:00:00.000Z",
        },
        {
          id: "kw-2",
          keyword: "vin history report",
          createdAt: "2026-05-11T10:00:00.000Z",
          updatedAt: "2026-05-11T10:00:00.000Z",
        },
      ],
      "CARFAX",
    );

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("kw-1");
  });

  it("filters threads by title and url", () => {
    const result = filterThreads(
      [
        {
          id: "thread-1",
          title: "How to check VIN history",
          url: "https://reddit.com/r/cars/comments/abc123/how_to_check_vin_history/",
          createdAt: "2026-05-11T10:00:00.000Z",
          updatedAt: "2026-05-11T10:00:00.000Z",
        },
        {
          id: "thread-2",
          title: null,
          url: "https://reddit.com/r/autos/comments/xyz789/decoder/",
          createdAt: "2026-05-11T10:00:00.000Z",
          updatedAt: "2026-05-11T10:00:00.000Z",
        },
      ],
      "decoder",
    );

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("thread-2");
  });

  it("filters posts across title, url, subreddit, and author", () => {
    const result = filterPosts(
      [
        {
          id: "post-1",
          title: "Need a VIN lookup alternative",
          url: "https://reddit.com/r/whatcarshouldibuy/comments/post1",
          subreddit: "whatcarshouldibuy",
          author: "gearhead",
          answeredAt: null,
          createdAt: "2026-05-11T10:00:00.000Z",
          updatedAt: "2026-05-11T10:00:00.000Z",
        },
        {
          id: "post-2",
          title: "Dealer report question",
          url: "https://reddit.com/r/askcarsales/comments/post2",
          subreddit: "askcarsales",
          author: "papertrail",
          answeredAt: "2026-05-11T11:00:00.000Z",
          createdAt: "2026-05-11T10:00:00.000Z",
          updatedAt: "2026-05-11T10:00:00.000Z",
        },
      ],
      "papertrail",
    );

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("post-2");
  });
});
