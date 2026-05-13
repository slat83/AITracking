import { beforeEach, describe, expect, it, vi } from "vitest";

const requireDashboardPermission = vi.fn();
const addTrackedPost = vi.fn();
const listTrackedPosts = vi.fn();
const markTrackedPostAnswered = vi.fn();

vi.mock("@/server/dashboard/api-auth", () => ({
  requireDashboardPermission,
}));

vi.mock("@/server/dashboard/tracking", async () => {
  const actual = await vi.importActual<typeof import("@/server/dashboard/tracking")>("@/server/dashboard/tracking");

  return {
    ...actual,
    addTrackedPost,
    listTrackedPosts,
    markTrackedPostAnswered,
  };
});

describe("posts route handlers", () => {
  beforeEach(() => {
    requireDashboardPermission.mockReset();
    addTrackedPost.mockReset();
    listTrackedPosts.mockReset();
    markTrackedPostAnswered.mockReset();

    requireDashboardPermission.mockResolvedValue({
      ok: true,
      session: {
        user: {
          id: "user-1",
          role: "EDITOR",
        },
      },
    });
    listTrackedPosts.mockResolvedValue({
      postsToAnswer: [
        {
          id: "post-1",
          url: "https://www.reddit.com/r/saas/comments/abc123/thread-title/",
          title: "Thread title",
          subreddit: "saas",
          author: "operator",
          answeredAt: null,
          createdAt: new Date("2026-05-13T00:00:00.000Z"),
          updatedAt: new Date("2026-05-13T00:00:00.000Z"),
        },
      ],
      answeredPosts: [],
    });
  });

  it("lists tracked posts", async () => {
    const { GET } = await import("@/app/api/posts/route");

    const response = await GET(new Request("http://localhost/api/posts"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(requireDashboardPermission).toHaveBeenCalledWith(expect.any(Request), "dashboard:read");
    expect(body.ok).toBe(true);
    expect(body.postsToAnswer).toHaveLength(1);
  });

  it("creates tracked posts from a batch payload", async () => {
    const { POST } = await import("@/app/api/posts/route");

    const response = await POST(new Request("http://localhost/api/posts", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        posts: [
          { url: "https://www.reddit.com/r/saas/comments/abc123/thread-title/", subreddit: "saas" },
          { url: "https://www.reddit.com/r/askreddit/comments/xyz789/another-thread/", author: "paperclip" },
        ],
      }),
    }));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(requireDashboardPermission).toHaveBeenCalledWith(expect.any(Request), "dashboard:write");
    expect(addTrackedPost).toHaveBeenCalledTimes(2);
    expect(addTrackedPost).toHaveBeenNthCalledWith(1, {
      url: "https://www.reddit.com/r/saas/comments/abc123/thread-title/",
      subreddit: "saas",
    });
    expect(addTrackedPost).toHaveBeenNthCalledWith(2, {
      url: "https://www.reddit.com/r/askreddit/comments/xyz789/another-thread/",
      author: "paperclip",
    });
    expect(body.ok).toBe(true);
  });

  it("rejects invalid post create payloads", async () => {
    const { POST } = await import("@/app/api/posts/route");

    const response = await POST(new Request("http://localhost/api/posts", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ posts: [] }),
    }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(requireDashboardPermission).toHaveBeenCalledWith(expect.any(Request), "dashboard:write");
    expect(addTrackedPost).not.toHaveBeenCalled();
    expect(body.ok).toBe(false);
    expect(body.error).toBe("Invalid post payload.");
  });

  it("marks posts answered for both ids and urls", async () => {
    const { DELETE } = await import("@/app/api/posts/route");

    const response = await DELETE(new Request("http://localhost/api/posts", {
      method: "DELETE",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        ids: ["post-1"],
        urls: ["https://www.reddit.com/r/saas/comments/abc123/thread-title/"],
      }),
    }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(requireDashboardPermission).toHaveBeenCalledWith(expect.any(Request), "dashboard:write");
    expect(markTrackedPostAnswered).toHaveBeenNthCalledWith(1, { id: "post-1" });
    expect(markTrackedPostAnswered).toHaveBeenNthCalledWith(2, {
      url: "https://www.reddit.com/r/saas/comments/abc123/thread-title/",
    });
    expect(body.ok).toBe(true);
  });

  it("passes through auth failures before mutating data", async () => {
    requireDashboardPermission.mockResolvedValueOnce({
      ok: false,
      response: new Response(JSON.stringify({ ok: false, error: "Authentication is required." }), {
        status: 401,
        headers: { "content-type": "application/json" },
      }),
    });

    const { DELETE } = await import("@/app/api/posts/route");

    const response = await DELETE(new Request("http://localhost/api/posts", {
      method: "DELETE",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ ids: ["post-1"] }),
    }));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(markTrackedPostAnswered).not.toHaveBeenCalled();
    expect(listTrackedPosts).not.toHaveBeenCalled();
    expect(body).toMatchObject({ ok: false, error: "Authentication is required." });
  });
});
