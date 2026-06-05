import { describe, expect, it } from "vitest";
import { buildUnifiedCtvFromSubmission } from "./scoringEngine";
import type { InstrumentProfile, QuestionItem } from "./itemBank";

const instruments: InstrumentProfile[] = [
  {
    instrumentId: "spiritual_health",
    displayName: "信徒健康",
    version: "v1",
    reliabilityTier: "A",
    globalWeight: 1,
  },
  {
    instrumentId: "raci_reflection",
    displayName: "RACI",
    version: "v1",
    reliabilityTier: "B",
    globalWeight: 0.8,
  },
];

const items: QuestionItem[] = [
  {
    itemId: "q1",
    instrumentId: "spiritual_health",
    instrumentVersion: "v1",
    prompt: "我維持固定靈修。",
    scale: "likert_1_5",
    projection: { P: 0.2, S: 0.6, G: 0, C: 0, R: 0.1, F: 0.1 },
  },
  {
    itemId: "q2",
    instrumentId: "raci_reflection",
    instrumentVersion: "v1",
    prompt: "我能承擔明確責任。",
    scale: "likert_1_5",
    projection: { P: 0.1, S: 0, G: 0.5, C: 0.1, R: 0.3, F: 0 },
  },
];

describe("buildUnifiedCtvFromSubmission", () => {
  it("builds canonical CTV from mixed instrument responses", () => {
    const result = buildUnifiedCtvFromSubmission(
      {
        subjectId: "member-1",
        subjectType: "member",
        responses: [
          { itemId: "q1", value: 5, durationSeconds: 8 },
          { itemId: "q2", value: 4, durationSeconds: 7 },
        ],
        submittedAt: "2026-05-28T00:00:00.000Z",
      },
      items,
      instruments
    );

    expect(result.ctv.source).toBe("cta_os_unified");
    expect(result.ctv.dimensions.S.score).toBeGreaterThan(80);
    expect(result.ctv.dimensions.G.score).toBeGreaterThan(40);
    expect(result.instrumentSummaries.length).toBe(2);
  });
});
