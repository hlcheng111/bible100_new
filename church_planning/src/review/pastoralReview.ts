import type { MatchRecommendationLevel, MatchResult } from "../matching/matchingEngine";

export type PastoralReviewStatus =
  | "suggested"
  | "needs_conversation"
  | "approved_trial"
  | "approved"
  | "deferred"
  | "not_suitable_now";

export type PastoralReview = {
  matchId: string;
  reviewerId: string;
  status: PastoralReviewStatus;
  pastoralNotes: string;
  consentConfirmed: boolean;
  trialPeriod?: {
    startDate: string;
    endDate: string;
    checkInDate: string;
  };
  nextAction: string;
  reviewedAt: string;
};

export function defaultReviewStatus(
  level: MatchRecommendationLevel
): PastoralReviewStatus {
  switch (level) {
    case "trial":
      return "approved_trial";
    case "explore":
      return "suggested";
    case "pastoral_review":
      return "needs_conversation";
    case "defer":
      return "deferred";
    case "blocked":
      return "not_suitable_now";
  }
}

export function buildPastoralReviewDraft(
  match: MatchResult,
  reviewerId: string,
  reviewedAt = new Date().toISOString()
): PastoralReview {
  const status = defaultReviewStatus(match.recommendationLevel);
  const needsConsent = status === "approved_trial" || status === "approved";

  return {
    matchId: `${match.memberId}:${match.roleId}`,
    reviewerId,
    status,
    pastoralNotes: buildPastoralSummary(match),
    consentConfirmed: !needsConsent,
    nextAction: nextActionForStatus(status),
    reviewedAt,
  };
}

export function buildPastoralSummary(match: MatchResult): string {
  if (match.recommendationLevel === "blocked") {
    return "目前不宜直接安排此角色；請先處理訓練、成熟度或可承擔性等前置條件。";
  }
  if (match.recommendationLevel === "pastoral_review") {
    return "此配對有探索價值，但需要牧者或負責人先確認資料可信度、服事負擔與當事人意願。";
  }
  if (match.recommendationLevel === "trial") {
    return "可考慮以清楚界線和檢核點進入試行期；分數不是任命，仍需同行與回饋。";
  }
  if (match.recommendationLevel === "explore") {
    return "適合先以邀請對話方式探索，不宜直接視為正式委任。";
  }
  return "目前更適合暫緩，保留後續成長、訓練或休息後再評估的空間。";
}

function nextActionForStatus(status: PastoralReviewStatus): string {
  switch (status) {
    case "suggested":
      return "邀請當事人與事工負責人作一次探索對話。";
    case "needs_conversation":
      return "安排牧者覆核，確認風險、意願與支持安排。";
    case "approved_trial":
      return "設定 1-3 個月試行期、角色界線與檢核日期。";
    case "approved":
      return "完成正式安排並納入 PDCA 跟進。";
    case "deferred":
      return "暫緩安排，記錄需要補強或休息的項目。";
    case "not_suitable_now":
      return "不作此季安排，先處理硬性條件或牧養安全議題。";
  }
}
