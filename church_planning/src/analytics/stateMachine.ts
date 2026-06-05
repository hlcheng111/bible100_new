import {
  CHURCH_HEALTH_QUESTIONS,
  type ChurchHealthQuestion,
} from "../data/churchHealthQuestions";
import { computeBurnoutSignal } from "./burnoutSignal";
import { computePeaceIndex } from "./peaceIndex";
import { weightedDimQuadAverage } from "./weighted";

export type ChurchStrategicState = "expand" | "consolidate" | "transform";

export type StateMachineResult = {
  state: ChurchStrategicState;
  /** 強制整固：WT 覆寫優先（領袖劣勢、財務威脅、Burnout 聚合） */
  forceConsolidate: boolean;
  reasons: string[];
  leadershipW: number | null;
  financeT: number | null;
  burnoutSignal: number | null;
  peaceValue: number;
};

const THRESHOLD_LEADERSHIP_W_STRICT = 2.8;
const THRESHOLD_FINANCE_T_STRICT = 3;
const THRESHOLD_BURNOUT_OR = 2.75;
const PEACE_EXPAND_MIN = 0.35;
const PEACE_CONSOLIDATE_MAX = -0.25;

export function runStateMachineAnalysis(
  answers: Record<string, number>,
  bank: ChurchHealthQuestion[] = CHURCH_HEALTH_QUESTIONS
): StateMachineResult {
  const reasons: string[] = [];
  const leadershipW = weightedDimQuadAverage(
    "Leadership",
    "W",
    bank,
    answers
  );
  const financeT = weightedDimQuadAverage("Finance", "T", bank, answers);
  const burnoutSignal = computeBurnoutSignal(answers, bank);
  const { value: peaceValue } = computePeaceIndex(answers, bank);

  const forceLeadership =
    leadershipW !== null && leadershipW > THRESHOLD_LEADERSHIP_W_STRICT;
  const forceFinance = financeT !== null && financeT > THRESHOLD_FINANCE_T_STRICT;
  const forceBurnout =
    burnoutSignal !== null && burnoutSignal >= THRESHOLD_BURNOUT_OR;

  if (forceLeadership) {
    reasons.push(
      `領袖維度劣勢加權平均 > ${THRESHOLD_LEADERSHIP_W_STRICT}（內部耗弱／牧養吃緊訊號）`
    );
  }
  if (forceFinance) {
    reasons.push(
      `財務威脅加權平均 > ${THRESHOLD_FINANCE_T_STRICT}（環境與資金紅燈）`
    );
  }
  if (forceBurnout) {
    reasons.push(
      `Burnout_Signal ≥ ${THRESHOLD_BURNOUT_OR}（跨維度疲憊標籤聚合）`
    );
  }

  const forceConsolidate = forceLeadership || forceFinance || forceBurnout;

  let state: ChurchStrategicState;
  if (forceConsolidate) {
    state = "consolidate";
  } else if (peaceValue >= PEACE_EXPAND_MIN) {
    state = "expand";
    reasons.push(
      `PeaceIndex ≥ ${PEACE_EXPAND_MIN}，優勢與機會相對顯著，可謹慎評估擴張型倡議`
    );
  } else if (peaceValue <= PEACE_CONSOLIDATE_MAX) {
    state = "consolidate";
    reasons.push(
      `PeaceIndex ≤ ${PEACE_CONSOLIDATE_MAX}，內弱外壓較明顯，宜進入禁食禱告與戰略收縮評估`
    );
  } else {
    state = "transform";
    reasons.push(
      "指標呈現交錯張力，適合「轉型／重排優先」與小步實驗，而非單向強攻"
    );
  }

  return {
    state,
    forceConsolidate,
    reasons,
    leadershipW,
    financeT,
    burnoutSignal,
    peaceValue,
  };
}
