import { CTV_DIMENSIONS, type CtvDimension, type CtvVector } from "../ctv/types";
import { clamp, round1 } from "../ctv/normalize";

export type RoleRiskLevel = "low" | "medium" | "high";

export type VolunteerProfile = {
  memberId: string;
  ctv: CtvVector;
  giftIds?: string[];
  completedTrainingIds?: string[];
  availabilityHoursPerMonth?: number;
  servingHistoryRoleIds?: string[];
  cultureFitScore?: number;
  /** 0-100, high means overloaded or likely to burn out. */
  burdenRiskScore?: number;
  willingRoleIds?: string[];
  unavailableRoleIds?: string[];
};

export type MinistryRoleProfile = {
  roleId: string;
  roleName: string;
  requiredCtv: Record<CtvDimension, number>;
  preferredGiftIds?: string[];
  requiredTrainingIds?: string[];
  minFaithMaturity?: number;
  minAvailabilityHoursPerMonth?: number;
  riskLevel: RoleRiskLevel;
};

export type MatchBreakdown = {
  ctvSimilarity: number;
  giftFit: number;
  availabilityFit: number;
  experienceFit: number;
  cultureFit: number;
  burdenSafety: number;
};

export type MatchRecommendationLevel =
  | "explore"
  | "trial"
  | "pastoral_review"
  | "defer"
  | "blocked";

export type MatchResult = {
  memberId: string;
  roleId: string;
  finalScore: number;
  recommendationLevel: MatchRecommendationLevel;
  breakdown: MatchBreakdown;
  hardBlocks: string[];
  reviewFlags: string[];
  explanation: string[];
};

function vectorFromCtv(ctv: CtvVector): number[] {
  return CTV_DIMENSIONS.map((dim) => ctv.dimensions[dim].score);
}

function vectorFromRole(role: MinistryRoleProfile): number[] {
  return CTV_DIMENSIONS.map((dim) => role.requiredCtv[dim]);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  const dot = a.reduce((sum, value, index) => sum + value * b[index]!, 0);
  const normA = Math.sqrt(a.reduce((sum, value) => sum + value * value, 0));
  const normB = Math.sqrt(b.reduce((sum, value) => sum + value * value, 0));
  if (!normA || !normB) return 0;
  return clamp(dot / (normA * normB), 0, 1);
}

function ratioFit(actual: number | undefined, required: number | undefined): number {
  if (required === undefined || required <= 0) return 100;
  if (actual === undefined) return 50;
  return round1(clamp(actual / required, 0, 1) * 100);
}

function setOverlapFit(actual: string[] = [], preferred: string[] = []): number {
  if (!preferred.length) return 100;
  const actualSet = new Set(actual);
  const hits = preferred.filter((id) => actualSet.has(id)).length;
  return round1((hits / preferred.length) * 100);
}

function requiredTrainingBlocks(
  volunteer: VolunteerProfile,
  role: MinistryRoleProfile
): string[] {
  const completed = new Set(volunteer.completedTrainingIds ?? []);
  return (role.requiredTrainingIds ?? [])
    .filter((id) => !completed.has(id))
    .map((id) => `missing_training:${id}`);
}

function hardBlocksFor(
  volunteer: VolunteerProfile,
  role: MinistryRoleProfile
): string[] {
  const blocks = requiredTrainingBlocks(volunteer, role);
  if ((volunteer.unavailableRoleIds ?? []).includes(role.roleId)) {
    blocks.push("volunteer_marked_unavailable");
  }
  const faith = volunteer.ctv.dimensions.F.score;
  if (role.minFaithMaturity !== undefined && faith < role.minFaithMaturity) {
    blocks.push("faith_maturity_below_minimum");
  }
  return blocks;
}

