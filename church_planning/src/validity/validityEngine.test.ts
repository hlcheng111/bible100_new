import { describe, expect, it } from "vitest";
import { assessResponseValidity } from "./validityEngine";

describe("assessResponseValidity", () => {
  it("flags reverse-pair contradictions and thin evidence", () => {
    const validity = assessResponseValidity({
      answers: { a: 5, b: 5 },
      consistencyPairs: [{ leftId: "a", rightId: "b", expected: "opposite" }],
      minEvidenceCount: 4,
    });

    expect(validity.requiresReview).toBe(true);
    expect(validity.contradictionFlags[0]).toContain("pair_mismatch");
    expect(validity.lowEvidenceFlags.length).toBe(1);
  });

  it("flags unusually perfect responses", () => {
    const validity = assessResponseValidity({
      answers: { a: 5, b: 5, c: 5, d: 5, e: 5 },
      minEvidenceCount: 4,
    });

    expect(validity.socialDesirabilityRisk).toBeGreaterThan(0.8);
    expect(validity.requiresReview).toBe(true);
  });
});
