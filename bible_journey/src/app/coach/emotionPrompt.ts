import type { Locale } from '../contract/routeState';
import type { RouteState } from '../contract/routeState';
import { t } from '../i18n/strings';
import { safeGetItem, safeSetItem } from '../stores/storageSafe';

const DISMISS_KEY = 'bible_journey_emotion_dismiss_v1';

/** 可能偏「累／重」的章節（規則引擎，非 LLM） */
const HEAVY: Array<{ bookId: number; chapters?: number[] }> = [
  { bookId: 18 }, // Job
  { bookId: 25 }, // Lamentations
  { bookId: 21, chapters: [1, 2, 3] }, // Ecclesiastes
  { bookId: 19, chapters: [22, 42, 43, 88, 130] }, // lament Psalms
];

export type EmotionPrompt = {
  id: string;
  question: string;
};

function dayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function dismissMap(): Record<string, string> {
  try {
    const raw = safeGetItem(DISMISS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, string>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function isHeavyPassage(route: RouteState): boolean {
  const bookId = route.bookId ?? 0;
  const chapter = route.chapter ?? 0;
  if (route.themeId === 'hope' || route.themeId === 'creation') return true;
  return HEAVY.some((h) => {
    if (h.bookId !== bookId) return false;
    if (!h.chapters) return true;
    return h.chapters.includes(chapter);
  });
}

export function resolveEmotionPrompt(route: RouteState, locale: Locale): EmotionPrompt | null {
  if (!isHeavyPassage(route)) return null;
  const bid = route.bookId ?? 0;
  const chap = route.chapter ?? 0;
  const id = `${bid}:${chap}:${dayKey()}`;
  if (dismissMap()[id]) return null;
  return { id, question: t('emotionTiredAsk', locale) };
}

export function dismissEmotionPrompt(id: string) {
  const map = dismissMap();
  map[id] = dayKey();
  const keys = Object.keys(map);
  if (keys.length > 40) {
    for (const k of keys.slice(0, keys.length - 40)) delete map[k];
  }
  safeSetItem(DISMISS_KEY, JSON.stringify(map));
}

export type EmotionReply = 'tired' | 'ok' | 'skip';

export function emotionFollowup(reply: EmotionReply, locale: Locale): string {
  if (reply === 'tired') return t('emotionTiredTip', locale);
  if (reply === 'ok') return t('emotionOkTip', locale);
  return t('emotionSkipTip', locale);
}
