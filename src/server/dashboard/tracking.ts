import type { PrismaClient, TrackedKeyword, TrackedRedditPost, TrackedRedditThread } from "@prisma/client";
import { z } from "zod";

import { prisma } from "@/server/db/client";

const DEFAULT_WORKSPACE_SLUG = "default-workspace";
const DEFAULT_WORKSPACE_NAME = "Default Workspace";

type DashboardTrackingDb = Pick<
  PrismaClient,
  "workspace" | "trackedKeyword" | "trackedRedditThread" | "trackedRedditPost"
>;

export const createTrackedKeywordInputSchema = z.object({
  keyword: z.string().trim().min(1).max(200),
});

export const trackedKeywordIdentifierSchema = z
  .object({
    id: z.string().trim().min(1).optional(),
    keyword: z.string().trim().min(1).max(200).optional(),
  })
  .refine((value) => Boolean(value.id || value.keyword), {
    message: "Provide an id or keyword.",
    path: ["id"],
  });

export const createTrackedThreadInputSchema = z.object({
  url: z.string().trim().url().max(2_000),
  title: z.string().trim().max(300).optional(),
});

export const trackedThreadIdentifierSchema = z
  .object({
    id: z.string().trim().min(1).optional(),
    url: z.string().trim().url().max(2_000).optional(),
  })
  .refine((value) => Boolean(value.id || value.url), {
    message: "Provide an id or url.",
    path: ["id"],
  });

export const createTrackedPostInputSchema = z.object({
  url: z.string().trim().url().max(2_000),
  title: z.string().trim().max(300).optional(),
  subreddit: z.string().trim().max(120).optional(),
  author: z.string().trim().max(120).optional(),
});

export const trackedPostIdentifierSchema = z
  .object({
    id: z.string().trim().min(1).optional(),
    url: z.string().trim().url().max(2_000).optional(),
  })
  .refine((value) => Boolean(value.id || value.url), {
    message: "Provide an id or url.",
    path: ["id"],
  });

type KeywordIdentifier = z.infer<typeof trackedKeywordIdentifierSchema>;
type ThreadIdentifier = z.infer<typeof trackedThreadIdentifierSchema>;
type PostIdentifier = z.infer<typeof trackedPostIdentifierSchema>;

type SerializedDashboardKeywordRecord = {
  id: string;
  keyword: string;
  createdAt: string;
  updatedAt: string;
};

type SerializedDashboardThreadRecord = {
  id: string;
  url: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
};

