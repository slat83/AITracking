import "dotenv/config";

import bcrypt from "bcryptjs";
import { VisibilityEventType } from "@prisma/client";

import {
  AI_VISIBILITY_REPORT_JOB_KIND,
  ensureAiVisibilityReportJob,
} from "../src/server/analytics/visibility";
import { prisma } from "../src/server/db/client";
import { enqueueJob } from "../src/server/jobs";
import { aggregateReviewAcquisitionReport } from "../src/server/reviews/reporting";

function startOfUtcDay(value: Date) {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
}

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@example.com";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "change-me-now";
  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      name: "Founding Admin",
      passwordHash,
      role: "ADMIN",
    },
    create: {
      email,
      name: "Founding Admin",
      passwordHash,
      role: "ADMIN",
    },
  });

  const opportunity = await prisma.opportunity.upsert({
    where: { id: "seed-opportunity" },
    update: {},
    create: {
      id: "seed-opportunity",
      title: "Launch customer proof queue",
      summary: "Capture early customer stories and route them into draft production.",
      sourceName: "Manual intake",
      status: "TRIAGE",
      priority: "HIGH",
      ownerId: admin.id,
      tags: ["launch", "customer-story"],
    },
  });

  const draft = await prisma.draft.upsert({
    where: { id: "seed-draft" },
    update: {},
    create: {
      id: "seed-draft",
      title: "Founder story draft",
      body: "Initial draft body for the content workflow seed.",
      status: "IN_REVIEW",
      createdById: admin.id,
      reviewerId: admin.id,
      opportunityId: opportunity.id,
    },
  });

  const account = await prisma.distributionAccount.upsert({
    where: {
      platform_handle: {
        platform: "linkedin",
        handle: "company-page",
      },
    },
    update: {},
    create: {
      platform: "linkedin",
      handle: "company-page",
      displayName: "Company LinkedIn",
      status: "APPROVED",
      approvedAt: new Date(),
    },
  });

  await prisma.distributionTask.upsert({
    where: { id: "seed-task" },
    update: {},
    create: {
      id: "seed-task",
      draftId: draft.id,
      accountId: account.id,
      assigneeId: admin.id,
      notes: "Seed distribution task for delivery baseline.",
    },
  });

  await enqueueJob({
    kind: "send-reminder",
    payload: { distributionTaskId: "seed-task" },
  });

  const reportDate = startOfUtcDay(new Date(Date.now() - 24 * 60 * 60 * 1000));

  await prisma.visibilityEvent.deleteMany({
    where: {
      sessionId: {
        startsWith: "seed-session-",
      },
    },
  });

  await prisma.aiVisibilityReport.deleteMany({
    where: {
      reportDate,
    },
  });

  await prisma.visibilityEvent.createMany({
    data: [
      {
        pathname: "/compare/best-vin-decoder",
        eventType: VisibilityEventType.PAGE_VIEW,
        pageTitle: "Best VIN Decoder",
        sessionId: "seed-session-1",
        referrer: "https://www.google.com/",
        occurredAt: new Date(reportDate.getTime() + 9 * 60 * 60 * 1000),
      },
      {
        pathname: "/compare/best-vin-decoder",
        eventType: VisibilityEventType.CTA_CLICK,
        pageTitle: "Best VIN Decoder",
        sessionId: "seed-session-1",
        ctaLabel: "primary",
        ctaHref: "https://content-ops.example.com/",
        referrer: "https://www.google.com/",
        occurredAt: new Date(reportDate.getTime() + 9 * 60 * 60 * 1000 + 60 * 1000),
      },
      {
        pathname: "/trust",
        eventType: VisibilityEventType.PAGE_VIEW,
        pageTitle: "Is this service legit?",
        sessionId: "seed-session-2",
        referrer: "https://chatgpt.com/",
        occurredAt: new Date(reportDate.getTime() + 12 * 60 * 60 * 1000),
      },
      {
        pathname: "/pricing/cheap-vin-check",
        eventType: VisibilityEventType.PAGE_VIEW,
        pageTitle: "Cheap VIN Check",
        sessionId: "seed-session-3",
        referrer: "https://www.google.com/",
        occurredAt: new Date(reportDate.getTime() + 16 * 60 * 60 * 1000),
      },
      {
        pathname: "/pricing/cheap-vin-check",
        eventType: VisibilityEventType.CTA_CLICK,
        pageTitle: "Cheap VIN Check",
        sessionId: "seed-session-3",
        ctaLabel: "secondary",
        ctaHref: "https://content-ops.example.com/pricing",
        referrer: "https://www.google.com/",
        occurredAt: new Date(reportDate.getTime() + 16 * 60 * 60 * 1000 + 2 * 60 * 1000),
      },
    ],
  });

  const existingReportJob = await prisma.jobRun.findFirst({
    where: {
      kind: AI_VISIBILITY_REPORT_JOB_KIND,
    },
  });

  if (!existingReportJob) {
    await ensureAiVisibilityReportJob(reportDate, new Date());
  }

  await prisma.reviewFeedback.deleteMany({
    where: {
      inviteId: {
        in: ["seed-review-invite-2", "seed-review-invite-3"],
      },
    },
  });

  await prisma.reviewInvite.deleteMany({
    where: {
      id: {
        in: ["seed-review-invite-1", "seed-review-invite-2", "seed-review-invite-3"],
      },
    },
  });

  const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  await Promise.all([
    prisma.reviewInvite.create({
      data: {
        id: "seed-review-invite-1",
        customerName: "Jordan Miles",
        customerEmail: "jordan.miles@example.com",
        orderReference: "EV-1001",
        trigger: "REPORT_DELIVERED",
        status: "SCHEDULED",
        scheduledFor: new Date(Date.now() + 2 * 60 * 60 * 1000),
        experienceConfirmed: false,
        wantsPublicReview: false,
        notes: "Queued after report delivery with neutral review language.",
        ownerId: admin.id,
        createdAt: new Date(),
      },
    }),
    prisma.reviewInvite.create({
      data: {
        id: "seed-review-invite-2",
        customerName: "Casey Harper",
        customerEmail: "casey.harper@example.com",
        orderReference: "EV-1002",
        trigger: "SUPPORT_RESOLVED",
        status: "PUBLIC_SHARE_READY",
        scheduledFor: new Date(lastWeek.getTime() - 2 * 60 * 60 * 1000),
        sentAt: new Date(lastWeek.getTime() - 60 * 60 * 1000),
        respondedAt: new Date(lastWeek.getTime() + 3 * 60 * 60 * 1000),
        publicShareReadyAt: new Date(lastWeek.getTime() + 3 * 60 * 60 * 1000),
        experienceConfirmed: true,
        wantsPublicReview: true,
        publicReviewUrl: "https://reviews.example.com/content-ops",
        notes: "Customer confirmed the support resolution and opted into a public review link.",
        ownerId: admin.id,
        createdAt: lastWeek,
      },
    }),
    prisma.reviewInvite.create({
      data: {
        id: "seed-review-invite-3",
        customerName: "Taylor Reed",
        customerEmail: "taylor.reed@example.com",
        orderReference: "EV-1003",
        trigger: "REFUND_RESOLVED",
        status: "CLOSED_NO_SHARE",
        scheduledFor: new Date(lastWeek.getTime() + 24 * 60 * 60 * 1000),
        sentAt: new Date(lastWeek.getTime() + 25 * 60 * 60 * 1000),
        respondedAt: new Date(lastWeek.getTime() + 29 * 60 * 60 * 1000),
        closedAt: new Date(lastWeek.getTime() + 29 * 60 * 60 * 1000),
        experienceConfirmed: true,
        wantsPublicReview: false,
        notes: "Kept for operating feedback after a fair refund resolution.",
        ownerId: admin.id,
        createdAt: new Date(lastWeek.getTime() + 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  await prisma.reviewFeedback.createMany({
    data: [
      {
        inviteId: "seed-review-invite-2",
        sentiment: "POSITIVE",
        scenario: "Needed title and accident context before buying from a private seller.",
        usefulPart: "The report layout made the accident timeline easy to review.",
        frictionPoint: "Wanted clearer pricing context before purchase.",
        supportFollowupNeeded: false,
        publicReviewPostedAt: new Date(lastWeek.getTime() + 5 * 60 * 60 * 1000),
      },
      {
        inviteId: "seed-review-invite-3",
        sentiment: "NEGATIVE",
        scenario: "Requested a refund after realizing the vehicle listing had already expired.",
        usefulPart: "Support closed the loop quickly.",
        frictionPoint: "Pricing expectations were unclear before checkout.",
        supportFollowupNeeded: true,
      },
    ],
  });

  await aggregateReviewAcquisitionReport({ window: "WEEK" });
  await aggregateReviewAcquisitionReport({ window: "MONTH" });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
