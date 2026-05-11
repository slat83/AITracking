import { NextResponse } from "next/server";

import { prisma } from "@/server/db/client";
import { getReleaseMetadata } from "@/server/release";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const timestamp = new Date().toISOString();
  const { searchParams } = new URL(request.url);
  const deepHealthcheck = searchParams.get("deep") === "1";
  const release = getReleaseMetadata();

  if (!deepHealthcheck) {
    return NextResponse.json({
      ok: true,
      service: release.service,
      timestamp,
      release,
      checks: {
        application: "ok",
      },
    });
  }

  try {
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      ok: true,
      service: release.service,
      timestamp,
      release,
      checks: {
        application: "ok",
        database: "ok",
      },
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        service: release.service,
        timestamp,
        release,
        checks: {
          application: "ok",
          database: "error",
        },
      },
      { status: 503 },
    );
  }
}
