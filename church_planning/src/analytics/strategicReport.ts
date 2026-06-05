import { DIMENSIONS, DIMENSION_LABELS_ZH, type Dimension } from "../dimensions";
import {
  CHURCH_HEALTH_QUESTIONS,
  type ChurchHealthQuestion,
} from "../data/churchHealthQuestions";
import { computeBurnoutSignal } from "./burnoutSignal";
import { weightedDimQuadAverage } from "./weighted";
import type { StateMachineResult } from "./stateMachine";
import type { TowsRecommendation } from "./towsEngine";

export type PastoralDiagnosisLabel = {
  title: string;
  subtitle: string;
};

/** 牧者向度的「體質標籤」：以加權均分粗略分群（閾值 2.5） */
export function derivePastoralDiagnosisLabel(
  answers: Record<string, number>,
  bank: ChurchHealthQuestion[] = CHURCH_HEALTH_QUESTIONS
): PastoralDiagnosisLabel {
  const fellowshipS = weightedDimQuadAverage("Fellowship", "S", bank, answers);
  const adminS = weightedDimQuadAverage("AdminTech", "S", bank, answers);
  const worshipS = weightedDimQuadAverage("Worship", "S", bank, answers);
  const leadershipW = weightedDimQuadAverage("Leadership", "W", bank, answers);
  const burnout = computeBurnoutSignal(answers, bank);

  const warm = fellowshipS !== null && fellowshipS >= 2.5;
  const efficient = adminS !== null && adminS >= 2.5;
  const cold = fellowshipS !== null && fellowshipS < 2;
  const overloaded =
    (leadershipW !== null && leadershipW >= 2.5) ||
    (burnout !== null && burnout >= 2.5);

  if (warm && overloaded) {
    return {
      title: "溫暖但過載的家庭",
      subtitle:
        "關係動能仍在，但領袖承載與疲憊訊號偏高——適合先止血與分工，再談增長。",
    };
  }
  if (efficient && cold) {
    return {
      title: "高效但冰冷的機構",
      subtitle:
        "流程與工具可能到位，但團契溫度與真實連結不足——宜補「關係與敘事」，避免只剩運營。",
    };
  }
  if (worshipS !== null && worshipS >= 2.5 && cold) {
    return {
      title: "敬拜有感、肢體疏離",
      subtitle:
        "聚會體驗可能不弱，但小組／同行網絡薄弱——福音停留在大堂，未進入日常生活。",
    };
  }
  if (overloaded) {
    return {
      title: "戰略收縮與內部醫治期",
      subtitle:
        "數據顯示承載與耗弱訊號突出——這不是失敗，是調整節奏以對齊安息與牧養優先。",
    };
  }
  return {
    title: "平衡探索中的共同體",
    subtitle:
      "指標未落在極端原型——適合以小實驗驗證下一步，並用 PeaceIndex 追蹤趨勢變化。",
  };
}

export type StopMustPlan = {
  stop: string[];
  must: string;
};

