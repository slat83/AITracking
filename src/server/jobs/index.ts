import { JobRunStatus, type Prisma } from "@prisma/client";

import {
  aggregateAiVisibilityReport,
  AI_VISIBILITY_REPORT_JOB_KIND,
} from "@/server/analytics/visibility";
import { prisma } from "@/server/db/client";

type EnqueueInput = {
  kind: string;
  payload?: Prisma.InputJsonValue;
  scheduledFor?: Date;
};

export async function enqueueJob(input: EnqueueInput) {
  return prisma.jobRun.create({
    data: {
      kind: input.kind,
      payload: input.payload,
      scheduledFor: input.scheduledFor ?? new Date(),
    },
  });
}

export async function claimDueJobs(limit = 10) {
  const dueJobs = await prisma.jobRun.findMany({
    where: {
      status: JobRunStatus.PENDING,
      scheduledFor: { lte: new Date() },
    },
    orderBy: { scheduledFor: "asc" },
    take: limit,
  });

  return Promise.all(
    dueJobs.map((job) =>
      prisma.jobRun.update({
        where: { id: job.id },
        data: {
          status: JobRunStatus.RUNNING,
          attempts: { increment: 1 },
          startedAt: new Date(),
        },
      }),
    ),
  );
}

export async function processDueJobs(batchSize = 10, maxBatches = 10) {
  let processedJobs = 0;

  for (let batchIndex = 0; batchIndex < maxBatches; batchIndex += 1) {
    const jobs = await claimDueJobs(batchSize);

    if (jobs.length === 0) {
      break;
    }

    for (const job of jobs) {
      await processJob(job.id);
      processedJobs += 1;
    }

    if (jobs.length < batchSize) {
      break;
    }
  }

  return processedJobs;
}

export async function processJob(jobId: string) {
  const job = await prisma.jobRun.findUnique({
    where: { id: jobId },
  });

  if (!job) {
    return;
  }

  try {
    switch (job.kind) {
      case "send-reminder":
        await prisma.auditEvent.create({
          data: {
            entityType: "job",
            entityId: job.id,
            action: "reminder.processed",
            payload: job.payload ?? undefined,
          },
        });
        break;
      case AI_VISIBILITY_REPORT_JOB_KIND: {
        const reportDateValue =
          job.payload &&
          typeof job.payload === "object" &&
          !Array.isArray(job.payload) &&
          "reportDate" in job.payload &&
          typeof job.payload.reportDate === "string"
            ? job.payload.reportDate
            : null;

        const reportDate = reportDateValue ? new Date(reportDateValue) : new Date();
        const summary = await aggregateAiVisibilityReport({ reportDate });

        await prisma.auditEvent.create({
          data: {
            entityType: "job",
            entityId: job.id,
            action: "ai-visibility-report.generated",
            payload: {
              reportDate: summary.reportDate.toISOString(),
              pages: summary.pages,
              events: summary.events,
            },
          },
        });
        break;
      }
      default:
        throw new Error(`Unsupported job kind: ${job.kind}`);
    }

    await prisma.jobRun.update({
      where: { id: job.id },
      data: {
        status: JobRunStatus.SUCCEEDED,
        finishedAt: new Date(),
        error: null,
      },
    });
  } catch (error) {
    await prisma.jobRun.update({
      where: { id: job.id },
      data: {
        status: JobRunStatus.FAILED,
        finishedAt: new Date(),
        error: error instanceof Error ? error.message : "Unknown job failure",
      },
    });
  }
}
