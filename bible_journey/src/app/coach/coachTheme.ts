import type { Locale } from '../contract/routeState';
import type { RouteState } from '../contract/routeState';
import { t } from '../i18n/strings';
import { goldenRefLabel, thirtyDayThemeShort } from '../i18n/trackLocale';
import thirtyDayPlan from '../../assets/tracks/thirty_day_plan.json';
import goldenVerses from '../../assets/tracks/golden_verses.json';

function esc(s: string) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

/** 會眾-facing 主題標籤（非工程 json 來源） */
export function coachThemeBadge(
  route: RouteState,
  locale: Locale,
  bookLabel: string
): string {
  if (route.trackId === '30day' && route.day != null) {
    const meta = thirtyDayPlan.days.find((d) => d.day === route.day);
    if (meta) {
      const theme = thirtyDayThemeShort(meta, locale);
      if (theme) return t('coachTodayTheme', locale, { theme });
    }
    return t('coachTodayTheme', locale, { theme: `${locale === 'vi' ? 'Ngày' : locale === 'id' ? 'Hari' : 'Day'} ${route.day} 🕊️` });
  }
  if (route.trackId === 'golden') {
    const gv =
      (route.gv && goldenVerses.verses.find((v) => v.id === route.gv)) ||
      goldenVerses.verses.find(
        (v) => v.bookId === route.bookId && v.chapter === route.chapter
      );
    if (gv) {
      const ref = goldenRefLabel(gv, locale);
      return t('coachTodayGolden', locale, { ref });
    }
    if (bookLabel && locale === 'zh-Hant') return t('coachTodayGolden', locale, { ref: bookLabel });
  }
  return '';
}

export function coachThemeBadgeHtml(
  route: RouteState,
  locale: Locale,
  bookLabel: string
): string {
  const label = coachThemeBadge(route, locale, bookLabel);
  if (!label) return '';
  return `<p class="coach-drawer__theme">${esc(label)}</p>`;
}
