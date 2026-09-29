import type { Locale } from '../contract/routeState';
import type { RouteState } from '../contract/routeState';
import { t } from '../i18n/strings';

/** 同跑可見：依章節決定穩定人數（示範用，非真實後端） */
export function companionsCount(route: RouteState): number {
  const book = route.bookId ?? 1;
  const chap = route.chapter ?? 1;
  const day = route.day ?? 0;
  const seed = book * 17 + chap * 5 + day * 3;
  return 4 + (seed % 11); /* 4–14 */
}

export function companionsLine(locale: Locale, route: RouteState): string {
  const n = companionsCount(route);
  return t('companionsReading', locale, { n });
}
