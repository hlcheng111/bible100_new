import type { TrackId } from './routeState';
import type { RouteState } from './routeState';
import type { ThirtyDayItem, GoldenItem, ThemeUnit } from '../tracks/trackData';

/** 讀經顯示粒度（對齊 bible_app bible_reader_core） */
export type DisplayMode = 'verse' | 'chapter' | 'chapter-focus';

export type Persona = 'kids' | 'adult' | 'seeker' | 'parent';

/** 讀後教練片段（Phase 0.4 接 coach_reflections；先留契約） */
export type CoachSnippet = {
  summaryZh?: string;
  applicationZh?: string;
  prayerZh?: string;
  challengeZh?: string;
};

/**
 * L2 關卡 — 全站唯一讀經單位契約（Phase 0 凍結）
 * 今日關卡、跑道地圖、讀經器、讀後頁皆由此派生。
 */
export type ReadingUnit = {
  trackId: TrackId;
  progressId: string;
  unitKey: string;
  bookId: number;
  chapter: number;
  verse?: number;
  day?: number;
  gv?: string;
  themeId?: string;
  themeUnitLabel?: string;
  titleZh: string;
  subtitleZh?: string;
  hintZh?: string;
  displayMode: DisplayMode;
  minutes?: number;
  coach?: CoachSnippet;
};

// —— progressId 命名（對齊 bible_app read_progress.js）——

export function dayProgressId(day: number): string {
  return `30d:${day}`;
}

export function goldenProgressId(gvId: string): string {
  return `gv:${gvId}`;
}

export function bible66ProgressId(bookId: number, chapter: number): string {
  return `b66:${bookId}:${chapter}`;
}

export function themeProgressId(themeId: string, bookId: number, chapter: number): string {
  return `theme:${themeId}:${bookId}:${chapter}`;
}

export function defaultDisplayMode(trackId: TrackId): DisplayMode {
  if (trackId === 'golden') return 'verse';
  return 'chapter';
}

// —— 從跑道資料建立 ReadingUnit ——

export function unitFrom30Day(d: ThirtyDayItem): ReadingUnit {
  const title = d.titleZh;
  const hasRange =
    d.verseStart != null && d.verseEnd != null && d.verseEnd >= d.verseStart;
  return {
    trackId: '30day',
    progressId: dayProgressId(d.day),
    unitKey: dayProgressId(d.day),
    bookId: d.bookId,
    chapter: d.chapter,
    day: d.day,
    titleZh: title,
    subtitleZh: `${d.bookId}:${d.chapter}`,
    hintZh: d.hintZh,
    displayMode: hasRange ? 'chapter-focus' : 'chapter',
    minutes: 5,
  };
}

export function unitFromGolden(v: GoldenItem): ReadingUnit {
  return {
    trackId: 'golden',
    progressId: goldenProgressId(v.id),
    unitKey: goldenProgressId(v.id),
    bookId: v.bookId,
    chapter: v.chapter,
    verse: v.verse,
    gv: v.id,
    titleZh: v.refZh,
    subtitleZh: v.tagZh,
    hintZh: v.tagZh,
    displayMode: 'verse',
    minutes: 3,
  };
}

export function unitFromTheme(themeId: string, themeNameZh: string, u: ThemeUnit): ReadingUnit {
  const hasRange =
    u.verseStart != null && u.verseEnd != null && u.verseEnd >= u.verseStart;
  return {
    trackId: 'theme',
    progressId: themeProgressId(themeId, u.bookId, u.chapter),
    unitKey: themeProgressId(themeId, u.bookId, u.chapter),
    bookId: u.bookId,
    chapter: u.chapter,
    themeId,
    themeUnitLabel: u.labelZh,
    titleZh: themeNameZh,
    subtitleZh: u.labelZh,
    hintZh: u.hintZh,
    displayMode: hasRange ? 'chapter-focus' : 'chapter',
    minutes: 5,
  };
}

export function unitFromBible66(bookId: number, chapter: number, bookNameZh?: string): ReadingUnit {
  return {
    trackId: 'bible66',
    progressId: bible66ProgressId(bookId, chapter),
    unitKey: bible66ProgressId(bookId, chapter),
    bookId,
    chapter,
    titleZh: bookNameZh || `書卷 ${bookId}`,
    subtitleZh: `第 ${chapter} 章`,
    displayMode: 'chapter',
    minutes: 5,
  };
}

// —— RouteState ↔ ReadingUnit ——

export type ReaderContext = Pick<
  RouteState,
  | 'bookId'
  | 'chapter'
  | 'verse'
  | 'trackId'
  | 'day'
  | 'gv'
  | 'themeId'
  | 'progressId'
  | 'displayMode'
>;

export function readerContextFromUnit(unit: ReadingUnit): ReaderContext {
  return {
    bookId: unit.bookId,
    chapter: unit.chapter,
    verse: unit.verse,
    trackId: unit.trackId,
    day: unit.day,
    gv: unit.gv,
    themeId: unit.themeId,
    progressId: unit.progressId,
    displayMode: unit.displayMode,
  };
}

export function routeStateFromUnit(unit: ReadingUnit): RouteState {
  return {
    view: 'reader',
    ...readerContextFromUnit(unit),
  };
}

/** 由 URL 路由還原最小 ReadingUnit（標題等豐富欄位由視圖/async 補全） */
export function unitFromRoute(route: RouteState): ReadingUnit | null {
  if (route.view !== 'reader' || !route.bookId || !route.chapter) return null;
  const trackId = route.trackId ?? 'bible66';
  const progressId =
    route.progressId ??
    (route.day != null
      ? dayProgressId(route.day)
      : route.gv
        ? goldenProgressId(route.gv)
        : route.themeId
          ? themeProgressId(route.themeId, route.bookId, route.chapter)
          : bible66ProgressId(route.bookId, route.chapter));

  return {
    trackId,
    progressId,
    unitKey: progressId,
    bookId: route.bookId,
    chapter: route.chapter,
    verse: route.verse,
    day: route.day,
    gv: route.gv,
    themeId: route.themeId,
    titleZh:
      route.day != null
        ? `Day ${route.day}`
        : route.gv
          ? route.gv
          : `書卷 ${route.bookId} 第 ${route.chapter} 章`,
    displayMode: route.displayMode ?? defaultDisplayMode(trackId),
  };
}
