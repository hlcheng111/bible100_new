import type { ChurchStrategicState } from "../analytics/stateMachine";
import type { PastoralDiagnosisLabel } from "../analytics/strategicReport";
import { DIMENSION_LABELS_ZH, type Dimension } from "../dimensions";

type StopMust = { stop: string[]; must: string };

/** 引導式語氣的五年計畫／年度 SMART 草案（非命令式） */
export function buildSmartDraftLines(
  state: ChurchStrategicState,
  diagnosis: PastoralDiagnosisLabel,
  stopMust: StopMust,
  topBurdenDim: Dimension | null
): string[] {
  const dimZh = topBurdenDim ? DIMENSION_LABELS_ZH[topBurdenDim] : "優先關注領域";

  const sSpecific = `根據察驗，我們建議在「${dimZh}」選定一個可於 12 個月內完成驗收的小範圍成果（例如：完成一項流程試點或一次社區對話），讓會眾能具體看見改變。`;

  const mMeasurable = `我們建議為上述成果設定 2～3 個可追蹤指標（出席穩定度、跟進完成率、奉獻透明度或同工歇息天數等擇一），並在長執會每季對齊一次進度。`;

  const aAssignable = `根據察驗，我們建議由一位核心領袖擔任「倡議負責人」，並明確配置行政／科技支援，避免責任落在單一同工身上。`;

  const rRelevant =
    state === "consolidate"
      ? `此階段與「整固／安息」方向一致：我們建議先把內部醫治與風險清點做好，再評估外展；這不是退縮，而是對齊承載。`
      : state === "expand"
        ? `此階段與「謹慎擴張」方向一致：我們建議把資源集中在已顯示優勢與機會的交集，避免同時多線開戰。`
        : `此階段與「轉型重排」方向一致：我們建議用 90 天實驗驗證假設，再決定是否放大投入。`;

  const tTimeBound = `我們建議以「本年度＋下年度 Q1」為檢視節奏：至少兩次正式回顧（盛夏與年終），並把「必做 1 件事」寫進議程。`;

  const bridge = `與本次診斷標籤「${diagnosis.title}」相呼應：${diagnosis.subtitle}`;

  const mustEcho = `關於「必做」：${stopMust.must}`;

  return [
    sSpecific,
    mMeasurable,
    aAssignable,
    rRelevant,
    tTimeBound,
    bridge,
    mustEcho,
  ];
}
