import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";

import { getAuthSession } from "@/server/auth";
import { hasRequiredRole } from "@/server/auth/roles";

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

export async function requireDashboardEditor(request: Request) {
  const token = parseBearerToken(request.headers.get("authorization"));

  if (token) {
    const configuredToken = process.env.DASHBOARD_API_TOKEN;

    if (!configuredToken) {
      return {
        ok: false as const,
        response: NextResponse.json({ ok: false, error: "DASHBOARD_API_TOKEN is not configured." }, { status: 500 }),
      };
    }

    if (!hasMatchingToken(token, configuredToken)) {
      return {
        ok: false as const,
        response: NextResponse.json({ ok: false, error: "Authentication is required." }, { status: 401 }),
      };
    }

    return {
      ok: true as const,
      principal: {
        type: "api_token" as const,
        role: "EDITOR" as const,
      },
    };
  }

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
