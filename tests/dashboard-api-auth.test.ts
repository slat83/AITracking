import { beforeEach, describe, expect, it, vi } from "vitest";

const getAuthSession = vi.fn();

vi.mock("@/server/auth", () => ({
  getAuthSession,
}));

describe("requireDashboardEditor", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    delete process.env.DASHBOARD_API_TOKEN;
  });

  it("allows authenticated bearer tokens", async () => {
    process.env.DASHBOARD_API_TOKEN = "secret-token";
    const { requireDashboardEditor } = await import("@/server/dashboard/api-auth");

    const result = await requireDashboardEditor(new Request("http://localhost/api/keywords", {
      headers: {
        authorization: "Bearer secret-token",
      },
    }));

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.principal).toEqual({ type: "api_token", role: "EDITOR" });
    }
    expect(getAuthSession).not.toHaveBeenCalled();
  });

  it("returns 500 when token auth is attempted but DASHBOARD_API_TOKEN is missing", async () => {
    const { requireDashboardEditor } = await import("@/server/dashboard/api-auth");

    const result = await requireDashboardEditor(new Request("http://localhost/api/keywords", {
      headers: {
        authorization: "Bearer anything",
      },
    }));

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(500);
      await expect(result.response.json()).resolves.toMatchObject({
        ok: false,
        error: "DASHBOARD_API_TOKEN is not configured.",
      });
    }
    expect(getAuthSession).not.toHaveBeenCalled();
  });

  it("returns 401 when bearer token does not match", async () => {
    process.env.DASHBOARD_API_TOKEN = "secret-token";
    const { requireDashboardEditor } = await import("@/server/dashboard/api-auth");

    const result = await requireDashboardEditor(new Request("http://localhost/api/keywords", {
      headers: {
        authorization: "Bearer wrong-token",
      },
    }));

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(401);
      await expect(result.response.json()).resolves.toMatchObject({
        ok: false,
        error: "Authentication is required.",
      });
    }
    expect(getAuthSession).not.toHaveBeenCalled();
  });

  it("allows editor session access when bearer token is not provided", async () => {
    getAuthSession.mockResolvedValue({
      user: {
        id: "user-1",
        role: "EDITOR",
      },
    });
    const { requireDashboardEditor } = await import("@/server/dashboard/api-auth");

    const result = await requireDashboardEditor(new Request("http://localhost/api/keywords"));

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.principal).toEqual({ type: "session", role: "EDITOR", userId: "user-1" });
    }
    expect(getAuthSession).toHaveBeenCalledTimes(1);
  });

  it("returns 403 for non-editor sessions", async () => {
    getAuthSession.mockResolvedValue({
      user: {
        id: "user-2",
        role: "VIEWER",
      },
    });
    const { requireDashboardEditor } = await import("@/server/dashboard/api-auth");

    const result = await requireDashboardEditor(new Request("http://localhost/api/keywords"));

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(403);
      await expect(result.response.json()).resolves.toMatchObject({
        ok: false,
        error: "Editor access is required.",
      });
    }
    expect(getAuthSession).toHaveBeenCalledTimes(1);
  });

  it("returns 401 when neither token nor session auth is available", async () => {
    getAuthSession.mockResolvedValue(null);
    const { requireDashboardEditor } = await import("@/server/dashboard/api-auth");

    const result = await requireDashboardEditor(new Request("http://localhost/api/keywords"));

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(401);
      await expect(result.response.json()).resolves.toMatchObject({
        ok: false,
        error: "Authentication is required.",
      });
    }
    expect(getAuthSession).toHaveBeenCalledTimes(1);
  });
});
