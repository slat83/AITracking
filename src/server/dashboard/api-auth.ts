import { NextResponse } from "next/server";

import { getAuthSession } from "@/server/auth";
import { hasRequiredRole } from "@/server/auth/roles";

export async function requireDashboardEditor() {
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
    session,
  };
}