/** 停做 3／必做 1：以加權 W 與 T 找出高耗能來源，必做取低成本 S×O 交集建議 */
export function deriveStopMustPlan(
  answers: Record<string, number>,
  machine: StateMachineResult,
  tows: TowsRecommendation[],
  bank: ChurchHealthQuestion[] = CHURCH_HEALTH_QUESTIONS
): StopMustPlan {
  type Row = { dim: Dimension; score: number };
  const burden: Row[] = [];

  for (const dim of DIMENSIONS) {
    const w = weightedDimQuadAverage(dim, "W", bank, answers);
    const t = weightedDimQuadAverage(dim, "T", bank, answers);
    const parts: number[] = [];
    if (w !== null) parts.push(w);
    if (t !== null) parts.push(t * 1.05);
    if (parts.length === 0) continue;
    const score = parts.reduce((a, b) => a + b, 0) / parts.length;
    burden.push({ dim, score });
  }

  burden.sort((a, b) => b.score - a.score);
  const stopDims = burden.slice(0, 3).filter((r) => r.score >= 2);

  const stop = stopDims.map(
    (r) =>
      `暫緩或縮減「${DIMENSION_LABELS_ZH[r.dim]}」相關高耗能倡議（W/T 壓力加權約 ${r.score.toFixed(
        2
      )}）`
  );

  const fallbacks = [
    "暫停新增大型外展或新事工線，直到領袖節奏與財務／行政韌性重新校準",
    "凍結非核心預算外的裝修／設備升級，先完成風險與現金流評估",
    "減少檔期密集的大型活動，改以可負載的小組／職場節點承接關係",
  ];
  for (let i = 0; stop.length < 3 && i < fallbacks.length; i++) {
    stop.push(fallbacks[i]!);
  }

  const so = tows.find((t) => t.archetype === "SO");
  const wo = tows.find((t) => t.archetype === "WO");

  let must =
    "今年必做 1 件事：建立「月一次」的核心領袖健康檢視（情緒、界線、接班與禱告），作為所有戰略的前置條件。";

  if (!machine.forceConsolidate && so?.triggered && !so.suppressed) {
    must =
      "今年必做 1 件事：以現有崇拜與接待體驗為支點，策劃一場小而美的社區開放／鄰里節慶，並完成新朋友跟進閉環。";
  } else if (!machine.forceConsolidate && wo?.triggered) {
    must =
      "今年必做 1 件事：選定一條行政流程（報名／場地／請款）做數位化試點，形成單一真相來源與可追溯紀錄。";
  } else if (machine.forceConsolidate) {
    must =
      "今年必做 1 件事：完成「事工停做清單＋財務／場域風險清點」，由核心團隊簽核並設定季度複查。";
  }

  return { stop: stop.slice(0, 3), must };
}

/** 壓力最高維度（W／T 合成），供 SMART 草案對焦 */
export function primaryBurdenDimension(
  answers: Record<string, number>,
  bank: ChurchHealthQuestion[] = CHURCH_HEALTH_QUESTIONS
): Dimension | null {
  type Row = { dim: Dimension; score: number };
  const burden: Row[] = [];

  for (const dim of DIMENSIONS) {
    const w = weightedDimQuadAverage(dim, "W", bank, answers);
    const t = weightedDimQuadAverage(dim, "T", bank, answers);
    const parts: number[] = [];
    if (w !== null) parts.push(w);
    if (t !== null) parts.push(t * 1.05);
    if (parts.length === 0) continue;
    const score = parts.reduce((a, b) => a + b, 0) / parts.length;
    burden.push({ dim, score });
  }

  burden.sort((a, b) => b.score - a.score);
  return burden[0]?.dim ?? null;
}

/** 優勢訊號最高維度（S 加權均分），供 AI 提示肯定既有做得好的地方 */
export function primaryStrengthDimension(
  answers: Record<string, number>,
  bank: ChurchHealthQuestion[] = CHURCH_HEALTH_QUESTIONS
): Dimension | null {
  type Row = { dim: Dimension; score: number };
  const rows: Row[] = [];

  for (const dim of DIMENSIONS) {
    const s = weightedDimQuadAverage(dim, "S", bank, answers);
    if (s === null) continue;
    rows.push({ dim, score: s });
  }

  rows.sort((a, b) => b.score - a.score);
  return rows[0]?.dim ?? null;
}

export function pastoralOpeningLine(
  peaceValue: number,
  machine: StateMachineResult
): string {
  if (machine.forceConsolidate) {
    return "牧者安慰：此刻更像曠野的停腳而非失敗——先把羊群的韁繩勒穩，神仍掌權。";
  }
  if (peaceValue >= 0.35) {
    return "牧者安慰：數據看見恩典的痕跡——優勢與機會仍在，請帶著感謝前行，並為下一步禱告分辨。";
  }
  if (peaceValue <= -0.25) {
    return "牧者安慰：環境動盪且內部承載吃緊並不罕見；這是呼召教會進入更深的彼此扶持與禱告守望季。";
  }
  return "牧者安慰：你們正在轉型的路上——不必急著證明什麼，先求主賜下合一與智慧，按步更新。";
}
