import type { Locale } from '../contract/routeState';
import { t } from '../i18n/strings';
import { loadProgress, type ProgressState } from '../stores/progress';

/** Wave 3：本週回顧一律可先預覽（不再鎖死新手） */
export function isMentorUnlocked(_st: ProgressState = loadProgress()): boolean {
  return true;
}

export function mentorUnlockHint(st: ProgressState = loadProgress(), locale: Locale): string {
  if (st.streak >= 5 || new Date().getDay() === 0) {
    return t('readDoneMentorUnlocked', locale);
  }
  return t('readDoneMentorPreviewAlways', locale);
}

export function buildWeekReview(st: ProgressState = loadProgress(), locale: Locale): string {
  const weekAgo = Date.now() - 7 * 86400000;
  const weekReads = st.log.filter((e) => e.at >= weekAgo).length;
  const doneCount = Object.values(st.done).filter(Boolean).length;
  return [
    t('readDoneWeekReads', locale, { n: weekReads }),
    t('readDoneWeekStreak', locale, { streak: st.streak, stars: st.stars }),
    t('readDoneWeekUnits', locale, { n: doneCount }),
    weekReads >= 5 ? t('readDoneWeekGreat', locale) : t('readDoneWeekGentle', locale),
  ].join('\n');
}
