import type { CtvVector } from "../ctv/types";
import type { MatchResult } from "../matching/matchingEngine";

export type RiskFlag = {
  id: string;
  level: "info" | "warning" | "critical";
  message: string;
};

export type PastoralReport = {
  summary: string;
  highlights: string[];
  growthAreas: string[];
  riskFlags: RiskFlag[];
  roleRecommendations: string[];
  actionPlan30d: string[];
};

export function detectCrossToolRisks(vector: CtvVector): RiskFlag[] {
  const risks: RiskFlag[] = [];
  const productivity = (vector.dimensions.C.score + vector.dimensions.G.score) / 2;
  const innerLife = (vector.dimensions.S.score + vector.dimensions.F.score) / 2;
  if (productivity >= 75 && innerLife <= 45) {
    risks.push({
      id: "high_output_low_inner_life",
      level: "critical",
      message: "產出高但靈命恢復偏低，建議先調整節奏與安息安排。",
    });
  }
  if (vector.dimensions.R.score < 50 && vector.dimensions.G.score > 70) {
    risks.push({
      id: "governance_team_gap",
      level: "warning",
      message: "治理推進強但團隊連結偏弱，需先補溝通與衝突處理。",
    });
  }
  if (vector.validity.requiresReview) {
    risks.push({
      id: "validity_requires_review",
      level: "warning",
      message: "作答一致性需要覆核，建議與牧者或導師進行對談確認。",
    });
  }
  return risks;
}

export function buildPastoralReport(
  vector: CtvVector,
  matches: MatchResult[]
): PastoralReport {
  const topDims = Object.entries(vector.dimensions)
    .sort((a, b) => b[1].score - a[1].score)
    .slice(0, 2)
    .map(([dim]) => dim);
  const bottomDims = Object.entries(vector.dimensions)
    .sort((a, b) => a[1].score - b[1].score)
    .slice(0, 2)
    .map(([dim]) => dim);

  const roleRecommendations = matches
    .filter((item) => item.finalScore >= 68)
    .slice(0, 3)
    .map(
      (item) =>
        `${item.roleId}（${item.finalScore.toFixed(1)}）-${item.recommendationLevel}`
    );

  const risks = detectCrossToolRisks(vector);

  return {
    summary: `本期向量顯示優勢維度為 ${topDims.join(
      "/"
    )}，成長焦點為 ${bottomDims.join("/")}`,
    highlights: [
      `你在 ${topDims[0]} 維度有穩定優勢，可承擔更清楚角色責任。`,
      `當前資料可信度為 ${vector.validity.responseQuality}，建議持續追蹤季度變化。`,
    ],
    growthAreas: [
      `先補強 ${bottomDims[0]}，避免單一強項造成團隊失衡。`,
      `以 30 天一循環，設定可量測的微行動並回顧。`,
    ],
    riskFlags: risks,
    roleRecommendations,
    actionPlan30d: [
      "安排一次與牧者/導師的覆核對談。",
      "選擇 1 個角色進行 4 週試行，保留每週回饋記錄。",
      "設定固定安息與靈修時段，避免高產出掩蓋內在透支。",
    ],
  };
}

export function toPastoralPlainText(report: PastoralReport): string {
  const riskLines = report.riskFlags.length
    ? report.riskFlags.map((risk) => `- [${risk.level}] ${risk.message}`).join("\n")
    : "- 無重大風險旗標";
  return [
    "國度事奉與生命長進評估摘要",
    `摘要：${report.summary}`,
    "",
    "亮點：",
    ...report.highlights.map((item) => `- ${item}`),
    "",
    "成長焦點：",
    ...report.growthAreas.map((item) => `- ${item}`),
    "",
    "風險旗標：",
    riskLines,
    "",
    "角色建議：",
    ...(report.roleRecommendations.length
      ? report.roleRecommendations.map((item) => `- ${item}`)
      : ["- 尚無達門檻的角色推薦"]),
    "",
    "30 天行動：",
    ...report.actionPlan30d.map((item) => `- ${item}`),
  ].join("\n");
}
