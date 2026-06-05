import type { PdcaCycleRecord, PdcaWeakStage } from "./types";

const TRIM = (s: string) => s.trim();

/** 偵測單一循環中哪一階最常「空洞」，供儀表板預警（規則式、可稽核） */
export function analyzeWeakStages(cycle: PdcaCycleRecord): PdcaWeakStage[] {
  const weak: PdcaWeakStage[] = [];

  const planThin =
    !TRIM(cycle.planGoal) ||
    !TRIM(cycle.planMetricsHow) ||
    !TRIM(cycle.planTimeline);
  if (planThin) weak.push("plan");

  const doThin =
    cycle.doTrafficLight === "red" &&
    !TRIM(cycle.doProgressNotes) &&
    (cycle.doMilestonePercent === null || cycle.doMilestonePercent < 30);
  if (doThin) weak.push("do");

  const checkThin =
    cycle.checkGoalMetLikert === null ||
    !TRIM(cycle.checkEvidence) ||
    !TRIM(cycle.checkGap);
  if (checkThin) weak.push("check");

  const actThin = !TRIM(cycle.actMustChange) || !TRIM(cycle.actOwner);
  if (actThin) weak.push("act");

  return weak;
}

/** 全庫聚合：哪一階被標記最多次（給五年計劃預警文案用） */
export function aggregateWeakStageCounts(
  cycles: PdcaCycleRecord[]
): Record<PdcaWeakStage, number> {
  const acc: Record<PdcaWeakStage, number> = {
    plan: 0,
    do: 0,
    check: 0,
    act: 0,
  };
  for (const c of cycles) {
    for (const w of analyzeWeakStages(c)) {
      acc[w] += 1;
    }
  }
  return acc;
}

export function dominantWeakStage(
  counts: Record<PdcaWeakStage, number>
): PdcaWeakStage | null {
  const entries = Object.entries(counts) as [PdcaWeakStage, number][];
  const max = Math.max(...entries.map(([, n]) => n), 0);
  if (max === 0) return null;
  const tops = entries.filter(([, n]) => n === max).map(([k]) => k);
  const priority: PdcaWeakStage[] = ["check", "act", "plan", "do"];
  for (const p of priority) {
    if (tops.includes(p)) return p;
  }
  return tops[0] ?? null;
}