type SerializedDashboardPostRecord = {
  id: string;
  url: string;
  title: string | null;
  subreddit: string | null;
  author: string | null;
  answeredAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type DashboardSnapshot = {
  keywords: SerializedDashboardKeywordRecord[];
  threads: SerializedDashboardThreadRecord[];
  postsToAnswer: SerializedDashboardPostRecord[];
  answeredPosts: SerializedDashboardPostRecord[];
};

function normalizeKeyword(keyword: string) {
  return keyword.trim().replace(/\s+/g, " ");
}

function normalizeOptionalText(value?: string) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function normalizeUrl(value: string) {
  const url = new URL(value.trim());
  url.hash = "";
  url.search = "";

  if (url.pathname.length > 1) {
    url.pathname = url.pathname.replace(/\/+$/, "");
  }

  return url.toString();
}

function serializeKeywordRecord(record: TrackedKeyword): SerializedDashboardKeywordRecord {
  return {
    id: record.id,
    keyword: record.keyword,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function serializeThreadRecord(record: TrackedRedditThread): SerializedDashboardThreadRecord {
  return {
    id: record.id,
    url: record.url,
    title: record.title,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function serializePostRecord(record: TrackedRedditPost): SerializedDashboardPostRecord {
  return {
    id: record.id,
    url: record.url,
    title: record.title,
    subreddit: record.subreddit,
    author: record.author,
    answeredAt: record.answeredAt?.toISOString() ?? null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

async function ensureDashboardWorkspace(db: DashboardTrackingDb) {
  return db.workspace.upsert({
    where: { slug: DEFAULT_WORKSPACE_SLUG },
    update: {
      name: DEFAULT_WORKSPACE_NAME,
      isDefault: true,
    },
    create: {
      slug: DEFAULT_WORKSPACE_SLUG,
      name: DEFAULT_WORKSPACE_NAME,
      isDefault: true,
    },
  });
}

async function resolveTrackedKeyword(db: DashboardTrackingDb, identifier: KeywordIdentifier) {
  const workspace = await ensureDashboardWorkspace(db);

  return db.trackedKeyword.findFirst({
    where: {
      workspaceId: workspace.id,
      ...(identifier.id ? { id: identifier.id } : { keyword: normalizeKeyword(identifier.keyword ?? "") }),
    },
  });
}

async function resolveTrackedThread(db: DashboardTrackingDb, identifier: ThreadIdentifier) {
  const workspace = await ensureDashboardWorkspace(db);

  return db.trackedRedditThread.findFirst({
    where: {
      workspaceId: workspace.id,
      ...(identifier.id ? { id: identifier.id } : { url: normalizeUrl(identifier.url ?? "") }),
    },
  });
}

async function resolveTrackedPost(db: DashboardTrackingDb, identifier: PostIdentifier) {
  const workspace = await ensureDashboardWorkspace(db);

  return db.trackedRedditPost.findFirst({
    where: {
      workspaceId: workspace.id,
      ...(identifier.id ? { id: identifier.id } : { url: normalizeUrl(identifier.url ?? "") }),
    },
    orderBy: [{ createdAt: "desc" }],
  });
}

export async function listTrackedKeywords(db: DashboardTrackingDb = prisma) {
  const workspace = await ensureDashboardWorkspace(db);

  return db.trackedKeyword.findMany({
    where: { workspaceId: workspace.id },
    orderBy: [{ keyword: "asc" }],
  });
}

export async function addTrackedKeyword(
  input: z.infer<typeof createTrackedKeywordInputSchema>,
  db: DashboardTrackingDb = prisma,
) {
  const workspace = await ensureDashboardWorkspace(db);
  const keyword = normalizeKeyword(input.keyword);

  return db.trackedKeyword.upsert({
    where: {
      workspaceId_keyword: {
        workspaceId: workspace.id,
        keyword,
      },
    },
    update: {
      keyword,
    },
    create: {
      workspaceId: workspace.id,
      keyword,
    },
  });
}

export async function replaceTrackedKeywords(
  keywords: string[],
  db: DashboardTrackingDb = prisma,
) {
  const workspace = await ensureDashboardWorkspace(db);
  const normalizedKeywords = Array.from(new Set(keywords.map((keyword) => normalizeKeyword(keyword)).filter(Boolean)));

  await db.trackedKeyword.deleteMany({
    where: { workspaceId: workspace.id },
  });

  if (normalizedKeywords.length > 0) {
    await db.trackedKeyword.createMany({
      data: normalizedKeywords.map((keyword) => ({
        workspaceId: workspace.id,
        keyword,
      })),
      skipDuplicates: true,
    });
  }

  return listTrackedKeywords(db);
}

export async function removeTrackedKeyword(identifier: KeywordIdentifier, db: DashboardTrackingDb = prisma) {
  const existing = await resolveTrackedKeyword(db, identifier);

  if (!existing) {
    return null;
  }

  return db.trackedKeyword.delete({
    where: { id: existing.id },
  });
}

export async function listTrackedThreads(db: DashboardTrackingDb = prisma) {
  const workspace = await ensureDashboardWorkspace(db);

  return db.trackedRedditThread.findMany({
    where: { workspaceId: workspace.id },
    orderBy: [{ createdAt: "desc" }],
  });
}

export async function addTrackedThread(
  input: z.infer<typeof createTrackedThreadInputSchema>,
  db: DashboardTrackingDb = prisma,
) {
  const workspace = await ensureDashboardWorkspace(db);
  const url = normalizeUrl(input.url);
  const title = normalizeOptionalText(input.title);

  return db.trackedRedditThread.create({
    data: {
      workspaceId: workspace.id,
      url,
      title,
    },
  });
}

export async function removeTrackedThread(identifier: ThreadIdentifier, db: DashboardTrackingDb = prisma) {
  const existing = await resolveTrackedThread(db, identifier);

  if (!existing) {
    return null;
  }

  return db.trackedRedditThread.delete({
    where: { id: existing.id },
  });
}

export async function listTrackedPosts(db: DashboardTrackingDb = prisma) {
  const workspace = await ensureDashboardWorkspace(db);
  const [postsToAnswer, answeredPosts] = await Promise.all([
    db.trackedRedditPost.findMany({
      where: {
        workspaceId: workspace.id,
        answeredAt: null,
      },
      orderBy: [{ createdAt: "desc" }],
    }),
    db.trackedRedditPost.findMany({
      where: {
        workspaceId: workspace.id,
        answeredAt: {
          not: null,
        },
      },
      orderBy: [{ answeredAt: "desc" }],
    }),
  ]);

  return {
    postsToAnswer,
    answeredPosts,
  };
}

export async function getDashboardSnapshot(db: DashboardTrackingDb = prisma): Promise<DashboardSnapshot> {
  const [keywords, threads, posts] = await Promise.all([
    listTrackedKeywords(db),
    listTrackedThreads(db),
    listTrackedPosts(db),
  ]);

  return {
    keywords: keywords.map(serializeKeywordRecord),
    threads: threads.map(serializeThreadRecord),
    postsToAnswer: posts.postsToAnswer.map(serializePostRecord),
    answeredPosts: posts.answeredPosts.map(serializePostRecord),
  };
}

export async function addTrackedPost(
  input: z.infer<typeof createTrackedPostInputSchema>,
  db: DashboardTrackingDb = prisma,
) {
  const workspace = await ensureDashboardWorkspace(db);
  const url = normalizeUrl(input.url);
  const title = normalizeOptionalText(input.title);
  const subreddit = normalizeOptionalText(input.subreddit);
  const author = normalizeOptionalText(input.author);

  return db.trackedRedditPost.create({
    data: {
      workspaceId: workspace.id,
      url,
      title,
      subreddit,
      author,
      answeredAt: null,
    },
  });
}

export async function markTrackedPostAnswered(
  identifier: PostIdentifier,
  db: DashboardTrackingDb = prisma,
) {
  const workspace = await ensureDashboardWorkspace(db);
  const existing = identifier.id
    ? await resolveTrackedPost(db, identifier)
    : await db.trackedRedditPost.findFirst({
      where: {
        workspaceId: workspace.id,
        url: normalizeUrl(identifier.url ?? ""),
        answeredAt: null,
      },
      orderBy: [{ createdAt: "desc" }],
    });

  if (!existing) {
    return null;
  }

  if (existing.answeredAt) {
    return existing;
  }

  return db.trackedRedditPost.update({
    where: { id: existing.id },
    data: {
      answeredAt: new Date(),
    },
  });
}

export type DashboardKeywordRecord = TrackedKeyword;
export type DashboardThreadRecord = TrackedRedditThread;
export type DashboardPostRecord = TrackedRedditPost;
