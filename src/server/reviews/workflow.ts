import { ReviewInviteStatus, type ReviewSentiment, type ReviewTrigger } from "@prisma/client";

import { prisma } from "@/server/db/client";
import { resolveReviewFeedbackOutcome } from "@/server/reviews/workflow-utils";

type QueueReviewInviteInput = {
  customerName: string;
  customerEmail: string;
  trigger: ReviewTrigger;
  orderReference?: string;
  scheduledFor?: Date | null;
  ownerId?: string | null;
  notes?: string | null;
  actorId?: string | null;
};

type RecordReviewFeedbackInput = {
  inviteId: string;
  sentiment: ReviewSentiment;
  scenario: string;
  usefulPart?: string | null;
  frictionPoint?: string | null;
  supportFollowupNeeded?: boolean;
  experienceConfirmed: boolean;
  wantsPublicReview: boolean;
  respondedAt?: Date;
  actorId?: string | null;
};

type MarkPublicReviewCompletedInput = {
  inviteId: string;
  publicReviewPostedAt?: Date;
  publicReviewUrl?: string | null;
  actorId?: string | null;
};

type CloseReviewInviteInput = {
  inviteId: string;
  closedAt?: Date;
  notes?: string | null;
  actorId?: string | null;
};

export async function queueReviewInvite(input: QueueReviewInviteInput) {
  const scheduledFor = input.scheduledFor ?? null;

  return prisma.$transaction(async (tx) => {
    const invite = await tx.reviewInvite.create({
      data: {
        customerName: input.customerName,
        customerEmail: input.customerEmail.toLowerCase(),
        trigger: input.trigger,
        orderReference: input.orderReference ?? null,
        scheduledFor,
        status: scheduledFor ? ReviewInviteStatus.SCHEDULED : ReviewInviteStatus.DRAFT,
        ownerId: input.ownerId ?? null,
        notes: input.notes ?? null,
      },
    });

    await tx.auditEvent.create({
      data: {
        entityType: "review-invite",
        entityId: invite.id,
        action: "review-invite.queued",
        actorId: input.actorId ?? input.ownerId ?? null,
        payload: {
          trigger: invite.trigger,
          status: invite.status,
          scheduledFor: invite.scheduledFor?.toISOString() ?? null,
        },
      },
    });

    return invite;
  });
}

export async function markReviewInviteSent(inviteId: string, sentAt = new Date(), actorId?: string | null) {
  return prisma.$transaction(async (tx) => {
    const invite = await tx.reviewInvite.update({
      where: { id: inviteId },
      data: {
        status: ReviewInviteStatus.SENT,
        sentAt,
      },
    });

    await tx.auditEvent.create({
      data: {
        entityType: "review-invite",
        entityId: invite.id,
        action: "review-invite.sent",
        actorId: actorId ?? null,
        payload: {
          sentAt: invite.sentAt?.toISOString() ?? sentAt.toISOString(),
        },
      },
    });

    return invite;
  });
}

export async function recordReviewFeedback(input: RecordReviewFeedbackInput) {
  const respondedAt = input.respondedAt ?? new Date();
  const outcome = resolveReviewFeedbackOutcome({
    experienceConfirmed: input.experienceConfirmed,
    wantsPublicReview: input.wantsPublicReview,
    supportFollowupNeeded: input.supportFollowupNeeded ?? false,
    sentiment: input.sentiment,
  });

  return prisma.$transaction(async (tx) => {
    const invite = await tx.reviewInvite.update({
      where: { id: input.inviteId },
      data: {
        status: outcome.status,
        respondedAt,
        experienceConfirmed: input.experienceConfirmed,
        wantsPublicReview: input.wantsPublicReview,
        publicShareReadyAt: outcome.markPublicShareReady ? respondedAt : null,
        closedAt: outcome.markClosed ? respondedAt : null,
      },
    });

    const feedback = await tx.reviewFeedback.upsert({
      where: {
        inviteId: input.inviteId,
      },
      update: {
        sentiment: input.sentiment,
        scenario: input.scenario,
        usefulPart: input.usefulPart ?? null,
        frictionPoint: input.frictionPoint ?? null,
        supportFollowupNeeded: input.supportFollowupNeeded ?? false,
        createdAt: respondedAt,
      },
      create: {
        inviteId: input.inviteId,
        sentiment: input.sentiment,
        scenario: input.scenario,
        usefulPart: input.usefulPart ?? null,
        frictionPoint: input.frictionPoint ?? null,
        supportFollowupNeeded: input.supportFollowupNeeded ?? false,
        createdAt: respondedAt,
      },
    });

    await tx.auditEvent.create({
      data: {
        entityType: "review-invite",
        entityId: invite.id,
        action: "review-invite.feedback-recorded",
        actorId: input.actorId ?? null,
        payload: {
          status: invite.status,
          respondedAt: invite.respondedAt?.toISOString() ?? respondedAt.toISOString(),
          sentiment: feedback.sentiment,
          wantsPublicReview: invite.wantsPublicReview,
          experienceConfirmed: invite.experienceConfirmed,
          supportFollowupNeeded: feedback.supportFollowupNeeded,
        },
      },
    });

    return {
      invite,
      feedback,
    };
  });
}

export async function markPublicReviewCompleted(input: MarkPublicReviewCompletedInput) {
  const publicReviewPostedAt = input.publicReviewPostedAt ?? new Date();

  return prisma.$transaction(async (tx) => {
    const invite = await tx.reviewInvite.update({
      where: { id: input.inviteId },
      data: {
        status: ReviewInviteStatus.COMPLETED,
        publicReviewUrl: input.publicReviewUrl ?? undefined,
      },
    });

    const feedback = await tx.reviewFeedback.update({
      where: {
        inviteId: input.inviteId,
      },
      data: {
        publicReviewPostedAt,
      },
    });

    await tx.auditEvent.create({
      data: {
        entityType: "review-invite",
        entityId: invite.id,
        action: "review-invite.public-review-completed",
        actorId: input.actorId ?? null,
        payload: {
          publicReviewPostedAt: feedback.publicReviewPostedAt?.toISOString() ?? publicReviewPostedAt.toISOString(),
          publicReviewUrl: invite.publicReviewUrl,
        },
      },
    });

    return {
      invite,
      feedback,
    };
  });
}

export async function closeReviewInviteWithoutShare(input: CloseReviewInviteInput) {
  const closedAt = input.closedAt ?? new Date();

  return prisma.$transaction(async (tx) => {
    const invite = await tx.reviewInvite.update({
      where: { id: input.inviteId },
      data: {
        status: ReviewInviteStatus.CLOSED_NO_SHARE,
        closedAt,
        notes: input.notes ?? undefined,
      },
    });

    await tx.auditEvent.create({
      data: {
        entityType: "review-invite",
        entityId: invite.id,
        action: "review-invite.closed-without-share",
        actorId: input.actorId ?? null,
        payload: {
          closedAt: invite.closedAt?.toISOString() ?? closedAt.toISOString(),
          notes: invite.notes,
        },
      },
    });

    return invite;
  });
}