function reviewFlagsFor(
  volunteer: VolunteerProfile,
  role: MinistryRoleProfile,
  breakdown: MatchBreakdown
): string[] {
  const flags: string[] = [];
  if (volunteer.ctv.validity.requiresReview) flags.push("validity_requires_review");
  if (breakdown.burdenSafety < 45) flags.push("burden_safety_low");
  if (role.riskLevel === "high" && volunteer.ctv.dimensions.F.score < 75) {
    flags.push("high_risk_role_needs_faith_review");
  }
  if (role.riskLevel === "high" && volunteer.ctv.dimensions.R.score < 70) {
    flags.push("high_risk_role_needs_teamwork_review");
  }
  return flags;
}

function recommendationLevel(
  finalScore: number,
  hardBlocks: string[],
  reviewFlags: string[]
): MatchRecommendationLevel {
  if (hardBlocks.length) return "blocked";
  if (reviewFlags.length) return finalScore >= 70 ? "pastoral_review" : "defer";
  if (finalScore >= 82) return "trial";
  if (finalScore >= 68) return "explore";
  return "defer";
}

function explanationFor(
  role: MinistryRoleProfile,
  breakdown: MatchBreakdown,
  hardBlocks: string[],
  reviewFlags: string[]
): string[] {
  const lines: string[] = [];
  if (hardBlocks.length) {
    lines.push(`暫不建議直接安排：${hardBlocks.join(", ")}。`);
  }
  lines.push(
    `CTV 向量相似度 ${breakdown.ctvSimilarity}/100，適合作為「探索可能性」而非任命結論。`
  );
  if (breakdown.giftFit >= 70) {
    lines.push(`恩賜與「${role.roleName}」需求有明顯交集。`);
  }
  if (breakdown.burdenSafety < 60) {
    lines.push("負擔安全偏低，宜先確認休息、界線與當事人意願。");
  }
  if (reviewFlags.length) {
    lines.push(`需要牧養覆核：${reviewFlags.join(", ")}。`);
  }
  return lines;
}

export function matchVolunteerToRole(
  volunteer: VolunteerProfile,
  role: MinistryRoleProfile
): MatchResult {
  const ctvSimilarity = round1(
    cosineSimilarity(vectorFromCtv(volunteer.ctv), vectorFromRole(role)) * 100
  );
  const giftFit = setOverlapFit(volunteer.giftIds, role.preferredGiftIds);
  const availabilityFit = ratioFit(
    volunteer.availabilityHoursPerMonth,
    role.minAvailabilityHoursPerMonth
  );
  const experienceFit = (volunteer.servingHistoryRoleIds ?? []).includes(role.roleId)
    ? 100
    : 50;
  const cultureFit = round1(clamp(volunteer.cultureFitScore ?? volunteer.ctv.dimensions.C.score, 0, 100));
  const burdenSafety = round1(100 - clamp(volunteer.burdenRiskScore ?? 30, 0, 100));

  const breakdown: MatchBreakdown = {
    ctvSimilarity,
    giftFit,
    availabilityFit,
    experienceFit,
    cultureFit,
    burdenSafety,
  };

  const hardBlocks = hardBlocksFor(volunteer, role);
  const reviewFlags = reviewFlagsFor(volunteer, role, breakdown);
  const weighted =
    0.4 * ctvSimilarity +
    0.15 * giftFit +
    0.15 * availabilityFit +
    0.1 * experienceFit +
    0.1 * cultureFit +
    0.1 * burdenSafety;
  const finalScore = hardBlocks.length ? 0 : round1(weighted);

  return {
    memberId: volunteer.memberId,
    roleId: role.roleId,
    finalScore,
    recommendationLevel: recommendationLevel(finalScore, hardBlocks, reviewFlags),
    breakdown,
    hardBlocks,
    reviewFlags,
    explanation: explanationFor(role, breakdown, hardBlocks, reviewFlags),
  };
}

export function rankRoleMatches(
  volunteers: VolunteerProfile[],
  role: MinistryRoleProfile
): MatchResult[] {
  return volunteers
    .map((volunteer) => matchVolunteerToRole(volunteer, role))
    .sort((a, b) => b.finalScore - a.finalScore);
}
