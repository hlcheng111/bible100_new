import { describe, expect, it } from "vitest";
import { DEFAULT_VALIDITY_SUMMARY, type CtvVector } from "../ctv/types";
import {
  matchVolunteerToRole,
  rankRoleMatches,
  type MinistryRoleProfile,
  type VolunteerProfile,
} from "./matchingEngine";

function ctv(subjectId: string, scores: Record<"P" | "S" | "G" | "C" | "R" | "F", number>): CtvVector {
  return {
    subjectId,
    subjectType: "member",
    source: "test",
    version: "test",
    scale: "0_100",
    generatedAt: "2026-05-22T00:00:00.000Z",
    validity: DEFAULT_VALIDITY_SUMMARY,
    dimensions: {
      P: { score: scores.P, confidence: 1, evidenceCount: 5, sources: ["test"] },
      S: { score: scores.S, confidence: 1, evidenceCount: 5, sources: ["test"] },
      G: { score: scores.G, confidence: 1, evidenceCount: 5, sources: ["test"] },
      C: { score: scores.C, confidence: 1, evidenceCount: 5, sources: ["test"] },
      R: { score: scores.R, confidence: 1, evidenceCount: 5, sources: ["test"] },
      F: { score: scores.F, confidence: 1, evidenceCount: 5, sources: ["test"] },
    },
  };
}

const youthMentorRole: MinistryRoleProfile = {
  roleId: "youth_mentor",
  roleName: "青少年導師",
  riskLevel: "high",
  requiredCtv: { P: 85, S: 65, G: 45, C: 75, R: 85, F: 80 },
  preferredGiftIds: ["teaching", "shepherding"],
  requiredTrainingIds: ["child_safeguarding"],
  minFaithMaturity: 70,
  minAvailabilityHoursPerMonth: 8,
};

describe("matchVolunteerToRole", () => {
  it("blocks matches when required training is missing", () => {
    const volunteer: VolunteerProfile = {
      memberId: "m1",
      ctv: ctv("m1", { P: 90, S: 70, G: 60, C: 80, R: 88, F: 82 }),
      giftIds: ["teaching"],
      availabilityHoursPerMonth: 10,
    };

    const result = matchVolunteerToRole(volunteer, youthMentorRole);

    expect(result.recommendationLevel).toBe("blocked");
    expect(result.hardBlocks).toContain("missing_training:child_safeguarding");
    expect(result.finalScore).toBe(0);
  });

  it("requires pastoral review when burden safety is low", () => {
    const volunteer: VolunteerProfile = {
      memberId: "m2",
      ctv: ctv("m2", { P: 90, S: 70, G: 60, C: 80, R: 88, F: 82 }),
      giftIds: ["teaching", "shepherding"],
      completedTrainingIds: ["child_safeguarding"],
      availabilityHoursPerMonth: 12,
      burdenRiskScore: 75,
    };

    const result = matchVolunteerToRole(volunteer, youthMentorRole);

    expect(result.recommendationLevel).toBe("pastoral_review");
    expect(result.reviewFlags).toContain("burden_safety_low");
    expect(result.finalScore).toBeGreaterThan(70);
  });

  it("ranks higher scores first", () => {
    const low: VolunteerProfile = {
      memberId: "low",
      ctv: ctv("low", { P: 30, S: 30, G: 30, C: 30, R: 30, F: 72 }),
      completedTrainingIds: ["child_safeguarding"],
      availabilityHoursPerMonth: 8,
    };
    const high: VolunteerProfile = {
      memberId: "high",
      ctv: ctv("high", { P: 88, S: 70, G: 55, C: 78, R: 86, F: 82 }),
      giftIds: ["teaching"],
      completedTrainingIds: ["child_safeguarding"],
      availabilityHoursPerMonth: 12,
      burdenRiskScore: 20,
    };

    expect(rankRoleMatches([low, high], youthMentorRole)[0]?.memberId).toBe("high");
  });
});
