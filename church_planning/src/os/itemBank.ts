import type { CtvDimension } from "../ctv/types";
import type { SourceScale } from "../ctv/normalize";

export type InstrumentReliabilityTier = "A" | "B" | "C";

export type ItemValidityTag =
  | "social_desirability_probe"
  | "consistency_pair_left"
  | "consistency_pair_right"
  | "reverse_keyed"
  | "pastoral_sensitive";

export type CtvProjection = Record<CtvDimension, number>;

export type QuestionItem = {
  itemId: string;
  instrumentId: string;
  instrumentVersion: string;
  prompt: string;
  scale: SourceScale;
  reverseScored?: boolean;
  projection: CtvProjection;
  itemWeight?: number;
  validityTags?: ItemValidityTag[];
};

export type InstrumentProfile = {
  instrumentId: string;
  displayName: string;
  version: string;
  reliabilityTier: InstrumentReliabilityTier;
  globalWeight?: number;
};

export type AssessmentResponse = {
  itemId: string;
  value: number;
  durationSeconds?: number;
};

export type AssessmentSubmission = {
  subjectId: string;
  subjectType: "member" | "leader" | "ministry_role" | "team";
  responses: AssessmentResponse[];
  submittedAt?: string;
};

export type ItemBankValidationIssue = {
  itemId: string;
  message: string;
};

export function reliabilityTierWeight(tier: InstrumentReliabilityTier): number {
  switch (tier) {
    case "A":
      return 1;
    case "B":
      return 0.8;
    case "C":
      return 0.6;
  }
}

export function validateItemBank(items: QuestionItem[]): ItemBankValidationIssue[] {
  const issues: ItemBankValidationIssue[] = [];
  const seenIds = new Set<string>();
  for (const item of items) {
    if (seenIds.has(item.itemId)) {
      issues.push({ itemId: item.itemId, message: "duplicate_item_id" });
    }
    seenIds.add(item.itemId);
    const projectionSum = Object.values(item.projection).reduce(
      (sum, value) => sum + value,
      0
    );
    if (Math.abs(projectionSum - 1) > 0.0001) {
      issues.push({
        itemId: item.itemId,
        message: `projection_sum_must_equal_1_actual_${projectionSum.toFixed(4)}`,
      });
    }
    if (item.itemWeight !== undefined && item.itemWeight <= 0) {
      issues.push({ itemId: item.itemId, message: "item_weight_must_be_positive" });
    }
  }
  return issues;
}
