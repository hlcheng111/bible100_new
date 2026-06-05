import { describe, expect, it } from "vitest";
import {
  aggregateWeakStageCounts,
  analyzeWeakStages,
  dominantWeakStage,
} from "./pdcaAnalysis";
import { createEmptyPdcaCycle } from "./emptyCycle";

describe("analyzeWeakStages", () => {
  it("flags plan when goal, metrics, or timeline missing", () => {
    const c = createEmptyPdcaCycle();
    c.planGoal = "x";
    c.planMetricsHow = "y";
    c.planTimeline = "";
    expect(analyzeWeakStages(c)).toContain("plan");
  });

  it("flags check when likert or evidence or gap missing", () => {
    const c = createEmptyPdcaCycle();
    c.planGoal = "g";
    c.planMetricsHow = "m";
    c.planTimeline = "t";
    c.checkGoalMetLikert = 4;
    c.checkEvidence = "data";
    c.checkGap = "ok";
    c.actMustChange = "x";
    c.actOwner = "y";
    expect(analyzeWeakStages(c)).not.toContain("check");
  });

  it("flags check when evidence empty", () => {
    const c = createEmptyPdcaCycle();
    c.planGoal = "g";
    c.planMetricsHow = "m";
    c.planTimeline = "t";
    c.checkGoalMetLikert = 3;
    c.checkEvidence = "";
    c.checkGap = "gap";
    c.actMustChange = "a";
    c.actOwner = "b";
    expect(analyzeWeakStages(c)).toContain("check");
  });

  it("flags act when must change or owner missing", () => {
    const c = createEmptyPdcaCycle();
    c.planGoal = "g";
    c.planMetricsHow = "m";
    c.planTimeline = "t";
    c.checkGoalMetLikert = 3;
    c.checkEvidence = "e";
    c.checkGap = "g";
    c.actMustChange = "";
    c.actOwner = "p";
    expect(analyzeWeakStages(c)).toContain("act");
  });
});

describe("aggregateWeakStageCounts & dominantWeakStage", () => {
  it("prefers check when tied at top", () => {
    const a = createEmptyPdcaCycle();
    a.id = "a";
    a.planGoal = a.planMetricsHow = a.planTimeline = "x";
    a.checkGoalMetLikert = null;
    a.checkEvidence = a.checkGap = "y";
    a.actMustChange = a.actOwner = "z";

    const b = createEmptyPdcaCycle();
    b.id = "b";
    b.planGoal = b.planMetricsHow = b.planTimeline = "x";
    b.checkGoalMetLikert = null;
    b.checkEvidence = b.checkGap = "y";
    b.actMustChange = b.actOwner = "z";

    const counts = aggregateWeakStageCounts([a, b]);
    expect(counts.check).toBeGreaterThan(0);
    expect(dominantWeakStage(counts)).toBe("check");
  });
});
