import { NextResponse } from "next/server";
import { z } from "zod";

import { requireDashboardEditor } from "@/server/dashboard/api-auth";
import {
  addTrackedKeyword,
  createTrackedKeywordInputSchema,
  listTrackedKeywords,
  removeTrackedKeyword,
  trackedKeywordIdentifierSchema,
} from "@/server/dashboard/tracking";

export const runtime = "nodejs";

const createKeywordPayloadSchema = z.union([
  createTrackedKeywordInputSchema,
  z.object({
    keywords: z.array(z.string().trim().min(1).max(200)).min(1),
  }),
]);

const deleteKeywordPayloadSchema = z.union([
  trackedKeywordIdentifierSchema,
  z.object({
    ids: z.array(z.string().trim().min(1)).min(1).optional(),
    keywords: z.array(z.string().trim().min(1).max(200)).min(1).optional(),
  }).refine((value) => Boolean(value.ids?.length || value.keywords?.length), {
    message: "Provide ids or keywords.",
    path: ["ids"],
  }),
]);

export async function GET() {
  const auth = await requireDashboardEditor();

  if (!auth.ok) {
    return auth.response;
  }

  const keywords = await listTrackedKeywords();
  return NextResponse.json({ ok: true, keywords });
}

export async function POST(request: Request) {
  const auth = await requireDashboardEditor();

  if (!auth.ok) {
    return auth.response;
  }

  try {
    const json = await request.json();
    const payload = createKeywordPayloadSchema.parse(json);
    const keywords = "keywords" in payload ? payload.keywords : [payload.keyword];

    for (const keyword of keywords) {
      await addTrackedKeyword({ keyword });
    }

    return NextResponse.json({ ok: true, keywords: await listTrackedKeywords() }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Invalid keyword payload.", issues: error.flatten() },
        { status: 400 },
      );
    }

    console.error("Failed to create tracked keywords", error);
    return NextResponse.json({ ok: false, error: "Failed to create tracked keywords." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const auth = await requireDashboardEditor();

  if (!auth.ok) {
    return auth.response;
  }

  try {
    const json = await request.json();
    const payload = deleteKeywordPayloadSchema.parse(json);
    const batchPayload = payload as { ids?: string[]; keywords?: string[] };

    if (Array.isArray(batchPayload.ids) || Array.isArray(batchPayload.keywords)) {
      for (const id of batchPayload.ids ?? []) {
        await removeTrackedKeyword({ id });
      }

      for (const keyword of batchPayload.keywords ?? []) {
        await removeTrackedKeyword({ keyword });
      }
    } else {
      await removeTrackedKeyword(payload as z.infer<typeof trackedKeywordIdentifierSchema>);
    }

    return NextResponse.json({ ok: true, keywords: await listTrackedKeywords() });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Invalid keyword delete payload.", issues: error.flatten() },
        { status: 400 },
      );
    }

    console.error("Failed to remove tracked keywords", error);
    return NextResponse.json({ ok: false, error: "Failed to remove tracked keywords." }, { status: 500 });
  }
}
