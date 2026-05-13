import { describe, expect, it, vi } from "vitest";

import {
  findActiveDashboardApiTokenBySecret,
  hashDashboardApiTokenSecret,
  issueDashboardApiToken,
  normalizeDashboardApiTokenScopes,
  revokeDashboardApiTokenById,
  tokenScopesGrantRequirement,
} from "@/server/dashboard/token-registry";

describe("dashboard token registry", () => {
  it("normalizes dashboard token scopes and removes duplicates", () => {
    expect(normalizeDashboardApiTokenScopes([" dashboard:read ", "DASHBOARD:WRITE", "dashboard:write"])).toEqual([
      "dashboard:read",
      "dashboard:write",
    ]);
  });

  it("requires at least one valid scope", () => {
    expect(() => normalizeDashboardApiTokenScopes(["unknown:scope"]))
      .toThrow("At least one valid scope is required");
  });

  it("treats dashboard:write as granting dashboard:read", () => {
    expect(tokenScopesGrantRequirement(["dashboard:write"], "dashboard:read")).toBe(true);
    expect(tokenScopesGrantRequirement(["dashboard:read"], "dashboard:write")).toBe(false);
  });

  it("returns only active registry tokens", async () => {
    const token = "dapi_plaintext";
    const findUnique = vi.fn()
      .mockResolvedValueOnce({
        id: "token-1",
        workspaceId: null,
        label: "reader",
        tokenHash: hashDashboardApiTokenSecret(token),
        scopes: ["dashboard:read"],
        consumerId: "agent-1",
        notes: null,
        lastUsedAt: null,
        revokedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .mockResolvedValueOnce({
        id: "token-2",
        workspaceId: null,
        label: "revoked",
        tokenHash: hashDashboardApiTokenSecret(token),
        scopes: ["dashboard:write"],
        consumerId: null,
        notes: null,
        lastUsedAt: null,
        revokedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

    const db = {
      dashboardApiToken: {
        findUnique,
      },
    };

    const active = await findActiveDashboardApiTokenBySecret(token, db as never);
    const revoked = await findActiveDashboardApiTokenBySecret(token, db as never);

    expect(active).toEqual({
      id: "token-1",
      label: "reader",
      scopes: ["dashboard:read"],
      workspaceId: null,
      consumerId: "agent-1",
    });
    expect(revoked).toBeNull();
    expect(findUnique).toHaveBeenNthCalledWith(1, {
      where: {
        tokenHash: hashDashboardApiTokenSecret(token),
      },
    });
  });

  it("issues token records with hashed storage", async () => {
    const create = vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({
      id: "token-3",
      workspaceId: data.workspaceId ?? null,
      label: data.label,
      tokenHash: data.tokenHash,
      scopes: data.scopes,
      consumerId: data.consumerId ?? null,
      notes: data.notes ?? null,
      lastUsedAt: null,
      revokedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const db = {
      dashboardApiToken: {
        create,
      },
    };

    const issued = await issueDashboardApiToken(
      {
        label: "agent writer",
        scopes: ["dashboard:write", "dashboard:read"],
        consumerId: "agent-7",
        token: "dapi_fixed_secret",
      },
      db as never,
    );

    expect(issued).toEqual({
      id: "token-3",
      token: "dapi_fixed_secret",
      label: "agent writer",
      scopes: ["dashboard:write", "dashboard:read"],
      workspaceId: null,
      consumerId: "agent-7",
    });
    expect(create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        label: "agent writer",
        tokenHash: hashDashboardApiTokenSecret("dapi_fixed_secret"),
        scopes: ["dashboard:write", "dashboard:read"],
        consumerId: "agent-7",
      }),
    });
  });

  it("revokes tokens by id", async () => {
    const update = vi.fn().mockResolvedValue({ id: "token-4" });
    const db = {
      dashboardApiToken: {
        update,
      },
    };

    await revokeDashboardApiTokenById("token-4", db as never);

    expect(update).toHaveBeenCalledWith({
      where: { id: "token-4" },
      data: {
        revokedAt: expect.any(Date),
      },
    });
  });
});
