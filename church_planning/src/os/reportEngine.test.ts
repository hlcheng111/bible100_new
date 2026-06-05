import { describe, expect, it } from "vitest";
import { DEFAULT_VALIDITY_SUMMARY, type CtvVector } from "../ctv/types";
import type { MatchResult } from "../matching/matchingEngine";
import { buildPastoralReport, toPastoralPlainText } from "./reportEngine";

function ctv(scores: Record<"P" | "S" | "G" | "C" | "R" | "F", number>): CtvVector {
  return {
    subjectId: "member-1",
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

describe("report engine", () => {
  it("builds pastoral report and plain text output", () => {
    const vector = ctv({ P: 72, S: 40, G: 78, C: 82, R: 55, F: 42 });
    const match: MatchResult = {
      memberId: "member-1",
      roleId: "group_lead",
      finalScore: 80,
      recommendationLevel: "pastoral_review",
      breakdown: {
        ctvSimilarity: 88,
        giftFit: 70,
        availabilityFit: 90,
        experienceFit: 50,
        cultureFit: 72,
        burdenSafety: 40,
      },
      hardBlocks: [],
      reviewFlags: ["burden_safety_low"],
      explanation: [],
    };

    const report = buildPastoralReport(vector, [match]);
    const text = toPastoralPlainText(report);
    expect(report.riskFlags.length).toBeGreaterThan(0);
    expect(text).toContain("國度事奉與生命長進評估摘要");
    expect(text).toContain("角色建議");
  });
});
