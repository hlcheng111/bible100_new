import type { Locale } from '../contract/routeState';
import type { CoachContent } from './coachService';
import { t } from '../i18n/strings';

/** 內容分層：預寫陪伴 vs 通用草稿（不把預寫說成 AI） */
export type ContentLayer = 'authored' | 'soft_draft';

export function layerFromCoachSource(source: CoachContent['source']): ContentLayer {
  return source === 'fallback' ? 'soft_draft' : 'authored';
}

export function coachSourceBadge(source: CoachContent['source'], locale: Locale): string {
  const layer = layerFromCoachSource(source);
  return layer === 'authored' ? t('contentLayerAuthored', locale) : t('contentLayerSoftDraft', locale);
}

export function faqSourceBadge(locale: Locale): string {
  return t('contentLayerFaq', locale);
}
