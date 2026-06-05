import type { Dimension } from "../dimensions";
import type { ChurchHealthQuestion, Quadrant } from "../data/churchHealthQuestions";

export function weightedAverageForQuestions(
  questions: ChurchHealthQuestion[],
  answers: Record<string, number>
): number | null {
  let sumW = 0;
  let sumWV = 0;
  for (const q of questions) {
    const v = answers[q.id];
    if (v === undefined) continue;
    const w = q.weight;
    sumW += w;
    sumWV += w * v;
  }
  if (sumW === 0) return null;
  return sumWV / sumW;
}

export function weightedDimQuadAverage(
  dim: Dimension,
  quad: Quadrant,
  bank: ChurchHealthQuestion[],
  answers: Record<string, number>
): number | null {
  const qs = bank.filter((q) => q.dim === dim && q.quad === quad);
  return weightedAverageForQuestions(qs, answers);
}

export function weightedGlobalQuadAverage(
  quad: Quadrant,
  bank: ChurchHealthQuestion[],
  answers: Record<string, number>
): number | null {
  const qs = bank.filter((q) => q.quad === quad);
  return weightedAverageForQuestions(qs, answers);
}

export function weightedAverageForTagSubset(
  bank: ChurchHealthQuestion[],
  answers: Record<string, number>,
  predicate: (q: ChurchHealthQuestion) => boolean
): number | null {
  return weightedAverageForQuestions(bank.filter(predicate), answers);
}

/** 無作答時回傳中性 2.0，避免 PeaceIndex 無法計算 */
export function weightedGlobalQuadAverageWithNeutral(
  quad: Quadrant,
  bank: ChurchHealthQuestion[],
  answers: Record<string, number>
): number {
  return weightedGlobalQuadAverage(quad, bank, answers) ?? 2;
}
