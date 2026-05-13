import { createHash, randomBytes } from "node:crypto";

import type { DashboardApiToken, PrismaClient } from "@prisma/client";

import { prisma } from "@/server/db/client";

export const dashboardApiTokenScopeValues = ["dashboard:read", "dashboard:write"] as const;

export type DashboardApiTokenScope = (typeof dashboardApiTokenScopeValues)[number];

const dashboardApiTokenScopeSet = new Set<string>(dashboardApiTokenScopeValues);

export type DashboardTokenRegistryDb = Pick<PrismaClient, "dashboardApiToken">;

export type TokenScopeRequirement = DashboardApiTokenScope;

export type ActiveDashboardApiToken = {
  id: string;
  label: string;
  scopes: DashboardApiTokenScope[];
  workspaceId: string | null;
  consumerId: string | null;
};

function normalizeTokenScope(value: string): DashboardApiTokenScope | null {
  const normalized = value.trim().toLowerCase();

  if (!dashboardApiTokenScopeSet.has(normalized)) {
    return null;
  }

  return normalized as DashboardApiTokenScope;
}

export function normalizeDashboardApiTokenScopes(scopes: readonly string[]): DashboardApiTokenScope[] {
  const normalized = Array.from(
    new Set(
      scopes
        .map((scope) => normalizeTokenScope(scope))
        .filter((scope): scope is DashboardApiTokenScope => Boolean(scope)),
    ),
  );

  if (normalized.length === 0) {
    throw new Error(`At least one valid scope is required (${dashboardApiTokenScopeValues.join(", ")}).`);
  }

  return normalized;
}

function parseStoredScopes(scopes: string[]): DashboardApiTokenScope[] {
  const normalized = scopes
    .map((scope) => normalizeTokenScope(scope))
    .filter((scope): scope is DashboardApiTokenScope => Boolean(scope));

  return Array.from(new Set(normalized));
}

export function hashDashboardApiTokenSecret(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function generateDashboardApiTokenSecret() {
  return `dapi_${randomBytes(32).toString("hex")}`;
}

function mapActiveTokenRecord(record: DashboardApiToken): ActiveDashboardApiToken | null {
  if (record.revokedAt) {
    return null;
  }

  const scopes = parseStoredScopes(record.scopes);

  if (scopes.length === 0) {
    return null;
  }

  return {
    id: record.id,
    label: record.label,
    scopes,
    workspaceId: record.workspaceId,
    consumerId: record.consumerId,
  };
}

export function tokenScopesGrantRequirement(
  tokenScopes: readonly DashboardApiTokenScope[],
  requiredScope: TokenScopeRequirement,
) {
  if (requiredScope === "dashboard:read" && tokenScopes.includes("dashboard:write")) {
    return true;
  }

  return tokenScopes.includes(requiredScope);
}

export async function findActiveDashboardApiTokenBySecret(
  token: string,
  db: DashboardTokenRegistryDb = prisma,
): Promise<ActiveDashboardApiToken | null> {
  const record = await db.dashboardApiToken.findUnique({
    where: {
      tokenHash: hashDashboardApiTokenSecret(token),
    },
  });

  if (!record) {
    return null;
  }

  return mapActiveTokenRecord(record);
}

export async function markDashboardApiTokenUsed(
  tokenId: string,
  db: DashboardTokenRegistryDb = prisma,
): Promise<void> {
  await db.dashboardApiToken.update({
    where: { id: tokenId },
    data: {
      lastUsedAt: new Date(),
    },
  });
}

export async function issueDashboardApiToken(
  input: {
    label: string;
    scopes: readonly string[];
    consumerId?: string | null;
    notes?: string | null;
    workspaceId?: string | null;
    token?: string;
  },
  db: DashboardTokenRegistryDb = prisma,
) {
  const label = input.label.trim();

  if (!label) {
    throw new Error("Token label is required.");
  }

  const token = (input.token?.trim() || generateDashboardApiTokenSecret());
  const scopes = normalizeDashboardApiTokenScopes(input.scopes);

  const record = await db.dashboardApiToken.create({
    data: {
      label,
      tokenHash: hashDashboardApiTokenSecret(token),
      scopes,
      consumerId: input.consumerId?.trim() || null,
      notes: input.notes?.trim() || null,
      workspaceId: input.workspaceId ?? null,
    },
  });

  return {
    id: record.id,
    token,
    label: record.label,
    scopes,
    workspaceId: record.workspaceId,
    consumerId: record.consumerId,
  };
}

export async function revokeDashboardApiTokenById(
  tokenId: string,
  db: DashboardTokenRegistryDb = prisma,
) {
  return db.dashboardApiToken.update({
    where: { id: tokenId },
    data: {
      revokedAt: new Date(),
    },
  });
}
