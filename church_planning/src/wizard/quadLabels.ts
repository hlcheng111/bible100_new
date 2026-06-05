import type { Quadrant } from "../data/churchHealthQuestions";

export const QUAD_BILINGUAL: Record<
  Quadrant,
  { titleZh: string; titleEn: string }
> = {
  S: { titleZh: "優勢（S）", titleEn: "Strengths (S)" },
  W: { titleZh: "劣勢（W）", titleEn: "Weaknesses (W)" },
  O: { titleZh: "機會（O）", titleEn: "Opportunities (O)" },
  T: { titleZh: "威脅（T）", titleEn: "Threats (T)" },
};
