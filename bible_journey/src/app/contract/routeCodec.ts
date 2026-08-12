import type { RouteState } from './routeState';
import type { DisplayMode } from './readingUnit';

const VALID_TRACKS = new Set(['bible66', '30day', 'golden', 'theme']);
const VALID_DISPLAY = new Set(['verse', 'chapter', 'chapter-focus']);

export function parseIntParam(raw: string | null | undefined): number | undefined {
  if (!raw) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

export function decodeReaderQuery(search: string): Partial<RouteState> {
  const q = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const ctx: Partial<RouteState> = {};
  const track = q.get('track');
  if (track && VALID_TRACKS.has(track)) ctx.trackId = track as RouteState['trackId'];
  const day = parseIntParam(q.get('day'));
  if (day != null) ctx.day = day;
  const verse = parseIntParam(q.get('verse'));
  if (verse != null) ctx.verse = verse;
  const gv = q.get('gv');
  if (gv) ctx.gv = gv;
  const themeId = q.get('themeId');
  if (themeId) ctx.themeId = themeId;
  const progressId = q.get('progressId');
  if (progressId) ctx.progressId = progressId;
  const display = q.get('display');
  if (display && VALID_DISPLAY.has(display)) ctx.displayMode = display as DisplayMode;
  return ctx;
}

export function encodeReaderQuery(route: RouteState): string {
  const q = new URLSearchParams();
  if (route.trackId) q.set('track', route.trackId);
  if (route.day != null) q.set('day', String(route.day));
  if (route.verse != null) q.set('verse', String(route.verse));
  if (route.gv) q.set('gv', route.gv);
  if (route.themeId) q.set('themeId', route.themeId);
  if (route.progressId) q.set('progressId', route.progressId);
  if (route.displayMode) q.set('display', route.displayMode);
  const s = q.toString();
  return s ? `?${s}` : '';
}

export function parseReaderLocation(hash: string, search = ''): RouteState | null {
  const raw = hash.replace(/^#/, '');
  const [view, seg] = raw.split('/');
  if (view !== 'reader' || !seg) return null;
  const [b, c] = seg.split('-').map(Number);
  if (!b || !c) return null;
  return {
    view: 'reader',
    bookId: b,
    chapter: c,
    ...decodeReaderQuery(search),
  };
}

export function formatReaderLocation(route: RouteState): string {
  if (!route.bookId || !route.chapter) return '#reader/1-1';
  return `#reader/${route.bookId}-${route.chapter}${encodeReaderQuery(route)}`;
}
