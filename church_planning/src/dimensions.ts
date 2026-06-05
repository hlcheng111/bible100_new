/** Church Health Pro 2026 — Canonical dimension keys (English) */
export const DIMENSIONS = [
  "Worship",
  "Discipleship",
  "Fellowship",
  "Mission",
  "NextGen",
  "Leadership",
  "AdminTech",
  "Finance",
  "Community",
  "Facility",
] as const;

export type Dimension = (typeof DIMENSIONS)[number];

export const DIMENSION_LABELS_ZH: Record<Dimension, string> = {
  Worship: "崇拜",
  Discipleship: "門訓",
  Fellowship: "團契",
  Mission: "宣教",
  NextGen: "下一代",
  Leadership: "領袖",
  AdminTech: "行政與科技",
  Finance: "財務",
  Community: "社區",
  Facility: "資產／場域",
};

export const DIMENSION_LABELS_EN: Record<Dimension, string> = {
  Worship: "Worship",
  Discipleship: "Discipleship",
  Fellowship: "Fellowship / Small Groups",
  Mission: "Mission & Evangelism",
  NextGen: "Next Generation",
  Leadership: "Leadership",
  AdminTech: "Administration & Technology",
  Finance: "Finance & Stewardship",
  Community: "Community Presence",
  Facility: "Facility & Assets",
};

export type ChurchSize = "micro" | "small" | "medium" | "large";

export const CHURCH_SIZE_LABELS: Record<ChurchSize, string> = {
  micro: "微型（約 50 人以下）",
  small: "小型（約 51–150 人）",
  medium: "中型（約 151–400 人）",
  large: "大型（約 401 人以上）",
};

export const CHURCH_SIZE_LABELS_EN: Record<ChurchSize, string> = {
  micro: "Micro (~50 or fewer)",
  small: "Small (~51–150)",
  medium: "Medium (~151–400)",
  large: "Large (~401+)",
};
