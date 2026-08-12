import type { RouteState } from '../contract/routeState';
import type { ReadingUnit } from '../contract/readingUnit';
import goldenVerses from '../../assets/tracks/golden_verses.json';
import thirtyDayPlan from '../../assets/tracks/thirty_day_plan.json';
import thematicReadings from '../../assets/tracks/thematic_readings.json';

export type FocusMode = 'full-chapter' | 'verse-range' | 'single-verse';

function versesInRange(start: number, end: number): number[] {
  const out: number[] = [];
  for (let v = start; v <= end; v++) out.push(v);
  return out;
}

function thirtyDayMeta(day: number) {
  return thirtyDayPlan.days.find((d) => d.day === day) ?? null;
}

function themeUnitMeta(themeId: string, bookId: number, chapter: number) {
  const theme = thematicReadings.themes.find((th) => th.id === themeId);
  return theme?.units.find((u) => u.bookId === bookId && u.chapter === chapter) ?? null;
}

/** 六十六卷：URL 有 verse 時只捲動高亮，不過濾章節 */
export function resolveScrollHighlightVerse(route: RouteState): number | undefined {
  if (route.trackId === 'bible66' && route.verse != null) return route.verse;
  return undefined;
}

export function resolveFocusMode(route: RouteState): FocusMode {
  if (route.trackId === 'bible66') return 'full-chapter';
  if (route.trackId === 'golden') return 'single-verse';
  if (route.trackId === '30day') {
    const meta = route.day != null ? thirtyDayMeta(route.day) : null;
    if (meta?.verseStart != null && meta?.verseEnd != null) return 'verse-range';
    return 'full-chapter';
  }
  if (route.trackId === 'theme' && route.themeId) {
    const u = themeUnitMeta(route.themeId, route.bookId ?? 0, route.chapter ?? 0);
    if (u?.verseStart != null && u?.verseEnd != null) return 'verse-range';
    return 'full-chapter';
  }
  if (route.displayMode === 'verse') return 'single-verse';
  return 'full-chapter';
}

/**
 * 四跑道閱讀顆粒度契約
 * - bible66：整章（verse 僅供捲動高亮）
 * - 30day：verseStart~verseEnd
 * - golden：單節
 * - theme：可選 verseStart~verseEnd，否則整章
 */
export function resolveFocusVerses(route: RouteState, unit: ReadingUnit | null): number[] | null {
  const mode = resolveFocusMode(route);

  if (mode === 'full-chapter') return null;

  if (route.trackId === '30day' && route.day != null) {
    const meta = thirtyDayMeta(route.day);
    if (meta?.verseStart != null && meta?.verseEnd != null && meta.verseEnd >= meta.verseStart) {
      return versesInRange(meta.verseStart, meta.verseEnd);
    }
    return null;
  }

  if (route.trackId === 'theme' && route.themeId) {
    const u = themeUnitMeta(route.themeId, route.bookId ?? 0, route.chapter ?? 0);
    if (u?.verseStart != null && u?.verseEnd != null && u.verseEnd >= u.verseStart) {
      return versesInRange(u.verseStart, u.verseEnd);
    }
    return null;
  }

  if (route.trackId === 'golden') {
    if (route.gv) {
      const hit = goldenVerses.verses.find((v) => v.id === route.gv);
      if (hit?.verse) return [hit.verse];
    }
    if (unit?.verse != null) return [unit.verse];
    if (route.verse != null) return [route.verse];
    const matches = goldenVerses.verses.filter(
      (v) => v.bookId === route.bookId && v.chapter === route.chapter
    );
    if (matches.length) return [matches[matches.length - 1].verse];
  }

  if (mode === 'single-verse' && unit?.verse != null) return [unit.verse];

  return null;
}

export function isVerseFocusActive(focusVerses: number[] | null): boolean {
  return !!focusVerses?.length;
}

export function shouldHideChapterNav(route: RouteState, focusVerses: number[] | null): boolean {
  if (route.trackId === 'bible66') return false;
  /** 金句／有經節圈選的封閉關卡：禁止章導覽迷路 */
  if (route.trackId === 'golden') return true;
  if (route.trackId === 'theme') return true;
  if (route.trackId === '30day') return true;
  return isVerseFocusActive(focusVerses);
}
