-- CreateEnum
CREATE TYPE "PilotStatus" AS ENUM (
  'LEAD_SUBMITTED',
  'FIT_REVIEW',
  'ACCEPTED_PENDING_INVITE',
  'INVITE_SENT',
  'ONBOARDING_IN_PROGRESS',
  'READY_FOR_AUDIT',
  'AUDIT_IN_PROGRESS',
  'WAITING_ON_FOUNDER',
  'DELIVERY_READY',
  'DELIVERED',
  'FOLLOW_UP',
  'DECLINED',
  'PAUSED'
);

-- CreateEnum
CREATE TYPE "PilotContactStatus" AS ENUM ('PENDING', 'INVITED', 'ACTIVE', 'PAUSED');

-- CreateEnum
CREATE TYPE "PilotInvoiceStatus" AS ENUM ('DRAFT', 'SENT', 'PAID', 'VOID', 'OVERDUE');

-- CreateTable
CREATE TABLE "Pilot" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT,
  "accountId" TEXT,
  "primaryContactUserId" TEXT,
  "brandName" TEXT NOT NULL,
  "websiteUrl" TEXT NOT NULL,
  "status" "PilotStatus" NOT NULL DEFAULT 'LEAD_SUBMITTED',
  "primaryContactName" TEXT NOT NULL,
  "primaryContactEmail" TEXT NOT NULL,
  "primaryContactRole" TEXT,
  "storePlatform" TEXT,
  "productCategory" TEXT,
  "monthlyRevenueBand" TEXT,
  "targetGeography" TEXT,
  "topCompetitors" TEXT[],
  "businessQuestion" TEXT NOT NULL,
  "urgencyNotes" TEXT,
  "reviewNotes" TEXT,
  "clarificationRequest" TEXT,
  "pauseReason" TEXT,
  "currentRequest" TEXT,
  "currentStageNote" TEXT,
  "prioritySurfaces" TEXT[],
  "supportingContext" TEXT,
  "findingsSummary" TEXT,
  "actionPlan" TEXT,
  "deliveryNotes" TEXT,
  "targetDeliveryDate" TIMESTAMP(3),
  "invitedAt" TIMESTAMP(3),
  "acceptedAt" TIMESTAMP(3),
  "declinedAt" TIMESTAMP(3),
  "onboardingStartedAt" TIMESTAMP(3),
  "onboardingCompletedAt" TIMESTAMP(3),
  "deliveredAt" TIMESTAMP(3),
  "pausedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Pilot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PilotContact" (
  "id" TEXT NOT NULL,
  "pilotId" TEXT NOT NULL,
  "userId" TEXT,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "roleLabel" TEXT,
  "isPrimary" BOOLEAN NOT NULL DEFAULT false,
  "status" "PilotContactStatus" NOT NULL DEFAULT 'PENDING',
  "invitedAt" TIMESTAMP(3),
  "acceptedAt" TIMESTAMP(3),
  "lastInviteSentAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "PilotContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PilotInvite" (
  "id" TEXT NOT NULL,
  "pilotId" TEXT NOT NULL,
  "contactId" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "acceptedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "PilotInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PilotInvoice" (
  "id" TEXT NOT NULL,
  "pilotId" TEXT NOT NULL,
  "invoiceNumber" TEXT NOT NULL,
  "status" "PilotInvoiceStatus" NOT NULL DEFAULT 'DRAFT',
  "amountCents" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "description" TEXT NOT NULL,
  "notes" TEXT,
  "issuedAt" TIMESTAMP(3),
  "dueAt" TIMESTAMP(3),
  "sentAt" TIMESTAMP(3),
  "paidAt" TIMESTAMP(3),
  "voidedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "PilotInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pilot_workspaceId_key" ON "Pilot"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "Pilot_accountId_key" ON "Pilot"("accountId");

-- CreateIndex
CREATE INDEX "Pilot_status_updatedAt_idx" ON "Pilot"("status", "updatedAt");

-- CreateIndex
CREATE INDEX "Pilot_primaryContactEmail_idx" ON "Pilot"("primaryContactEmail");

-- CreateIndex
CREATE UNIQUE INDEX "PilotContact_pilotId_email_key" ON "PilotContact"("pilotId", "email");

-- CreateIndex
CREATE INDEX "PilotContact_email_status_idx" ON "PilotContact"("email", "status");

-- CreateIndex
CREATE UNIQUE INDEX "PilotInvite_token_key" ON "PilotInvite"("token");

-- CreateIndex
CREATE INDEX "PilotInvite_pilotId_acceptedAt_idx" ON "PilotInvite"("pilotId", "acceptedAt");

-- CreateIndex
CREATE INDEX "PilotInvite_contactId_acceptedAt_idx" ON "PilotInvite"("contactId", "acceptedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PilotInvoice_invoiceNumber_key" ON "PilotInvoice"("invoiceNumber");

-- CreateIndex
CREATE INDEX "PilotInvoice_pilotId_status_idx" ON "PilotInvoice"("pilotId", "status");

-- CreateIndex
CREATE INDEX "PilotInvoice_dueAt_status_idx" ON "PilotInvoice"("dueAt", "status");

-- AddForeignKey
ALTER TABLE "Pilot"
ADD CONSTRAINT "Pilot_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pilot"
ADD CONSTRAINT "Pilot_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pilot"
ADD CONSTRAINT "Pilot_primaryContactUserId_fkey" FOREIGN KEY ("primaryContactUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PilotContact"
ADD CONSTRAINT "PilotContact_pilotId_fkey" FOREIGN KEY ("pilotId") REFERENCES "Pilot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PilotContact"
ADD CONSTRAINT "PilotContact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PilotInvite"
ADD CONSTRAINT "PilotInvite_pilotId_fkey" FOREIGN KEY ("pilotId") REFERENCES "Pilot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PilotInvite"
ADD CONSTRAINT "PilotInvite_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "PilotContact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PilotInvoice"
ADD CONSTRAINT "PilotInvoice_pilotId_fkey" FOREIGN KEY ("pilotId") REFERENCES "Pilot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
