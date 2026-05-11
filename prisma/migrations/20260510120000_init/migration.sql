-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'EDITOR', 'VIEWER');

-- CreateEnum
CREATE TYPE "OpportunityStatus" AS ENUM ('INTAKE', 'TRIAGE', 'READY_FOR_DRAFT', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "OpportunityPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "DraftStatus" AS ENUM ('OUTLINE', 'IN_REVIEW', 'APPROVED', 'SCHEDULED', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('PENDING', 'APPROVED', 'PAUSED');

-- CreateEnum
CREATE TYPE "DistributionTaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'COMPLETE', 'BLOCKED');

-- CreateEnum
CREATE TYPE "JobRunStatus" AS ENUM ('PENDING', 'RUNNING', 'SUCCEEDED', 'FAILED');

-- CreateEnum
CREATE TYPE "VisibilityEventType" AS ENUM ('PAGE_VIEW', 'CTA_CLICK');

-- CreateEnum
CREATE TYPE "ReviewTrigger" AS ENUM ('REPORT_DELIVERED', 'SUPPORT_RESOLVED', 'REFUND_RESOLVED');

-- CreateEnum
CREATE TYPE "ReviewInviteStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'SENT', 'FEEDBACK_RECEIVED', 'PUBLIC_SHARE_READY', 'COMPLETED', 'CLOSED_NO_SHARE');

-- CreateEnum
CREATE TYPE "ReviewSentiment" AS ENUM ('POSITIVE', 'NEUTRAL', 'NEGATIVE', 'MIXED');

-- CreateEnum
CREATE TYPE "ReviewReportWindow" AS ENUM ('WEEK', 'MONTH');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'EDITOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Opportunity" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "status" "OpportunityStatus" NOT NULL DEFAULT 'INTAKE',
    "priority" "OpportunityPriority" NOT NULL DEFAULT 'MEDIUM',
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT,

    CONSTRAINT "Opportunity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Draft" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" "DraftStatus" NOT NULL DEFAULT 'OUTLINE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "opportunityId" TEXT,
    "createdById" TEXT NOT NULL,
    "reviewerId" TEXT,

    CONSTRAINT "Draft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DistributionAccount" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "status" "AccountStatus" NOT NULL DEFAULT 'PENDING',
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DistributionAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DistributionTask" (
    "id" TEXT NOT NULL,
    "status" "DistributionTaskStatus" NOT NULL DEFAULT 'TODO',
    "scheduledFor" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "draftId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "assigneeId" TEXT,

    CONSTRAINT "DistributionTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actorId" TEXT,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobRun" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "payload" JSONB,
    "status" "JobRunStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "scheduledFor" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisibilityEvent" (
    "id" TEXT NOT NULL,
    "pathname" TEXT NOT NULL,
    "eventType" "VisibilityEventType" NOT NULL,
    "pageTitle" TEXT,
    "ctaLabel" TEXT,
    "ctaHref" TEXT,
    "sessionId" TEXT NOT NULL,
    "referrer" TEXT,
    "userAgent" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VisibilityEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiVisibilityReport" (
    "id" TEXT NOT NULL,
    "reportDate" TIMESTAMP(3) NOT NULL,
    "pathname" TEXT NOT NULL,
    "pageTitle" TEXT NOT NULL,
    "pageViews" INTEGER NOT NULL DEFAULT 0,
    "uniqueVisitors" INTEGER NOT NULL DEFAULT 0,
    "ctaClicks" INTEGER NOT NULL DEFAULT 0,
    "primaryCtaClicks" INTEGER NOT NULL DEFAULT 0,
    "secondaryCtaClicks" INTEGER NOT NULL DEFAULT 0,
    "topReferrer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiVisibilityReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewInvite" (
    "id" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "orderReference" TEXT,
    "trigger" "ReviewTrigger" NOT NULL,
    "status" "ReviewInviteStatus" NOT NULL DEFAULT 'DRAFT',
    "experienceConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "wantsPublicReview" BOOLEAN NOT NULL DEFAULT false,
    "scheduledFor" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "respondedAt" TIMESTAMP(3),
    "publicShareReadyAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "publicReviewUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT,

    CONSTRAINT "ReviewInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewFeedback" (
    "id" TEXT NOT NULL,
    "inviteId" TEXT NOT NULL,
    "sentiment" "ReviewSentiment" NOT NULL,
    "scenario" TEXT NOT NULL,
    "usefulPart" TEXT,
    "frictionPoint" TEXT,
    "supportFollowupNeeded" BOOLEAN NOT NULL DEFAULT false,
    "publicReviewPostedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReviewFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewAcquisitionReport" (
    "id" TEXT NOT NULL,
    "window" "ReviewReportWindow" NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "invitesCreated" INTEGER NOT NULL DEFAULT 0,
    "invitesSent" INTEGER NOT NULL DEFAULT 0,
    "responsesReceived" INTEGER NOT NULL DEFAULT 0,
    "publicShareReady" INTEGER NOT NULL DEFAULT 0,
    "publicReviewsCompleted" INTEGER NOT NULL DEFAULT 0,
    "closedWithoutShare" INTEGER NOT NULL DEFAULT 0,
    "negativeFeedbackCount" INTEGER NOT NULL DEFAULT 0,
    "responseRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "sentimentBreakdown" JSONB,
    "triggerBreakdown" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReviewAcquisitionReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "DistributionAccount_platform_handle_key" ON "DistributionAccount"("platform", "handle");

-- CreateIndex
CREATE INDEX "JobRun_status_scheduledFor_idx" ON "JobRun"("status", "scheduledFor");

-- CreateIndex
CREATE INDEX "VisibilityEvent_pathname_occurredAt_idx" ON "VisibilityEvent"("pathname", "occurredAt");

-- CreateIndex
CREATE INDEX "VisibilityEvent_eventType_occurredAt_idx" ON "VisibilityEvent"("eventType", "occurredAt");

-- CreateIndex
CREATE INDEX "AiVisibilityReport_reportDate_idx" ON "AiVisibilityReport"("reportDate");

-- CreateIndex
CREATE UNIQUE INDEX "AiVisibilityReport_reportDate_pathname_key" ON "AiVisibilityReport"("reportDate", "pathname");

-- CreateIndex
CREATE INDEX "ReviewInvite_status_scheduledFor_idx" ON "ReviewInvite"("status", "scheduledFor");

-- CreateIndex
CREATE INDEX "ReviewInvite_trigger_createdAt_idx" ON "ReviewInvite"("trigger", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewFeedback_inviteId_key" ON "ReviewFeedback"("inviteId");

-- CreateIndex
CREATE INDEX "ReviewAcquisitionReport_window_periodStart_idx" ON "ReviewAcquisitionReport"("window", "periodStart");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewAcquisitionReport_window_periodStart_periodEnd_key" ON "ReviewAcquisitionReport"("window", "periodStart", "periodEnd");

-- AddForeignKey
ALTER TABLE "Opportunity" ADD CONSTRAINT "Opportunity_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Draft" ADD CONSTRAINT "Draft_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Draft" ADD CONSTRAINT "Draft_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Draft" ADD CONSTRAINT "Draft_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DistributionTask" ADD CONSTRAINT "DistributionTask_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "Draft"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DistributionTask" ADD CONSTRAINT "DistributionTask_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "DistributionAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DistributionTask" ADD CONSTRAINT "DistributionTask_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewInvite" ADD CONSTRAINT "ReviewInvite_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewFeedback" ADD CONSTRAINT "ReviewFeedback_inviteId_fkey" FOREIGN KEY ("inviteId") REFERENCES "ReviewInvite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
