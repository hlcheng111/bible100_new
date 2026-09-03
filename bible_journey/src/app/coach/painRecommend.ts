import type { Locale } from '../contract/routeState';
import { t } from '../i18n/strings';

/** 痛點標籤 → 主題 id（對應 thematic_readings） */
export type PainTag = {
  id: string;
  themeId: string;
  emoji: string;
};

export const PAIN_TAGS: PainTag[] = [
  { id: 'empty', themeId: 'creation', emoji: '🌫️' },
  { id: 'giveup', themeId: 'faith_heroes', emoji: '🛡️' },
  { id: 'lonely', themeId: 'jesus_life', emoji: '💛' },
  { id: 'pray', themeId: 'prayer', emoji: '🙏' },
  { id: 'hurt', themeId: 'love', emoji: '💔' },
  { id: 'wise', themeId: 'wisdom', emoji: '💡' },
  { id: 'sad', themeId: 'hope', emoji: '🌱' },
  { id: 'purpose', themeId: 'mission', emoji: '🚶' },
];

export function painTagLabel(tagId: string, locale: Locale): string {
  return t(`painTag_${tagId}`, locale);
}

export function recommendThemeFromPain(tagId: string): string | null {
  return PAIN_TAGS.find((p) => p.id === tagId)?.themeId ?? null;
}
