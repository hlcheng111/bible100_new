import type { ReadingUnit } from '../contract/readingUnit';
import {
  unitFrom30Day,
  unitFromBible66,
  unitFromGolden,
  unitFromTheme,
} from '../contract/readingUnit';
import type { TrackId } from '../contract/routeState';
import {
  nextIncomplete30Day,
  nextIncompleteBible66,
  nextIncompleteGolden,
  nextIncompleteTheme,
} from '../stores/progress';
import { loadGolden } from '../tracks/trackData';

/** 移植 bible_app coach_kernel.resolveToday：30 日優先，其次金句 */
export async function resolveToday(): Promise<ReadingUnit> {
  const day = await nextIncomplete30Day();
  if (day) return unitFrom30Day(day);
  const gv = await nextIncompleteGolden();
  if (gv) return unitFromGolden(gv);
  return unitFrom30Day({
    day: 1,
    bookId: 1,
    chapter: 1,
    titleZh: '起初',
    titleEn: 'Beginning',
    hintZh: '神創造天地',
  });
}

/** 依跑道取下一個未完成關卡 */
export async function resolveTrackToday(trackId: TrackId): Promise<ReadingUnit> {
  if (trackId === '30day') {
    const day = await nextIncomplete30Day();
    if (day) return unitFrom30Day(day);
    return resolveToday();
  }
  if (trackId === 'golden') {
    const gv = await nextIncompleteGolden();
    if (gv) return unitFromGolden(gv);
    const fallback = (await loadGolden()).verses[0];
    if (fallback) return unitFromGolden(fallback);
    return resolveToday();
  }
  if (trackId === 'theme') {
    const row = await nextIncompleteTheme();
    if (row) {
      return unitFromTheme(row.themeId, row.themeNameZh, {
        bookId: row.bookId,
        chapter: row.chapter,
        labelZh: row.labelZh,
      });
    }
    return resolveToday();
  }
  const b66 = await nextIncompleteBible66();
  return unitFromBible66(b66.bookId, b66.chapter, b66.bookNameZh);
}
