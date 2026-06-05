import { describe, expect, it } from "vitest";
import { buildCtvVectorFromToolScores } from "./mapping";

describe("buildCtvVectorFromToolScores", () => {
  it("maps tool scores into the canonical six CTV dimensions", () => {
    const vector = buildCtvVectorFromToolScores({
      subjectId: "member-1",
      subjectType: "member",
      toolId: "raci_reflection",
      sourceScale: "likert_1_5",
      sourceScores: {
        people: 4,
        process: 3,
        structure: 4,
      },
      generatedAt: "2026-05-22T00:00:00.000Z",
    });

    expect(vector.dimensions.R.score).toBeGreaterThan(60);
    expect(vector.dimensions.G.confidence).toBeGreaterThan(0);
    expect(vector.dimensions.S.evidenceCount).toBe(0);
  });
});
