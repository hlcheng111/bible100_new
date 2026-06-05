import type { CtvDimension } from "./types";

export const CTV_SEMANTICS_VERSION = "ctv-semantic-v1.0.0";

export type CtvSemanticDef = {
  id: CtvDimension;
  canonicalKey: string;
  zh: string;
  en: string;
  description: string;
  aliases: string[];
};

export const CTV_CANONICAL_SEMANTICS: Record<CtvDimension, CtvSemanticDef> = {
  P: {
    id: "P",
    canonicalKey: "pastoral",
    zh: "牧養關懷",
    en: "Pastoral / Shepherding",
    description: "陪伴、關顧、安慰、屬靈同行與關係承托。",
    aliases: ["piety_care", "personality_pastoral", "shepherding"],
  },
  S: {
    id: "S",
    canonicalKey: "spiritual",
    zh: "屬靈生命",
    en: "Spiritual / Maturity",
    description: "禱告、敬拜、真理內化、靈命成熟與屬靈敏銳。",
    aliases: ["spirituality", "spiritual_prophetic", "gifts_ministry"],
  },
  G: {
    id: "G",
    canonicalKey: "governance_gospel",
    zh: "治理與宣教",
    en: "Governance + Gospel",
    description: "治理、行政、策略與福音使命行動。",
    aliases: ["governance", "gospel", "apostolate", "admin_expansion"],
  },
  C: {
    id: "C",
    canonicalKey: "competency_communication",
    zh: "能力與傳遞",
    en: "Competency + Communication",
    description: "任務能力、專業技能、教導表達與內容傳遞。",
    aliases: ["culture_alignment", "communication", "competency", "didactic"],
  },
  R: {
    id: "R",
    canonicalKey: "relationship",
    zh: "團隊關係",
    en: "Relationship / Teamwork",
    description: "協作、合一、衝突處理、角色互補與彼此成全。",
    aliases: ["raci_relation", "community", "teamwork"],
  },
  F: {
    id: "F",
    canonicalKey: "formation_fruit",
    zh: "成形與果效",
    en: "Formation + Fruit",
    description: "門徒成形、忠心持久、服事果子與可持續成長。",
    aliases: ["faith_maturity", "future_strategy", "fruit", "operations_faith"],
  },
};

export function resolveCtvAlias(alias: string): CtvDimension | null {
  const normalized = alias.trim().toLowerCase();
  if (!normalized) return null;
  for (const dim of Object.values(CTV_CANONICAL_SEMANTICS)) {
    if (dim.id.toLowerCase() === normalized) return dim.id;
    if (dim.canonicalKey.toLowerCase() === normalized) return dim.id;
    if (dim.aliases.some((item) => item.toLowerCase() === normalized)) return dim.id;
  }
  return null;
}
