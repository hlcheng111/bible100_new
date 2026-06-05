import {
  CHURCH_HEALTH_QUESTIONS,
  type ChurchHealthQuestion,
} from "../data/churchHealthQuestions";
import { weightedGlobalQuadAverageWithNeutral } from "./weighted";

/** 與牧養敘事對齊的縮放係數（理論區間約 [-8,8] → 約 [-2,2]） */
export const PEACE_SCALE_FACTOR = 4;

export type PeaceIndexResult = {
  value: number;
  s: number;
  o: number;
  w: number;
  t: number;
};

export function computePeaceIndex(
  answers: Record<string, number>,
  bank: ChurchHealthQuestion[] = CHURCH_HEALTH_QUESTIONS
): PeaceIndexResult {
  const s = weightedGlobalQuadAverageWithNeutral("S", bank, answers);
  const o = weightedGlobalQuadAverageWithNeutral("O", bank, answers);
  const w = weightedGlobalQuadAverageWithNeutral("W", bank, answers);
  const t = weightedGlobalQuadAverageWithNeutral("T", bank, answers);
  const value = (s + o - w - t) / PEACE_SCALE_FACTOR;
  return { value, s, o, w, t };
}
