import {
  CTV_DIMENSIONS,
  DEFAULT_VALIDITY_SUMMARY,
  emptyCtvDimensionScore,
  type CtvDimension,
  type CtvVector,
} from "../ctv/types";
import { clamp, normalizeTo0To100, round1, type SourceScale } from "../ctv/normalize";
import { assessResponseValidity, type ValidityPair } from "../validity/validityEngine";
import {
  reliabilityTierWeight,
  type AssessmentSubmission,
  type InstrumentProfile,
  type QuestionItem,
} from "./itemBank";

type InstrumentScoreSummary = {
  instrumentId: string;
  normalizedAverage: number;
  evidenceCount: number;
  weightedContribution: number;
};

export type UnifiedScoreResult = {
  ctv: CtvVector;
  instrumentSummaries: InstrumentScoreSummary[];
};

type ScoreOptions = {
  source?: string;
  version?: string;
  validityPairs?: ValidityPair[];
};

function reverseNormalize(value: number, scale: SourceScale): number {
  switch (scale) {
    case "likert_1_5":
      return normalizeTo0To100(6 - clamp(value, 1, 5), scale);
    case "likert_1_6":
      return normalizeTo0To100(7 - clamp(value, 1, 6), scale);
    case "zero_to_four":
      return normalizeTo0To100(4 - clamp(value, 0, 4), scale);
    case "zero_to_one":
      return normalizeTo0To100(1 - clamp(value, 0, 1), scale);
    case "ncd_dim_65":
      return normalizeTo0To100(65 - clamp(value, 0, 65), scale);
    case "percent_0_100":
      return normalizeTo0To100(100 - clamp(value, 0, 100), scale);
  }
}

export function buildUnifiedCtvFromSubmission(
  submission: AssessmentSubmission,
  items: QuestionItem[],
  instruments: InstrumentProfile[],
  options: ScoreOptions = {}
): UnifiedScoreResult {
  const itemById = new Map(items.map((item) => [item.itemId, item]));
  const instrumentById = new Map(
    instruments.map((instrument) => [instrument.instrumentId, instrument])
  );

  const sums: Record<CtvDimension, number> = Object.fromEntries(
    CTV_DIMENSIONS.map((dim) => [dim, 0])
  ) as Record<CtvDimension, number>;
  const weights: Record<CtvDimension, number> = Object.fromEntries(
    CTV_DIMENSIONS.map((dim) => [dim, 0])
  ) as Record<CtvDimension, number>;
  const evidence: Record<CtvDimension, string[]> = Object.fromEntries(
    CTV_DIMENSIONS.map((dim) => [dim, [] as string[]])
  ) as Record<CtvDimension, string[]>;

  const validityAnswers: Record<string, number> = {};
  const durations: number[] = [];
  const instrumentBucket = new Map<string, number[]>();

  for (const response of submission.responses) {
    const item = itemById.get(response.itemId);
    if (!item) continue;
    const instrument = instrumentById.get(item.instrumentId);
    const instrumentWeight =
      (instrument?.globalWeight ?? 1) *
      reliabilityTierWeight(instrument?.reliabilityTier ?? "B");
    const itemWeight = (item.itemWeight ?? 1) * instrumentWeight;
    const normalized = item.reverseScored
      ? reverseNormalize(response.value, item.scale)
      : normalizeTo0To100(response.value, item.scale);
    for (const dim of CTV_DIMENSIONS) {
      const projectionWeight = item.projection[dim];
      if (projectionWeight <= 0) continue;
      const mergedWeight = projectionWeight * itemWeight;
      sums[dim] += normalized * mergedWeight;
      weights[dim] += mergedWeight;
      evidence[dim].push(item.itemId);
    }
    validityAnswers[item.itemId] = response.value;
    if (response.durationSeconds !== undefined) durations.push(response.durationSeconds);
    const instrumentScores = instrumentBucket.get(item.instrumentId) ?? [];
    instrumentScores.push(normalized);
    instrumentBucket.set(item.instrumentId, instrumentScores);
  }

  const validity = Object.keys(validityAnswers).length
    ? assessResponseValidity({
        answers: validityAnswers,
        minEvidenceCount: 6,
        consistencyPairs: options.validityPairs,
        actualDurationSeconds: durations.reduce((sum, value) => sum + value, 0),
        expectedDurationSeconds: Object.keys(validityAnswers).length * 7,
      })
    : DEFAULT_VALIDITY_SUMMARY;

  const dimensions = Object.fromEntries(
    CTV_DIMENSIONS.map((dim) => [dim, emptyCtvDimensionScore()])
  ) as CtvVector["dimensions"];

  for (const dim of CTV_DIMENSIONS) {
    const dimWeight = weights[dim];
    if (!dimWeight) continue;
    const baseScore = sums[dim] / dimWeight;
    const evidenceCount = evidence[dim].length;
    dimensions[dim] = {
      score: round1(baseScore),
      confidence: round1(
        clamp((evidenceCount / 12) * clamp(validity.consistencyScore, 0, 1), 0, 1)
      ),
      evidenceCount,
      sources: Array.from(new Set(evidence[dim])),
    };
  }

  const instrumentSummaries: InstrumentScoreSummary[] = Array.from(
    instrumentBucket.entries()
  ).map(([instrumentId, values]) => {
    const avg = values.reduce((sum, value) => sum + value, 0) / values.length;
    const instrument = instrumentById.get(instrumentId);
    const weightedContribution =
      avg *
      (instrument?.globalWeight ?? 1) *
      reliabilityTierWeight(instrument?.reliabilityTier ?? "B");
    return {
      instrumentId,
      normalizedAverage: round1(avg),
      evidenceCount: values.length,
      weightedContribution: round1(weightedContribution),
    };
  });

  return {
    ctv: {
      subjectId: submission.subjectId,
      subjectType: submission.subjectType,
      source: options.source ?? "cta_os_unified",
      version: options.version ?? "cta-os-phase1-v1",
      scale: "0_100",
      dimensions,
      validity,
      generatedAt: submission.submittedAt ?? new Date().toISOString(),
    },
    instrumentSummaries,
  };
}
