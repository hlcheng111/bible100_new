import type { Dimension } from "../dimensions";

/** 單一 SMART 目標（與診斷／SWOT 連結，欄位完整、不因堂會大小縮減） */
export type SmartGoalRecord = {
  id: string;
  title: string;
  specific: string;
  measurable: string;
  achievable: string;
  relevant: string;
  timeBound: string;
  relatedDimensions: Dimension[];
  /** 可填：呼應 SWOT 象限或 TOWS 策略一句話 */
  swotLinkNote: string;
};

/**
 * 單次 PDCA 循環：實務實況完整欄位（大中小型教會同一套，便於匯總與五年計劃對齊）
 */
export type PdcaCycleRecord = {
  id: string;
  createdAt: string;
  updatedAt: string;
  /** 事工情境：主日、節期、專案名等 */
  ministryContext: string;
  relatedDimensions: Dimension[];
  linkedSmartGoalId: string | null;

  planProblem: string;
  planGoal: string;
  planResources: string;
  planMetricsHow: string;
  planTimeline: string;

  doProgressNotes: string;
  /** 0–100，未填以 null */
  doBudgetUsedPercent: number | null;
  doTrafficLight: "green" | "yellow" | "red";
  doMilestonePercent: number | null;

  checkGoalMetLikert: number | null;
  checkResourceLikert: number | null;
  checkTeamMoraleLikert: number | null;
  checkEvidence: string;
  checkGap: string;
  checkChaosMoment: string;

  actMustChange: string;
  actOwner: string;
  actDueDate: string;
  actStandardize: boolean;
  actNextCycleNote: string;
};

export type PdcaPersistedState = {
  version: 1;
  /** 本季／本階段聚焦（儀表板「三件要事」— 仍為完整文字，非精簡問卷） */
  seasonFocusLines: [string, string, string];
  smartGoals: SmartGoalRecord[];
  cycles: PdcaCycleRecord[];
};

export type PdcaWeakStage = "plan" | "do" | "check" | "act";
