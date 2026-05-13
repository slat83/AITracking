import type { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "node:crypto";

import { getAuthSession } from "@/server/auth";
import { hasRequiredRole } from "@/server/auth/roles";
import {
  findActiveDashboardApiTokenBySecret,
  markDashboardApiTokenUsed,
  tokenScopesGrantRequirement,
  type DashboardApiTokenScope,
} from "@/server/dashboard/token-registry";

type DashboardTokenSlot = "primary" | "previous";

type ConfiguredDashboardToken = {
  slot: DashboardTokenSlot;
  value: string;
};

type DashboardTokenAuthSource = "registry" | "legacy_env";

type DashboardTokenAuthOutcome = "authenticated" | "invalid_token" | "insufficient_scope";

type DashboardTokenPrincipal = {
  type: "api_token";
  role: "EDITOR";
  source: DashboardTokenAuthSource;
  tokenId: string | null;
  tokenLabel: string;
  scopes: DashboardApiTokenScope[];
};

type DashboardSessionPrincipal = {
  type: "session";
  role: UserRole;
  userId: string;
};

type DashboardPrincipal = DashboardTokenPrincipal | DashboardSessionPrincipal;

const DASHBOARD_WRITE_SCOPE: DashboardApiTokenScope = "dashboard:write";
const DASHBOARD_READ_SCOPE: DashboardApiTokenScope = "dashboard:read";
const LEGACY_ENV_TOKEN_SCOPES = [DASHBOARD_READ_SCOPE, DASHBOARD_WRITE_SCOPE] as const;

function hasMatchingToken(candidate: string, expected: string) {
  const candidateBuffer = Buffer.from(candidate);
  const expectedBuffer = Buffer.from(expected);

  if (candidateBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(candidateBuffer, expectedBuffer);
}

function parseBearerToken(headerValue: string | null) {
  if (!headerValue) {
    return null;
  }

  const [scheme, token, ...rest] = headerValue.trim().split(/\s+/);
  if (scheme?.toLowerCase() !== "bearer" || !token || rest.length > 0) {
    return null;
  }

  return token;
}

function normalizeToken(value: string | undefined) {
  const normalized = value?.trim();
  if (!normalized) {
    return null;
  }

  return normalized;
}

function getConfiguredDashboardTokens() {
  const configuredTokens: ConfiguredDashboardToken[] = [];
  const primaryToken = normalizeToken(process.env.DASHBOARD_API_TOKEN);
  const previousToken = normalizeToken(process.env.DASHBOARD_API_TOKEN_PREVIOUS);

  if (primaryToken) {
    configuredTokens.push({ slot: "primary", value: primaryToken });
  }

  if (previousToken && previousToken !== primaryToken) {
    configuredTokens.push({ slot: "previous", value: previousToken });
  }

  return configuredTokens;
}

function hashFingerprint(value: string) {
  return createHash("sha256").update(value).digest("hex").slice(0, 12);
}

function getCallerFingerprint(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const userAgent = request.headers.get("user-agent")?.trim();
  const source = [forwardedFor, userAgent].filter(Boolean).join("|");

  if (!source) {
    return null;
  }

  return hashFingerprint(source);
}

function hasRequiredTokenScope(
  tokenScopes: readonly DashboardApiTokenScope[],
  requiredScope: DashboardApiTokenScope,
) {
  return tokenScopesGrantRequirement(tokenScopes, requiredScope);
}

function logDashboardTokenAuthTelemetry(
  request: Request,
  {
    outcome,
    requiredScope,
    token,
    source,
    tokenId,
    tokenLabel,
    matchedTokenSlot,
  }: {
    outcome: DashboardTokenAuthOutcome;
    requiredScope: DashboardApiTokenScope;
    token: string;
    source?: DashboardTokenAuthSource;
    tokenId?: string | null;
    tokenLabel?: string | null;
    matchedTokenSlot?: DashboardTokenSlot;
  },
) {
  let pathname = request.url;
  try {
    pathname = new URL(request.url).pathname;
  } catch {
    pathname = request.url;
  }

  console.info("[dashboard-token-auth]", {
    event: "dashboard_token_auth",
    timestamp: new Date().toISOString(),
    method: request.method,
    pathname,
    outcome,
    requiredScope,
    source: source ?? null,
    tokenId: tokenId ?? null,
    tokenLabel: tokenLabel ?? null,
    tokenFingerprint: hashFingerprint(token),
    callerFingerprint: getCallerFingerprint(request),
    matchedTokenSlot: matchedTokenSlot ?? null,
  });
}

function authenticateLegacyEnvToken(token: string): (DashboardTokenPrincipal & { matchedTokenSlot: DashboardTokenSlot }) | null {
  const configuredTokens = getConfiguredDashboardTokens();

  if (configuredTokens.length === 0) {
    return null;
  }

  const matchedToken = configuredTokens.find((configuredToken) => hasMatchingToken(token, configuredToken.value));

  if (!matchedToken) {
    return null;
  }

  return {
    type: "api_token",
    role: "EDITOR",
    source: "legacy_env",
    tokenId: null,
    tokenLabel: `legacy-${matchedToken.slot}`,
    scopes: [...LEGACY_ENV_TOKEN_SCOPES],
    matchedTokenSlot: matchedToken.slot,
  };
}

async function authenticateRegistryToken(token: string) {
  const activeToken = await findActiveDashboardApiTokenBySecret(token);

  if (!activeToken) {
    return null;
  }

  return {
    type: "api_token" as const,
    role: "EDITOR" as const,
    source: "registry" as const,
    tokenId: activeToken.id,
    tokenLabel: activeToken.label,
    scopes: activeToken.scopes,
  };
}

async function authenticateDashboardToken(token: string) {
  const legacyToken = authenticateLegacyEnvToken(token);

  if (legacyToken) {
    return legacyToken;
  }

  const registryToken = await authenticateRegistryToken(token);

  if (!registryToken) {
    return null;
  }

  return registryToken;
}

async function recordTokenUsageIfRegistryToken(principal: DashboardTokenPrincipal) {
  if (principal.source !== "registry" || !principal.tokenId) {
    return;
  }

  try {
    await markDashboardApiTokenUsed(principal.tokenId);
  } catch (error) {
    console.error("Failed to update dashboard API token usage.", error);
  }
}

function deniedForMissingTokenScope(requiredScope: DashboardApiTokenScope) {
  return NextResponse.json(
    { ok: false, error: `Token scope ${requiredScope} is required.` },
    { status: 403 },
  );
}

async function authorizeDashboardSession() {
  const session = await getAuthSession();

  if (!session?.user) {
    return {
      ok: false as const,
      response: NextResponse.json({ ok: false, error: "Authentication is required." }, { status: 401 }),
    };
  }

  if (!hasRequiredRole(session.user.role, "EDITOR")) {
    return {
      ok: false as const,
      response: NextResponse.json({ ok: false, error: "Editor access is required." }, { status: 403 }),
    };
  }

  return {
    ok: true as const,
    principal: {
      type: "session" as const,
      role: session.user.role,
      userId: session.user.id,
    },
  };
}

export async function requireDashboardPermission(request: Request, requiredScope: DashboardApiTokenScope) {
  const token = parseBearerToken(request.headers.get("authorization"));

  if (token) {
    let principal: Awaited<ReturnType<typeof authenticateDashboardToken>>;

    try {
      principal = await authenticateDashboardToken(token);
    } catch (error) {
      console.error("Failed to authenticate dashboard API token.", error);
      return {
        ok: false as const,
        response: NextResponse.json({ ok: false, error: "Dashboard token authentication failed." }, { status: 500 }),
      };
    }

    if (!principal) {
      logDashboardTokenAuthTelemetry(request, {
        outcome: "invalid_token",
        requiredScope,
        token,
      });
      return {
        ok: false as const,
        response: NextResponse.json({ ok: false, error: "Authentication is required." }, { status: 401 }),
      };
    }

    if (!hasRequiredTokenScope(principal.scopes, requiredScope)) {
      logDashboardTokenAuthTelemetry(request, {
        outcome: "insufficient_scope",
        requiredScope,
        token,
        source: principal.source,
        tokenId: principal.tokenId,
        tokenLabel: principal.tokenLabel,
        matchedTokenSlot: "matchedTokenSlot" in principal ? principal.matchedTokenSlot : undefined,
      });

      return {
        ok: false as const,
        response: deniedForMissingTokenScope(requiredScope),
      };
    }

    await recordTokenUsageIfRegistryToken(principal);

    logDashboardTokenAuthTelemetry(request, {
      outcome: "authenticated",
      requiredScope,
      token,
      source: principal.source,
      tokenId: principal.tokenId,
      tokenLabel: principal.tokenLabel,
      matchedTokenSlot: "matchedTokenSlot" in principal ? principal.matchedTokenSlot : undefined,
    });

    return {
      ok: true as const,
      principal: principal as DashboardPrincipal,
    };
  }

  return authorizeDashboardSession();
}

export async function requireDashboardEditor(request: Request) {
  return requireDashboardPermission(request, "dashboard:write");
}
