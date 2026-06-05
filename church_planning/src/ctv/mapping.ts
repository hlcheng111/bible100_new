import {
  CTV_DIMENSIONS,
  DEFAULT_VALIDITY_SUMMARY,
  emptyCtvDimensionScore,
  type CtvDimension,
  type CtvSubjectType,
  type CtvVector,
  type ValiditySummary,
} from "./types";
import { clamp, normalizeTo0To100, type SourceScale } from "./normalize";

export type ToolCtvWeights = Partial<Record<CtvDimension, number>>;

export type ToolCtvMapping = {
  toolId: string;
  label: string;
  weights: ToolCtvWeights;
  defaultConfidence: number;
};

export const TOOL_TO_CTV_MAPPINGS: Record<string, ToolCtvMapping> = {
  raci_reflection: {
    toolId: "raci_reflection",
    label: "RACI 角色反思",
    weights: { R: 0.55, G: 0.3, P: 0.15 },
    defaultConfidence: 0.68,
  },
  smart_planning: {
    toolId: "smart_planning",
    label: "SMART 事工規劃",
    weights: { G: 0.45, C: 0.35, R: 0.2 },
    defaultConfidence: 0.66,
  },
  pdca_planning: {
    toolId: "pdca_planning",
    label: "PDCA 行動迴圈",
    weights: { G: 0.45, C: 0.25, R: 0.3 },
    defaultConfidence: 0.7,
  },
  spiritual_health: {
    toolId: "spiritual_health",
    label: "信徒靈性生命健康",
    weights: { F: 0.5, P: 0.25, R: 0.25 },
    defaultConfidence: 0.72,
  },
  pastoral_spiritual_survey: {
    toolId: "pastoral_spiritual_survey",
    label: "教牧／領袖靈命調查",
    weights: { F: 0.35, P: 0.25, R: 0.2, C: 0.2 },
    defaultConfidence: 0.76,
  },
  spiritual_gifts: {
    toolId: "spiritual_gifts",
    label: "屬靈恩賜",
    weights: { S: 0.7, F: 0.15, R: 0.15 },
    defaultConfidence: 0.64,
  },
  ministry_8020: {
    toolId: "ministry_8020",
    label: "教會版 80/20",
    weights: { G: 0.45, C: 0.35, R: 0.2 },
    defaultConfidence: 0.7,
  },
  culture_fit: {
    toolId: "culture_fit",
    label: "文化契合度",
    weights: { C: 0.65, F: 0.2, R: 0.15 },
    defaultConfidence: 0.68,
  },
  disc_mbti: {
    toolId: "disc_mbti",
    label: "DISC / MBTI 性格傾向",
    weights: { P: 0.55, R: 0.35, C: 0.1 },
    defaultConfidence: 0.48,
  },
};

export type BuildCtvVectorInput = {
  subjectId: string;
  subjectType: CtvSubjectType;
  toolId: string;
  /** One or more source scores from the tool, all on the same declared scale. */
  sourceScores: Record<string, number>;
  sourceScale: SourceScale;
  validity?: ValiditySummary;
  generatedAt?: string;
  version?: string;
};

function confidenceFromEvidence(
  baseConfidence: number,
  evidenceCount: number,
  validity: ValiditySummary
): number {
  const evidenceFactor = clamp(evidenceCount / 4, 0.35, 1);
  const qualityFactor =
    validity.responseQuality === "high"
      ? 1
      : validity.responseQuality === "medium"
        ? 0.75
        : 0.5;
  return clamp(
    baseConfidence *
      evidenceFactor *
      qualityFactor *
      clamp(validity.consistencyScore, 0, 1),
    0,
    1
  );
}

export function buildCtvVectorFromToolScores(
  input: BuildCtvVectorInput
): CtvVector {
  const mapping = TOOL_TO_CTV_MAPPINGS[input.toolId];
  if (!mapping) {
    throw new Error(`Unknown CTV tool mapping: ${input.toolId}`);
  }

  const validity = input.validity ?? DEFAULT_VALIDITY_SUMMARY;
  const rawScores = Object.values(input.sourceScores);
  const normalizedScores = rawScores.map((score) =>
    normalizeTo0To100(score, input.sourceScale)
  );
  const evidenceCount = normalizedScores.length;
  const avgScore =
    evidenceCount > 0
      ? normalizedScores.reduce((sum, score) => sum + score, 0) / evidenceCount
      : 0;

  const dimensions = Object.fromEntries(
    CTV_DIMENSIONS.map((dim) => [dim, emptyCtvDimensionScore()])
  ) as CtvVector["dimensions"];

  for (const dim of CTV_DIMENSIONS) {
    const weight = mapping.weights[dim] ?? 0;
    if (weight <= 0 || evidenceCount === 0) continue;
    dimensions[dim] = {
      score: Math.round(avgScore * 10) / 10,
      confidence: confidenceFromEvidence(
        mapping.defaultConfidence * clamp(weight * 1.5, 0.25, 1),
        evidenceCount,
        validity
      ),
      evidenceCount,
      sources: Object.keys(input.sourceScores),
    };
  }

  return {
    subjectId: input.subjectId,
    subjectType: input.subjectType,
    source: input.toolId,
    version: input.version ?? "ctv-mvp-v1",
    scale: "0_100",
    dimensions,
    validity,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
  };
}
