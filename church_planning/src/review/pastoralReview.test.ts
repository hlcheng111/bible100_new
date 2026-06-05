import { describe, expect, it } from "vitest";
import { buildPastoralReviewDraft } from "./pastoralReview";
import type { MatchResult } from "../matching/matchingEngine";

describe("buildPastoralReviewDraft", () => {
  it("turns pastoral_review matches into a conversation workflow", () => {
    const match: MatchResult = {
      memberId: "m1",
      roleId: "r1",
      finalScore: 78,
      recommendationLevel: "pastoral_review",
      hardBlocks: [],
      reviewFlags: ["burden_safety_low"],
      explanation: [],
      breakdown: {
        ctvSimilarity: 90,
        giftFit: 80,
        availabilityFit: 100,
        experienceFit: 50,
        cultureFit: 80,
        burdenSafety: 30,
      },
    };

    const review = buildPastoralReviewDraft(
      match,
      "pastor-1",
      "2026-05-22T00:00:00.000Z"
    );

    expect(review.status).toBe("needs_conversation");
    expect(review.consentConfirmed).toBe(true);
    expect(review.nextAction).toContain("牧者覆核");
  });
});
