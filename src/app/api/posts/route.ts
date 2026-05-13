import { NextResponse } from "next/server";
import { z } from "zod";

import { requireDashboardEditor } from "@/server/dashboard/api-auth";
import {
  addTrackedPost,
  createTrackedPostInputSchema,
  listTrackedPosts,
  markTrackedPostAnswered,
  trackedPostIdentifierSchema,
} from "@/server/dashboard/tracking";

export const runtime = "nodejs";

const createPostPayloadSchema = z.union([
  createTrackedPostInputSchema,
  z.object({
    posts: z.array(createTrackedPostInputSchema).min(1),
  }),
]);

const answerPostPayloadSchema = z.union([
  trackedPostIdentifierSchema,
  z.object({
    ids: z.array(z.string().trim().min(1)).min(1).optional(),
    urls: z.array(z.string().trim().url().max(2_000)).min(1).optional(),
  }).refine((value) => Boolean(value.ids?.length || value.urls?.length), {
    message: "Provide ids or urls.",
    path: ["ids"],
  }),
]);

export async function GET(request: Request) {
  const auth = await requireDashboardEditor(request);

  if (!auth.ok) {
    return auth.response;
  }

  return NextResponse.json({ ok: true, ...(await listTrackedPosts()) });
}

export async function POST(request: Request) {
  const auth = await requireDashboardEditor(request);

  if (!auth.ok) {
    return auth.response;
  }

  try {
    const json = await request.json();
    const payload = createPostPayloadSchema.parse(json);
    const posts = "posts" in payload ? payload.posts : [payload];

    for (const post of posts) {
      await addTrackedPost(post);
    }

    return NextResponse.json({ ok: true, ...(await listTrackedPosts()) }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Invalid post payload.", issues: error.flatten() },
        { status: 400 },
      );
    }

    console.error("Failed to create tracked posts", error);
    return NextResponse.json({ ok: false, error: "Failed to create tracked posts." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const auth = await requireDashboardEditor(request);

  if (!auth.ok) {
    return auth.response;
  }

  try {
    const json = await request.json();
    const payload = answerPostPayloadSchema.parse(json);
    const batchPayload = payload as { ids?: string[]; urls?: string[] };

    if (Array.isArray(batchPayload.ids) || Array.isArray(batchPayload.urls)) {
      for (const id of batchPayload.ids ?? []) {
        await markTrackedPostAnswered({ id });
      }

      for (const url of batchPayload.urls ?? []) {
        await markTrackedPostAnswered({ url });
      }
    } else {
      await markTrackedPostAnswered(payload as z.infer<typeof trackedPostIdentifierSchema>);
    }

    return NextResponse.json({ ok: true, ...(await listTrackedPosts()) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Invalid post delete payload.", issues: error.flatten() },
        { status: 400 },
      );
    }

    console.error("Failed to mark tracked posts as answered", error);
    return NextResponse.json({ ok: false, error: "Failed to mark tracked posts as answered." }, { status: 500 });
  }
}
