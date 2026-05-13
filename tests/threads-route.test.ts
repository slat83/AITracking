import { beforeEach, describe, expect, it, vi } from "vitest";

const requireDashboardPermission = vi.fn();
const addTrackedThread = vi.fn();
const listTrackedThreads = vi.fn();
const removeTrackedThread = vi.fn();

vi.mock("@/server/dashboard/api-auth", () => ({
  requireDashboardPermission,
}));

vi.mock("@/server/dashboard/tracking", async () => {
  const actual = await vi.importActual<typeof import("@/server/dashboard/tracking")>("@/server/dashboard/tracking");

  return {
    ...actual,
    addTrackedThread,
    listTrackedThreads,
    removeTrackedThread,
  };
});

describe("threads route handlers", () => {
  beforeEach(() => {
    requireDashboardPermission.mockReset();
    addTrackedThread.mockReset();
    listTrackedThreads.mockReset();
    removeTrackedThread.mockReset();

    requireDashboardPermission.mockResolvedValue({
      ok: true,
      session: {
        user: {
          id: "user-1",
          role: "EDITOR",
        },
      },
    });
    listTrackedThreads.mockResolvedValue([
      { id: "thread-1", url: "https://www.reddit.com/r/saas/comments/abc123/thread-title/", title: "Thread title" },
    ]);
  });

  it("lists tracked threads", async () => {
    const { GET } = await import("@/app/api/threads/route");

    const response = await GET(new Request("http://localhost/api/threads"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(requireDashboardPermission).toHaveBeenCalledWith(expect.any(Request), "dashboard:read");
    expect(body.ok).toBe(true);
    expect(body.threads).toHaveLength(1);
  });

  it("creates tracked threads from a batch payload", async () => {
    const { POST } = await import("@/app/api/threads/route");

    const response = await POST(new Request("http://localhost/api/threads", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        threads: [
          { url: "https://www.reddit.com/r/saas/comments/abc123/thread-title/" },
          { url: "https://www.reddit.com/r/askreddit/comments/xyz789/another-thread/" },
        ],
      }),
    }));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(requireDashboardPermission).toHaveBeenCalledWith(expect.any(Request), "dashboard:write");
    expect(addTrackedThread).toHaveBeenCalledTimes(2);
    expect(addTrackedThread).toHaveBeenNthCalledWith(1, {
      url: "https://www.reddit.com/r/saas/comments/abc123/thread-title/",
    });
    expect(addTrackedThread).toHaveBeenNthCalledWith(2, {
      url: "https://www.reddit.com/r/askreddit/comments/xyz789/another-thread/",
    });
    expect(body.ok).toBe(true);
  });

  it("rejects invalid thread create payloads", async () => {
    const { POST } = await import("@/app/api/threads/route");

    const response = await POST(new Request("http://localhost/api/threads", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ threads: [] }),
    }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(requireDashboardPermission).toHaveBeenCalledWith(expect.any(Request), "dashboard:write");
    expect(addTrackedThread).not.toHaveBeenCalled();
    expect(body.ok).toBe(false);
    expect(body.error).toBe("Invalid thread payload.");
  });

  it("marks threads removed for both ids and urls", async () => {
    const { DELETE } = await import("@/app/api/threads/route");

    const response = await DELETE(new Request("http://localhost/api/threads", {
      method: "DELETE",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        ids: ["thread-1"],
        urls: ["https://www.reddit.com/r/saas/comments/abc123/thread-title/"],
      }),
    }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(requireDashboardPermission).toHaveBeenCalledWith(expect.any(Request), "dashboard:write");
    expect(removeTrackedThread).toHaveBeenNthCalledWith(1, { id: "thread-1" });
    expect(removeTrackedThread).toHaveBeenNthCalledWith(2, {
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

    const { POST } = await import("@/app/api/threads/route");

    const response = await POST(new Request("http://localhost/api/threads", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        url: "https://www.reddit.com/r/saas/comments/abc123/thread-title/",
      }),
    }));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(addTrackedThread).not.toHaveBeenCalled();
    expect(listTrackedThreads).not.toHaveBeenCalled();
    expect(body).toMatchObject({ ok: false, error: "Authentication is required." });
  });
});
