import { ReviewInviteStatus, ReviewSentiment } from "@prisma/client";
import { describe, expect, it } from "vitest";

import { resolveReviewFeedbackOutcome } from "@/server/reviews/workflow-utils";

describe("review workflow utilities", () => {
  it("moves confirmed opt-in feedback to public-share-ready", () => {
    expect(
      resolveReviewFeedbackOutcome({
        experienceConfirmed: true,
        wantsPublicReview: true,
        supportFollowupNeeded: false,
        sentiment: ReviewSentiment.POSITIVE,
      }),
    ).toEqual({
      status: ReviewInviteStatus.PUBLIC_SHARE_READY,
      markPublicShareReady: true,
      markClosed: false,
    });
  });

  it("keeps negative or unresolved feedback open for follow-up", () => {
    expect(
      resolveReviewFeedbackOutcome({
        experienceConfirmed: true,
        wantsPublicReview: false,
        supportFollowupNeeded: true,
        sentiment: ReviewSentiment.NEGATIVE,
      }),
    ).toEqual({
      status: ReviewInviteStatus.FEEDBACK_RECEIVED,
      markPublicShareReady: false,
      markClosed: false,
    });
  });

  it("closes neutral feedback that does not opt into public sharing", () => {
    expect(
      resolveReviewFeedbackOutcome({
        experienceConfirmed: true,
        wantsPublicReview: false,
        supportFollowupNeeded: false,
        sentiment: ReviewSentiment.NEUTRAL,
      }),
    ).toEqual({
      status: ReviewInviteStatus.CLOSED_NO_SHARE,
      markPublicShareReady: false,
      markClosed: true,
    });
  });
});
