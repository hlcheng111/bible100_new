import { describe, expect, it } from "vitest";
import { DEFAULT_VALIDITY_SUMMARY, type CtvVector } from "../ctv/types";
import type { MinistryRoleProfile, VolunteerProfile } from "../matching/matchingEngine";
import {
  recommendRaciRoleByVector,
  summarizeTeamComposition,
  recommendRoleMatches,
} from "./matchEngine";

function ctv(
  subjectId: string,
  scores: Record<"P" | "S" | "G" | "C" | "R" | "F", number>
): CtvVector {
  return {
    subjectId,
    subjectType: "member",
    source: "test",
    version: "test",
    scale: "0_100",
    generatedAt: "2026-05-28T00:00:00.000Z",
    validity: DEFAULT_VALIDITY_SUMMARY,
    dimensions: {
      P: { score: scores.P, confidence: 1, evidenceCount: 3, sources: ["test"] },
      S: { score: scores.S, confidence: 1, evidenceCount: 3, sources: ["test"] },
      G: { score: scores.G, confidence: 1, evidenceCount: 3, sources: ["test"] },
      C: { score: scores.C, confidence: 1, evidenceCount: 3, sources: ["test"] },
      R: { score: scores.R, confidence: 1, evidenceCount: 3, sources: ["test"] },
      F: { score: scores.F, confidence: 1, evidenceCount: 3, sources: ["test"] },
    },
  };
}

describe("matchEngine wrapper", () => {
  it("recommends RACI role by vector tendency", () => {
    expect(
      recommendRaciRoleByVector(
        ctv("leader", { P: 60, S: 60, G: 90, C: 75, R: 65, F: 85 })
      )
    ).toBe("A");
  });

  it("summarizes weak team dimensions", () => {
    const summary = summarizeTeamComposition(
      [
        { memberId: "m1", ctv: ctv("m1", { P: 50, S: 40, G: 45, C: 70, R: 60, F: 58 }) },
        { memberId: "m2", ctv: ctv("m2", { P: 55, S: 42, G: 48, C: 65, R: 62, F: 60 }) },
      ] as VolunteerProfile[],
      65
    );
    expect(summary.weakDimensions).toContain("S");
    expect(summary.teamAverage.C).toBeGreaterThan(60);
  });

  it("returns ranked role matches from wrapper", () => {
    const role: MinistryRoleProfile = {
      roleId: "group_lead",
      roleName: "小組長",
      riskLevel: "medium",
      requiredCtv: { P: 70, S: 65, G: 55, C: 55, R: 70, F: 68 },
    };
    const volunteer: VolunteerProfile = {
      memberId: "m3",
      ctv: ctv("m3", { P: 75, S: 70, G: 60, C: 58, R: 80, F: 72 }),
      completedTrainingIds: [],
    };
    const matches = recommendRoleMatches(volunteer, [role]);
    expect(matches[0]?.roleId).toBe("group_lead");
    expect(matches[0]?.finalScore).toBeGreaterThan(70);
  });
});
