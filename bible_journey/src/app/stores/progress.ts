import {
  bible66ProgressId,
  dayProgressId,
  goldenProgressId,
  themeProgressId,
} from '../contract/readingUnit';
import { loadGolden, loadThematic, loadThirtyDay, type GoldenItem, type ThemeUnit, type ThirtyDayItem } from '../tracks/trackData';
import { loadBibleCatalog } from '../bible/catalog';
import { safeGetItem, safeParseJson, safeSetItem, storageAvailable } from './storageSafe';

const KEY = 'bible_journey_progress';
const SCHEMA_VERSION = 1;

export type ProgressLogEntry = {
  id: string;
  at: number;
};

export type ProgressState = {
  schema_version?: number;
  stars: number;
  streak: number;
  lastDay: string;
  done: Record<string, boolean>;
  log: ProgressLogEntry[];
};

function emptyProgress(): ProgressState {
  return {
    schema_version: SCHEMA_VERSION,
    stars: 0,
    streak: 0,
    lastDay: '',
    done: {},
    log: [],
  };
}

function normalizeDone(raw: unknown): Record<string, boolean> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const out: Record<string, boolean> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof k === 'string' && k) out[k] = !!v;
  }
  return out;
}

function normalizeLog(raw: unknown): ProgressLogEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((e) => e && typeof e === 'object' && typeof (e as ProgressLogEntry).id === 'string')
    .map((e) => ({
      id: String((e as ProgressLogEntry).id),
      at: Number((e as ProgressLogEntry).at) || Date.now(),
    }));
}

function normalizeProgress(raw: Partial<ProgressState> | null | undefined): ProgressState {
  const base = emptyProgress();
  if (!raw || typeof raw !== 'object') return base;
  return {
    schema_version: SCHEMA_VERSION,
    stars: typeof raw.stars === 'number' && raw.stars >= 0 ? raw.stars : 0,
    streak: typeof raw.streak === 'number' && raw.streak >= 0 ? raw.streak : 0,
    lastDay: typeof raw.lastDay === 'string' ? raw.lastDay : '',
    done: normalizeDone(raw.done),
    log: normalizeLog(raw.log),
  };
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

/** 首次開啟：寫入空結構，避免後續讀取異常 */
export function ensureProgressStorage(): ProgressState {
  const st = loadProgress();
  if (!storageAvailable()) return st;
  const raw = safeGetItem(KEY);
  if (!raw) {
    saveProgress(st);
  }
  return st;
}

export function loadProgress(): ProgressState {
  const parsed = safeParseJson<Partial<ProgressState>>(safeGetItem(KEY));
  if (parsed) return normalizeProgress(parsed);
  return normalizeProgress({});
}

export function saveProgress(state: ProgressState) {
  const normalized = normalizeProgress(state);
  safeSetItem(KEY, JSON.stringify(normalized));
}

export function isUnitDone(progressId: string): boolean {
  return !!loadProgress().done[progressId];
}

export function markUnitDone(progressId: string): ProgressState {
  const st = loadProgress();
  if (!st.done[progressId]) {
    st.done[progressId] = true;
    st.log.push({ id: progressId, at: Date.now() });
    saveProgress(st);
  }
  return st;
}

export async function nextIncomplete30Day(): Promise<ThirtyDayItem | null> {
  const plan = await loadThirtyDay();
  const st = loadProgress();
  for (const d of plan.days) {
    if (!st.done[dayProgressId(d.day)]) return d;
  }
  return plan.days[0] ?? null;
}

export async function nextIncompleteGolden(): Promise<GoldenItem | null> {
  const golden = await loadGolden();
  const st = loadProgress();
  for (const v of golden.verses) {
    if (!st.done[goldenProgressId(v.id)]) return v;
  }
  return golden.verses[0] ?? null;
}

export async function nextIncompleteBible66(): Promise<{ bookId: number; chapter: number; bookNameZh?: string }> {
  const catalog = await loadBibleCatalog();
  const st = loadProgress();
  for (const book of catalog.books) {
    for (let ch = 1; ch <= book.chapters; ch++) {
      if (!st.done[bible66ProgressId(book.id, ch)]) {
        return { bookId: book.id, chapter: ch, bookNameZh: book.nameZh };
      }
    }
  }
  const first = catalog.books[0];
  return { bookId: first?.id ?? 1, chapter: 1, bookNameZh: first?.nameZh };
}

export async function nextIncompleteTheme(): Promise<{
  themeId: string;
  themeNameZh: string;
  bookId: number;
  chapter: number;
  labelZh: string;
} | null> {
  const data = await loadThematic();
  const st = loadProgress();
  for (const theme of data.themes) {
    for (const u of theme.units) {
      const pid = themeProgressId(theme.id, u.bookId, u.chapter);
      if (!st.done[pid]) {
        return {
          themeId: theme.id,
          themeNameZh: theme.nameZh,
          bookId: u.bookId,
          chapter: u.chapter,
          labelZh: u.labelZh,
        };
      }
    }
  }
  const theme = data.themes[0];
  const u = theme?.units[0];
  if (!theme || !u) return null;
  return {
    themeId: theme.id,
    themeNameZh: theme.nameZh,
    bookId: u.bookId,
    chapter: u.chapter,
    labelZh: u.labelZh,
  };
}

/** 單一主題內的下一個未完成關卡（第一關引導） */
export async function nextIncompleteUnitInTheme(themeId: string): Promise<{
  themeId: string;
  themeNameZh: string;
  unit: ThemeUnit;
} | null> {
  const data = await loadThematic();
  const theme = data.themes.find((th) => th.id === themeId);
  if (!theme) return null;
  const st = loadProgress();
  for (const u of theme.units) {
    const pid = themeProgressId(themeId, u.bookId, u.chapter);
    if (!st.done[pid]) {
      return { themeId, themeNameZh: theme.nameZh, unit: u };
    }
  }
  const first = theme.units[0];
  if (!first) return null;
  return { themeId, themeNameZh: theme.nameZh, unit: first };
}

export function markTodayRead(progressId?: string): ProgressState {
  const st = loadProgress();
  const today = todayKey();
  if (st.lastDay !== today) {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    const yesterday = y.toISOString().slice(0, 10);
    st.streak = st.lastDay === yesterday ? st.streak + 1 : 1;
    st.stars += 1;
    st.lastDay = today;
    saveProgress(st);
  }
  if (progressId) markUnitDone(progressId);
  return loadProgress();
}
