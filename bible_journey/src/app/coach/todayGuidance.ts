import type { Locale } from '../contract/routeState';
import { routeStateFromUnit } from '../contract/readingUnit';
import { t } from '../i18n/strings';
import { resolveToday } from './resolveToday';
import { resolveCoachContent } from './coachService';

const MAX_CHARS: Record<Locale, number> = {
  'zh-Hant': 72,
  en: 110,
  vi: 100,
  id: 100,
};

function softTruncate(text: string, locale: Locale): string {
  const max = MAX_CHARS[locale] || 80;
  const trimmed = text.trim().replace(/\s+/g, ' ');
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}

function passageLabel(unit: {
  titleZh: string;
  subtitleZh?: string;
  bookId: number;
  chapter: number;
  day?: number;
}): string {
  if (unit.day != null) {
    return unit.titleZh || `Day ${unit.day}`;
  }
  return unit.subtitleZh || unit.titleZh || `${unit.bookId}:${unit.chapter}`;
}

/** Wave 1：首頁「今日給你的一句」— 只用既有教練文案，不接外部 AI */
export async function loadTodayGuidance(locale: Locale): Promise<{ text: string }> {
  try {
    const unit = await resolveToday();
    const route = routeStateFromUnit(unit);
    const label = passageLabel(unit);
    const content = resolveCoachContent({ ...route, view: 'reader' }, locale, label);

    if (content.source === 'fallback') {
      return { text: t('todayGuideFallback', locale, { passage: label }) };
    }

    return { text: softTruncate(content.summary, locale) };
  } catch {
    return { text: t('todayGuideError', locale) };
  }
}
