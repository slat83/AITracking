import { VisibilityEventType } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { trackVisibilityEvent, UnknownAiVisibilityPathnameError } from "@/server/analytics/visibility";

export const runtime = "nodejs";

const visibilityEventSchema = z.object({
  pathname: z.string().min(1),
  eventType: z.nativeEnum(VisibilityEventType),
  sessionId: z.string().min(8).max(128),
  pageTitle: z.string().min(1).max(200).optional(),
  ctaLabel: z.string().min(1).max(80).optional(),
  ctaHref: z.string().min(1).max(500).optional(),
  referrer: z.string().max(500).optional(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const payload = visibilityEventSchema.parse(json);

    await trackVisibilityEvent({
      ...payload,
      userAgent: request.headers.get("user-agent"),
    });

    return NextResponse.json({ ok: true }, { status: 202 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Invalid analytics payload", issues: error.flatten() },
        { status: 400 },
      );
    }

    if (error instanceof UnknownAiVisibilityPathnameError) {
      return NextResponse.json(
        { ok: false, error: "Unknown AI visibility pathname" },
        { status: 400 },
      );
    }

    console.error("Failed to capture visibility event", error);

    return NextResponse.json({ ok: false, error: "Failed to capture event" }, { status: 500 });
  }
}
