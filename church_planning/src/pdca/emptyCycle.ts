import type { PdcaCycleRecord, SmartGoalRecord } from "./types";

function nowIso(): string {
  return new Date().toISOString();
}

export function newId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createEmptyPdcaCycle(): PdcaCycleRecord {
  const t = nowIso();
  return {
    id: newId(),
    createdAt: t,
    updatedAt: t,
    ministryContext: "",
    relatedDimensions: [],
    linkedSmartGoalId: null,
    planProblem: "",
    planGoal: "",
    planResources: "",
    planMetricsHow: "",
    planTimeline: "",
    doProgressNotes: "",
    doBudgetUsedPercent: null,
    doTrafficLight: "green",
    doMilestonePercent: null,
    checkGoalMetLikert: null,
    checkResourceLikert: null,
    checkTeamMoraleLikert: null,
    checkEvidence: "",
    checkGap: "",
    checkChaosMoment: "",
    actMustChange: "",
    actOwner: "",
    actDueDate: "",
    actStandardize: false,
    actNextCycleNote: "",
  };
}

export function createEmptySmartGoal(): SmartGoalRecord {
  return {
    id: newId(),
    title: "",
    specific: "",
    measurable: "",
    achievable: "",
    relevant: "",
    timeBound: "",
    relatedDimensions: [],
    swotLinkNote: "",
  };
}
