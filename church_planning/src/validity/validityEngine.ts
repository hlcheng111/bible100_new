import type { ValiditySummary } from "../ctv/types";
import { clamp, round1 } from "../ctv/normalize";

export type AnswerValue = number;

export type ValidityPair = {
  leftId: string;
  rightId: string;
  /** Use "same" for duplicate-meaning checks, "opposite" for reverse checks. */
  expected: "same" | "opposite";
};

export type ValidityAssessmentInput = {
  answers: Record<string, AnswerValue>;
  scaleMin?: number;
  scaleMax?: number;
  consistencyPairs?: ValidityPair[];
  minEvidenceCount?: number;
  actualDurationSeconds?: number;
  expectedDurationSeconds?: number;
};

function pairConsistency(
  left: number,
  right: number,
  expected: ValidityPair["expected"],
  scaleMin: number,
  scaleMax: number
): number {
  const range = Math.max(1, scaleMax - scaleMin);
  const normalizedRight =
    expected === "opposite" ? scaleMax + scaleMin - right : right;
  return clamp(1 - Math.abs(left - normalizedRight) / range, 0, 1);
}

export function assessResponseValidity(
  input: ValidityAssessmentInput
): ValiditySummary {
  const scaleMin = input.scaleMin ?? 1;
  const scaleMax = input.scaleMax ?? 5;
  const values = Object.values(input.answers).filter(Number.isFinite);
  const contradictionFlags: string[] = [];
  const lowEvidenceFlags: string[] = [];
  const minEvidenceCount = input.minEvidenceCount ?? 4;

  if (values.length < minEvidenceCount) {
    lowEvidenceFlags.push(`evidence_count_below_${minEvidenceCount}`);
  }

  const pairScores: number[] = [];
  for (const pair of input.consistencyPairs ?? []) {
    const left = input.answers[pair.leftId];
    const right = input.answers[pair.rightId];
    if (left === undefined || right === undefined) continue;
    const score = pairConsistency(left, right, pair.expected, scaleMin, scaleMax);
    pairScores.push(score);
    if (score < 0.45) {
      contradictionFlags.push(
        `pair_mismatch:${pair.leftId}:${pair.rightId}:${pair.expected}`
      );
    }
  }

  const consistencyScore =
    pairScores.length > 0
      ? round1(pairScores.reduce((sum, score) => sum + score, 0) / pairScores.length)
      : 1;

  const maxCount = values.filter((value) => value === scaleMax).length;
  const highCount = values.filter((value) => value >= scaleMax - 1).length;
  const socialDesirabilityRisk =
    values.length === 0
      ? 0
      : round1(clamp((maxCount * 1.2 + highCount * 0.5) / values.length, 0, 1));

  if (
    input.actualDurationSeconds !== undefined &&
    input.expectedDurationSeconds !== undefined &&
    input.expectedDurationSeconds > 0 &&
    input.actualDurationSeconds < input.expectedDurationSeconds * 0.35
  ) {
    contradictionFlags.push("response_time_unusually_short");
  }

  const requiresReview =
    contradictionFlags.length > 0 ||
    lowEvidenceFlags.length > 0 ||
    consistencyScore < 0.65 ||
    socialDesirabilityRisk > 0.8;

  const responseQuality =
    !requiresReview && consistencyScore >= 0.85 && socialDesirabilityRisk <= 0.55
      ? "high"
      : consistencyScore >= 0.65 && socialDesirabilityRisk <= 0.8
        ? "medium"
        : "low";

  return {
    consistencyScore,
    socialDesirabilityRisk,
    contradictionFlags,
    lowEvidenceFlags,
    responseQuality,
    requiresReview,
  };
}
