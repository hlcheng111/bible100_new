import {
  DIMENSION_LABELS_ZH,
  DIMENSIONS,
  type Dimension,
} from "./dimensions";
import { CHURCH_HEALTH_QUESTIONS } from "./data/churchHealthQuestions";
import { weightedDimQuadAverage } from "./analytics/weighted";

export type DimRadarPoint = {
  dim: Dimension;
  S: number;
  W: number;
  O: number;
  T: number;
  hasQuadData: Record<"S" | "W" | "O" | "T", boolean>;
};

/** 0–4 加權均分轉為 0–100 雷達刻度 */
function toRadarScale(avg0to4: number): number {
  return Math.round((avg0to4 / 4) * 100);
}

const bank = CHURCH_HEALTH_QUESTIONS;

export function computeDimensionScores(
  answers: Record<string, number>
): DimRadarPoint[] {
  return DIMENSIONS.map((dim) => {
    const sAvg = weightedDimQuadAverage(dim, "S", bank, answers);
    const wAvg = weightedDimQuadAverage(dim, "W", bank, answers);
    const oAvg = weightedDimQuadAverage(dim, "O", bank, answers);
    const tAvg = weightedDimQuadAverage(dim, "T", bank, answers);

    const hasS = bank.some(
      (q) => q.dim === dim && q.quad === "S" && answers[q.id] !== undefined
    );
    const hasW = bank.some(
      (q) => q.dim === dim && q.quad === "W" && answers[q.id] !== undefined
    );
    const hasO = bank.some(
      (q) => q.dim === dim && q.quad === "O" && answers[q.id] !== undefined
    );
    const hasT = bank.some(
      (q) => q.dim === dim && q.quad === "T" && answers[q.id] !== undefined
    );

    return {
      dim,
      S: sAvg === null ? 0 : toRadarScale(sAvg),
      W: wAvg === null ? 0 : toRadarScale(wAvg),
      O: oAvg === null ? 0 : toRadarScale(oAvg),
      T: tAvg === null ? 0 : toRadarScale(tAvg),
      hasQuadData: { S: hasS, W: hasW, O: hasO, T: hasT },
    };
  });
}

/** 加權 W 均分 > 加權 S 均分，且兩側皆有作答 */
/** 單維度：已填題之 Likert 0–4 平均 → 0–50 參考分（與柱狀達標線語境一致） */
export function dimensionScore0to50(
  answers: Record<string, number>,
  dim: Dimension
): { score: number; hasData: boolean } {
  const qs = bank.filter((q) => q.dim === dim);
  const vals = qs
    .map((q) => answers[q.id])
    .filter((v): v is number => v !== undefined);
  if (vals.length === 0) return { score: 0, hasData: false };
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  return { score: (avg / 4) * 50, hasData: true };
}

/** 十維柱狀資料 + 平均線（僅計有作答之維度） */
export function dimensionBars0to50(answers: Record<string, number>): {
  dim: Dimension;
  name: string;
  score: number;
  hasData: boolean;
}[] {
  return DIMENSIONS.map((dim) => {
    const { score, hasData } = dimensionScore0to50(answers, dim);
    return {
      dim,
      name: DIMENSION_LABELS_ZH[dim],
      score: hasData ? Math.round(score * 10) / 10 : 0,
      hasData,
    };
  });
}

export function meanOfAnsweredDimensionScores0to50(
  rows: { score: number; hasData: boolean }[]
): number | null {
  const answered = rows.filter((r) => r.hasData);
  if (answered.length === 0) return null;
  return (
    Math.round(
      (answered.reduce((a, r) => a + r.score, 0) / answered.length) * 10
    ) / 10
  );
}

export function dimensionsWhereWeaknessDominates(
  answers: Record<string, number>
): Dimension[] {
  const out: Dimension[] = [];
  for (const dim of DIMENSIONS) {
    const sAvg = weightedDimQuadAverage(dim, "S", bank, answers);
    const wAvg = weightedDimQuadAverage(dim, "W", bank, answers);
    if (sAvg === null || wAvg === null) continue;
    if (wAvg > sAvg) out.push(dim);
  }
  return out;
}
