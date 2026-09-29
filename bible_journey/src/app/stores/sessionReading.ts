const KEY = 'bible_journey_theme_clear_v1';

export type ThemeClearFlash = {
  themeId: string;
  bookId: number;
  chapter: number;
  at: number;
};

export function markThemeJustCleared(themeId: string, bookId: number, chapter: number): void {
  try {
    const payload: ThemeClearFlash = { themeId, bookId, chapter, at: Date.now() };
    sessionStorage.setItem(KEY, JSON.stringify(payload));
  } catch {
    /* private mode */
  }
}

/** 讀取並清除（地圖只播一次） */
export function consumeThemeClearFlash(themeId: string): ThemeClearFlash | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as ThemeClearFlash;
    if (data.themeId !== themeId) return null;
    if (Date.now() - data.at > 60_000) {
      sessionStorage.removeItem(KEY);
      return null;
    }
    sessionStorage.removeItem(KEY);
    return data;
  } catch {
    return null;
  }
}

const LAST_KEY = 'bible_journey_last_reading_v1';

export function rememberLastReading(bookId: number, chapter: number, themeId?: string): void {
  try {
    sessionStorage.setItem(
      LAST_KEY,
      JSON.stringify({ bookId, chapter, themeId: themeId || '', at: Date.now() })
    );
  } catch {
    /* ignore */
  }
}

export function loadLastReading(): { bookId: number; chapter: number; themeId?: string } | null {
  try {
    const raw = sessionStorage.getItem(LAST_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as { bookId: number; chapter: number; themeId?: string };
    if (!data.bookId || !data.chapter) return null;
    return data;
  } catch {
    return null;
  }
}
