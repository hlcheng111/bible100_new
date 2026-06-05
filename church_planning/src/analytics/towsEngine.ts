import {
  CHURCH_HEALTH_QUESTIONS,
  type ChurchHealthQuestion,
} from "../data/churchHealthQuestions";
import type { StateMachineResult } from "./stateMachine";
import { weightedAverageForTagSubset, weightedDimQuadAverage } from "./weighted";

export type TowsArchetype = "SO" | "WO" | "ST" | "WT";

export type TowsRecommendation = {
  archetype: TowsArchetype;
  title: string;
  body: string;
  triggered: boolean;
  suppressed?: boolean;
};

const GENERAL_TRIGGER = 2.5;

function gte(a: number | null, t: number): boolean {
  return a !== null && a >= t;
}

export function evaluateTowsRecommendations(
  answers: Record<string, number>,
  machine: StateMachineResult,
  bank: ChurchHealthQuestion[] = CHURCH_HEALTH_QUESTIONS
): TowsRecommendation[] {
  const worshipS = weightedDimQuadAverage("Worship", "S", bank, answers);
  const communityO = weightedDimQuadAverage("Community", "O", bank, answers);
  const adminW = weightedDimQuadAverage("AdminTech", "W", bank, answers);
  const digitalO = weightedAverageForTagSubset(
    bank,
    answers,
    (q) => q.quad === "O" && q.tag === "digital_leverage"
  );
  const fellowshipS = weightedDimQuadAverage("Fellowship", "S", bank, answers);
  const talentDrainT = weightedAverageForTagSubset(
    bank,
    answers,
    (q) => q.dim === "Leadership" && q.quad === "T" && q.tag === "talent_drain"
  );

  const soTriggered =
    gte(worshipS, GENERAL_TRIGGER) && gte(communityO, GENERAL_TRIGGER);
  const woTriggered =
    gte(adminW, GENERAL_TRIGGER) && gte(digitalO, GENERAL_TRIGGER);
  const stTriggered =
    gte(fellowshipS, GENERAL_TRIGGER) &&
    gte(talentDrainT, GENERAL_TRIGGER);

  const wtCoreTriggered = machine.forceConsolidate;

  const recs: TowsRecommendation[] = [];

  recs.push({
    archetype: "WT",
    title: "防禦／整固（避重就輕）",
    body: wtCoreTriggered
      ? "【強制整固】這是必須「安息」的信號。暫停高耗能擴張，聚焦內部醫治、權柄修復、財務與資產清點；預防性停損勝於勉強治療。優先導入自動化與權責分界，減少同工空轉。"
      : "持續監測領袖承載、財務韌性與跨維度疲憊指標；出現紅燈即升高為整固優先，避免在耗弱期強推大型外展。",
    triggered: wtCoreTriggered,
  });

  recs.push({
    archetype: "SO",
    title: "強攻型（S-O）",
    body: "利用高品質崇拜與屬靈氛圍，策劃社區開放日或鄰里節慶接觸，把「敬拜體驗」轉為新朋友願意停留與對話的入口。",
    triggered: soTriggered,
    suppressed: machine.forceConsolidate && soTriggered,
  });

  recs.push({
    archetype: "WO",
    title: "扭轉型（W-O）",
    body: "行政黑洞不宜再用更多會議填補；以小試點推動數位賦能（雲端協作、自動化報名、單一真相來源），用工具跳過流程摩擦。",
    triggered: woTriggered,
  });

  recs.push({
    archetype: "ST",
    title: "多元型（S-T）",
    body: "當地人才外流或聚會點受威脅時，強化「地下根莖式」小組網絡與跨區連結，降低對單一場所與單一领袖的依賴。",
    triggered: stTriggered,
  });

  return recs;
}

export function visibleTowsForUi(recs: TowsRecommendation[]): TowsRecommendation[] {
  const ordered: TowsRecommendation[] = [];
  const wt = recs.find((r) => r.archetype === "WT");
  if (wt) ordered.push(wt);
  for (const r of recs) {
    if (r.archetype === "WT") continue;
    if (r.archetype === "SO" && r.suppressed) continue;
    if (r.triggered) ordered.push(r);
  }
  return ordered;
}
