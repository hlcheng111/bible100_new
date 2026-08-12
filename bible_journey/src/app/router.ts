import { readerContextFromUnit, routeStateFromUnit, type ReadingUnit } from './contract/readingUnit';
import { decodeReaderQuery, encodeReaderQuery } from './contract/routeCodec';
import type { RouteState, TrackId, ViewId } from './contract/routeState';

export type { Locale, RouteState, TrackId, ViewId } from './contract/routeState';

type Listener = (route: RouteState) => void;

const DEFAULT: RouteState = { view: 'home' };

const VALID_VIEWS: ViewId[] = ['home', 'today', 'reader', 'tracks', 'squad', 'qna', 'mentor', 'help'];
const VALID_TRACKS: TrackId[] = ['bible66', '30day', 'golden', 'theme'];

function parseTrackId(raw: string | null): TrackId | undefined {
  if (raw && VALID_TRACKS.includes(raw as TrackId)) return raw as TrackId;
  return undefined;
}

let current: RouteState = { ...DEFAULT };
const listeners = new Set<Listener>();

function readReaderQuery(): Partial<RouteState> {
  return decodeReaderQuery(location.search);
}

function parseHash(): RouteState {
  const raw = (location.hash || '#home').replace(/^#/, '');
  const [view, ...rest] = raw.split('/');
  if (!VALID_VIEWS.includes(view as ViewId)) return { ...DEFAULT };
  const route: RouteState = { view: view as ViewId };

  if (view === 'reader' && rest[0]) {
    const [b, c] = rest[0].split('-').map(Number);
    if (b && c) {
      route.bookId = b;
      route.chapter = c;
      Object.assign(route, readReaderQuery());
    }
  }

  if (view === 'help' && rest[0]) {
    const h = rest[0] as RouteState['help'];
    if (h === 'what' || h === 'how' || h === 'why') route.help = h;
  }

  if (view === 'tracks' && rest[0]) {
    const tid = parseTrackId(rest[0]);
    if (tid) route.trackId = tid;
    const pickBook = Number(rest[1]);
    if (pickBook >= 1 && pickBook <= 66) {
      route.bookId = pickBook;
    } else if (tid === 'theme' && rest[1]) {
      route.themeId = decodeURIComponent(rest[1]);
    }
  }

  return route;
}

function buildReaderSearch(route: RouteState): string {
  return encodeReaderQuery(route);
}

function syncUrl(route: RouteState) {
  let hash = route.view;
  if (route.view === 'reader' && route.bookId && route.chapter) {
    hash += `/${route.bookId}-${route.chapter}`;
  }
  if (route.view === 'help' && route.help) {
    hash += `/${route.help}`;
  }
  if (route.view === 'tracks' && route.trackId) {
    hash += `/${route.trackId}`;
    if (route.trackId === 'theme' && route.themeId) {
      hash += `/${encodeURIComponent(route.themeId)}`;
    } else if (route.bookId) {
      hash += `/${route.bookId}`;
    }
  }

  const search = route.view === 'reader' ? buildReaderSearch(route) : '';
  const target = `#${hash}${search}`;
  const currentUrl = `${location.hash}${location.search}`;
  if (currentUrl !== target) {
    history.replaceState(route, '', target);
  }
}

function mergeReaderState(partial: Partial<RouteState> & { view: 'reader' }): RouteState {
  const next: RouteState = { view: 'reader' };
  next.bookId = partial.bookId ?? 1;
  next.chapter = partial.chapter ?? 1;
  if (partial.verse != null) next.verse = partial.verse;
  if (partial.trackId) next.trackId = partial.trackId;
  if (partial.day != null) next.day = partial.day;
  if (partial.gv) next.gv = partial.gv;
  if (partial.themeId) next.themeId = partial.themeId;
  if (partial.progressId) next.progressId = partial.progressId;
  if (partial.displayMode) next.displayMode = partial.displayMode;
  return next;
}

export function getRoute(): RouteState {
  return { ...current };
}

export function navigateToUnit(unit: ReadingUnit) {
  navigate(routeStateFromUnit(unit));
}

export function navigate(partial: Partial<RouteState> & { view: ViewId }) {
  const view = partial.view;
  let next: RouteState = { view };

  if (view === 'reader') {
    next = mergeReaderState(partial as Partial<RouteState> & { view: 'reader' });
  } else if (view === 'tracks') {
    next.trackId = partial.trackId ?? 'bible66';
    if (partial.bookId) next.bookId = partial.bookId;
    if (partial.themeId) next.themeId = partial.themeId;
  } else if (view === 'help') {
    next.help = partial.help ?? 'how';
  }

  current = next;
  syncUrl(current);
  listeners.forEach((fn) => fn({ ...current }));
}

export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function initRouter() {
  current = parseHash();
  window.addEventListener('hashchange', () => {
    current = parseHash();
    listeners.forEach((fn) => fn({ ...current }));
  });
  window.addEventListener('popstate', () => {
    current = parseHash();
    listeners.forEach((fn) => fn({ ...current }));
  });
  syncUrl(current);
  listeners.forEach((fn) => fn({ ...current }));
}

export { readerContextFromUnit };
