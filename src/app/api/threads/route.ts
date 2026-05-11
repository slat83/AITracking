import { NextResponse } from "next/server";
import { z } from "zod";

import { requireDashboardEditor } from "@/server/dashboard/api-auth";
import {
  addTrackedThread,
  createTrackedThreadInputSchema,
  listTrackedThreads,
  removeTrackedThread,
  trackedThreadIdentifierSchema,
} from "@/server/dashboard/tracking";

export const runtime = "nodejs";

const createThreadPayloadSchema = z.union([
  createTrackedThreadInputSchema,
  z.object({
    threads: z.array(createTrackedThreadInputSchema).min(1),
  }),
]);

const deleteThreadPayloadSchema = z.union([
  trackedThreadIdentifierSchema,
  z.object({
    ids: z.array(z.string().trim().min(1)).min(1).optional(),
    urls: z.array(z.string().trim().url().max(2_000)).min(1).optional(),
  }).refine((value) => Boolean(value.ids?.length || value.urls?.length), {
    message: "Provide ids or urls.",
    path: ["ids"],
  }),
]);

export async function GET() {
  const auth = await requireDashboardEditor();

  if (!auth.ok) {
    return auth.response;
  }

  const threads = await listTrackedThreads();
  return NextResponse.json({ ok: true, threads });
}

export async function POST(request: Request) {
  const auth = await requireDashboardEditor();

  if (!auth.ok) {
    return auth.response;
  }

  try {
    const json = await request.json();
    const payload = createThreadPayloadSchema.parse(json);
    const threads = "threads" in payload ? payload.threads : [payload];

    for (const thread of threads) {
      await addTrackedThread(thread);
    }

    return NextResponse.json({ ok: true, threads: await listTrackedThreads() }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Invalid thread payload.", issues: error.flatten() },
        { status: 400 },
      );
    }

    console.error("Failed to create tracked threads", error);
    return NextResponse.json({ ok: false, error: "Failed to create tracked threads." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const auth = await requireDashboardEditor();

  if (!auth.ok) {
    return auth.response;
  }

  try {
    const json = await request.json();
    const payload = deleteThreadPayloadSchema.parse(json);
    const batchPayload = payload as { ids?: string[]; urls?: string[] };

    if (Array.isArray(batchPayload.ids) || Array.isArray(batchPayload.urls)) {
      for (const id of batchPayload.ids ?? []) {
        await removeTrackedThread({ id });
      }

      for (const url of batchPayload.urls ?? []) {
        await removeTrackedThread({ url });
      }
    } else {
      await removeTrackedThread(payload as z.infer<typeof trackedThreadIdentifierSchema>);
    }

    return NextResponse.json({ ok: true, threads: await listTrackedThreads() });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Invalid thread delete payload.", issues: error.flatten() },
        { status: 400 },
      );
    }

    console.error("Failed to remove tracked threads", error);
    return NextResponse.json({ ok: false, error: "Failed to remove tracked threads." }, { status: 500 });
  }
}
