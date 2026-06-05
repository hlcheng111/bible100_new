import { runStateMachineAnalysis } from "../analytics/stateMachine";
import { evaluateTowsRecommendations } from "../analytics/towsEngine";
import {
  derivePastoralDiagnosisLabel,
  deriveStopMustPlan,
  primaryBurdenDimension,
} from "../analytics/strategicReport";
import { buildSmartDraftLines } from "../report/smartDraft";
import { createEmptySmartGoal, newId } from "./emptyCycle";
import type { SmartGoalRecord } from "./types";

/**
 * 由現有十維健康／SWOT 作答，產生一筆 SMART 紀錄（與報告第三頁草案同源邏輯）
 */
export function buildSmartGoalFromAnswers(
  answers: Record<string, number>
): SmartGoalRecord {
  const machine = runStateMachineAnalysis(answers);
  const diagnosis = derivePastoralDiagnosisLabel(answers);
  const tows = evaluateTowsRecommendations(answers, machine);
  const stopMust = deriveStopMustPlan(answers, machine, tows);
  const topBurden = primaryBurdenDimension(answers);
  const lines = buildSmartDraftLines(
    machine.state,
    diagnosis,
    stopMust,
    topBurden
  );

  const g = createEmptySmartGoal();
  g.id = newId();
  g.title = `由診斷匯入 · ${diagnosis.title}`;
  g.specific = lines[0] ?? "";
  g.measurable = lines[1] ?? "";
  g.achievable = lines[2] ?? "";
  g.relevant = [lines[3], lines[5]].filter(Boolean).join("\n\n");
  g.timeBound = lines[4] ?? "";
  if (topBurden) g.relatedDimensions = [topBurden];
  g.swotLinkNote = [lines[6] ?? "", stopMust.must, ...stopMust.stop.slice(0, 2)]
    .filter(Boolean)
    .join("；");
  return g;
}
