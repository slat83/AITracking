import { ReviewInviteStatus, ReviewSentiment } from "@prisma/client";

type ReviewFeedbackOutcomeInput = {
  experienceConfirmed: boolean;
  wantsPublicReview: boolean;
  supportFollowupNeeded: boolean;
  sentiment: ReviewSentiment;
};

export function resolveReviewFeedbackOutcome(input: ReviewFeedbackOutcomeInput) {
  if (input.wantsPublicReview && input.experienceConfirmed) {
    return {
      status: ReviewInviteStatus.PUBLIC_SHARE_READY,
      markPublicShareReady: true,
      markClosed: false,
    };
  }

  if (input.supportFollowupNeeded || input.sentiment === ReviewSentiment.NEGATIVE) {
    return {
      status: ReviewInviteStatus.FEEDBACK_RECEIVED,
      markPublicShareReady: false,
      markClosed: false,
    };
  }

  return {
    status: ReviewInviteStatus.CLOSED_NO_SHARE,
    markPublicShareReady: false,
    markClosed: true,
  };
}
