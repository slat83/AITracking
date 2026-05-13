import { beforeEach, describe, expect, it, vi } from "vitest";

const getAuthSession = vi.fn();
const findActiveDashboardApiTokenBySecret = vi.fn();
const markDashboardApiTokenUsed = vi.fn();
const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});

vi.mock("@/server/auth", () => ({
  getAuthSession,
}));

vi.mock("@/server/dashboard/token-registry", () => ({
  findActiveDashboardApiTokenBySecret,
  markDashboardApiTokenUsed,
  tokenScopesGrantRequirement: (scopes: string[], requiredScope: string) => {
    if (requiredScope === "dashboard:read") {
      return scopes.includes("dashboard:read") || scopes.includes("dashboard:write");
    }

    return scopes.includes("dashboard:write");
  },
}));

describe("requireDashboardPermission", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    delete process.env.DASHBOARD_API_TOKEN;
    delete process.env.DASHBOARD_API_TOKEN_PREVIOUS;

    getAuthSession.mockResolvedValue(null);
    findActiveDashboardApiTokenBySecret.mockResolvedValue(null);
    markDashboardApiTokenUsed.mockResolvedValue(undefined);
  });

  it("allows authenticated registry tokens with matching scope", async () => {
    findActiveDashboardApiTokenBySecret.mockResolvedValue({
      id: "token-1",
      label: "agent-reader",
      scopes: ["dashboard:read"],
      workspaceId: null,
      consumerId: "agent-1",
    });

    const { requireDashboardPermission } = await import("@/server/dashboard/api-auth");
    const result = await requireDashboardPermission(
      new Request("http://localhost/api/keywords", {
        headers: {
          authorization: "Bearer registry-token",
        },
      }),
      "dashboard:read",
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.principal).toEqual({
        type: "api_token",
        role: "EDITOR",
        source: "registry",
        tokenId: "token-1",
        tokenLabel: "agent-reader",
        scopes: ["dashboard:read"],
      });
    }
    expect(findActiveDashboardApiTokenBySecret).toHaveBeenCalledWith("registry-token");
    expect(markDashboardApiTokenUsed).toHaveBeenCalledWith("token-1");
    expect(getAuthSession).not.toHaveBeenCalled();
    expect(infoSpy).toHaveBeenCalledWith(
      "[dashboard-token-auth]",
      expect.objectContaining({
        event: "dashboard_token_auth",
        outcome: "authenticated",
        requiredScope: "dashboard:read",
        source: "registry",
        tokenId: "token-1",
        tokenLabel: "agent-reader",
      }),
    );
  });

  it("returns 403 when a registry token is missing the required scope", async () => {
    findActiveDashboardApiTokenBySecret.mockResolvedValue({
      id: "token-2",
      label: "agent-reader",
      scopes: ["dashboard:read"],
      workspaceId: null,
      consumerId: null,
    });

    const { requireDashboardPermission } = await import("@/server/dashboard/api-auth");
    const result = await requireDashboardPermission(
      new Request("http://localhost/api/keywords", {
        headers: {
          authorization: "Bearer read-only-token",
        },
      }),
      "dashboard:write",
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(403);
      await expect(result.response.json()).resolves.toMatchObject({
        ok: false,
        error: "Token scope dashboard:write is required.",
      });
    }
    expect(markDashboardApiTokenUsed).not.toHaveBeenCalled();
    expect(infoSpy).toHaveBeenCalledWith(
      "[dashboard-token-auth]",
      expect.objectContaining({
        event: "dashboard_token_auth",
        outcome: "insufficient_scope",
        requiredScope: "dashboard:write",
        source: "registry",
      }),
    );
  });

  it("allows legacy primary token auth for write scope", async () => {
    process.env.DASHBOARD_API_TOKEN = "secret-token";

    const { requireDashboardPermission } = await import("@/server/dashboard/api-auth");
    const result = await requireDashboardPermission(
      new Request("http://localhost/api/threads", {
        headers: {
          authorization: "Bearer secret-token",
        },
      }),
      "dashboard:write",
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.principal).toEqual({
        type: "api_token",
        role: "EDITOR",
        source: "legacy_env",
        tokenId: null,
        tokenLabel: "legacy-primary",
        scopes: ["dashboard:read", "dashboard:write"],
        matchedTokenSlot: "primary",
      });
    }
    expect(findActiveDashboardApiTokenBySecret).not.toHaveBeenCalled();
    expect(markDashboardApiTokenUsed).not.toHaveBeenCalled();
    expect(infoSpy).toHaveBeenCalledWith(
      "[dashboard-token-auth]",
      expect.objectContaining({
        event: "dashboard_token_auth",
        outcome: "authenticated",
        source: "legacy_env",
        matchedTokenSlot: "primary",
      }),
    );
  });

  it("returns 401 when token does not match registry or legacy env", async () => {
    process.env.DASHBOARD_API_TOKEN = "secret-token";

    const { requireDashboardPermission } = await import("@/server/dashboard/api-auth");
    const result = await requireDashboardPermission(
      new Request("http://localhost/api/posts", {
        headers: {
          authorization: "Bearer wrong-token",
        },
      }),
      "dashboard:write",
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(401);
      await expect(result.response.json()).resolves.toMatchObject({
        ok: false,
        error: "Authentication is required.",
      });
    }
    expect(infoSpy).toHaveBeenCalledWith(
      "[dashboard-token-auth]",
      expect.objectContaining({
        event: "dashboard_token_auth",
        outcome: "invalid_token",
        requiredScope: "dashboard:write",
      }),
    );
  });

  it("returns 500 when token registry lookup fails", async () => {
    findActiveDashboardApiTokenBySecret.mockRejectedValue(new Error("db offline"));

    const { requireDashboardPermission } = await import("@/server/dashboard/api-auth");
    const result = await requireDashboardPermission(
      new Request("http://localhost/api/posts", {
        headers: {
          authorization: "Bearer registry-token",
        },
      }),
      "dashboard:write",
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(500);
      await expect(result.response.json()).resolves.toMatchObject({
        ok: false,
        error: "Dashboard token authentication failed.",
      });
    }
  });

  it("allows editor session access when bearer token is not provided", async () => {
    getAuthSession.mockResolvedValue({
      user: {
        id: "user-1",
        role: "EDITOR",
      },
    });

    const { requireDashboardPermission } = await import("@/server/dashboard/api-auth");
    const result = await requireDashboardPermission(new Request("http://localhost/api/keywords"), "dashboard:read");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.principal).toEqual({ type: "session", role: "EDITOR", userId: "user-1" });
    }
    expect(getAuthSession).toHaveBeenCalledTimes(1);
    expect(infoSpy).not.toHaveBeenCalled();
  });

  it("returns 403 for non-editor sessions", async () => {
    getAuthSession.mockResolvedValue({
      user: {
        id: "user-2",
        role: "VIEWER",
      },
    });

    const { requireDashboardPermission } = await import("@/server/dashboard/api-auth");
    const result = await requireDashboardPermission(new Request("http://localhost/api/keywords"), "dashboard:read");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(403);
      await expect(result.response.json()).resolves.toMatchObject({
        ok: false,
        error: "Editor access is required.",
      });
    }
    expect(getAuthSession).toHaveBeenCalledTimes(1);
    expect(infoSpy).not.toHaveBeenCalled();
  });

  it("returns 401 when neither token nor session auth is available", async () => {
    const { requireDashboardPermission } = await import("@/server/dashboard/api-auth");

    const result = await requireDashboardPermission(new Request("http://localhost/api/keywords"), "dashboard:read");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(401);
      await expect(result.response.json()).resolves.toMatchObject({
        ok: false,
        error: "Authentication is required.",
      });
    }
    expect(getAuthSession).toHaveBeenCalledTimes(1);
    expect(infoSpy).not.toHaveBeenCalled();
  });
});
