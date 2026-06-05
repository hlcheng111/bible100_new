export const CTV_DIMENSIONS = ["P", "S", "G", "C", "R", "F"] as const;

export type CtvDimension = (typeof CTV_DIMENSIONS)[number];

export type CtvSubjectType = "member" | "leader" | "ministry_role" | "team";

export type CtvScale = "0_100";

export type CtvDimensionScore = {
  /** Canonical 0-100 score. */
  score: number;
  /** 0-1 confidence, lowered when evidence is thin or validity is weak. */
  confidence: number;
  evidenceCount: number;
  sources: string[];
};

export type ValiditySummary = {
  consistencyScore: number;
  socialDesirabilityRisk: number;
  contradictionFlags: string[];
  lowEvidenceFlags: string[];
  responseQuality: "high" | "medium" | "low";
  requiresReview: boolean;
};

export type CtvVector = {
  subjectId: string;
  subjectType: CtvSubjectType;
  source: string;
  version: string;
  scale: CtvScale;
  dimensions: Record<CtvDimension, CtvDimensionScore>;
  validity: ValiditySummary;
  generatedAt: string;
};

export type CtvDimensionLabels = Record<CtvDimension, string>;

export const CTV_DIMENSION_LABELS_ZH: CtvDimensionLabels = {
  P: "Pastoral / Shepherding 牧養關懷",
  S: "Spiritual Gifts / Ministry 屬靈恩賜與事奉",
  G: "Governance / Administration 治理行政",
  C: "Culture / Alignment 文化與異象契合",
  R: "Relationship / Teamwork 團隊關係",
  F: "Faith Maturity / Theology 靈命成熟與真理根基",
};

export const DEFAULT_VALIDITY_SUMMARY: ValiditySummary = {
  consistencyScore: 1,
  socialDesirabilityRisk: 0,
  contradictionFlags: [],
  lowEvidenceFlags: [],
  responseQuality: "high",
  requiresReview: false,
};

export function emptyCtvDimensionScore(): CtvDimensionScore {
  return {
    score: 0,
    confidence: 0,
    evidenceCount: 0,
    sources: [],
  };
}
