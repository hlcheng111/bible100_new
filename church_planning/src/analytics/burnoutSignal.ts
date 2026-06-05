import {
  CHURCH_HEALTH_QUESTIONS,
  type ChurchHealthQuestion,
} from "../data/churchHealthQuestions";
import { weightedAverageForQuestions } from "./weighted";

/** 分散於各維度的「疲憊／耗竭／空轉」相關標籤，聚合成 Burnout_Signal */
export const BURNOUT_RELATED_TAGS = new Set([
  "group_leader_fatigue",
  "pastoral_depletion",
  "process_bottleneck",
  "cash_crunch",
  "facility_albatross",
  "hidden_conflict",
  "strongman_governance",
]);

export function computeBurnoutSignal(
  answers: Record<string, number>,
  bank: ChurchHealthQuestion[] = CHURCH_HEALTH_QUESTIONS
): number | null {
  const qs = bank.filter((q) => BURNOUT_RELATED_TAGS.has(q.tag));
  return weightedAverageForQuestions(qs, answers);
}
