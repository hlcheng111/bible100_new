export type Locale = 'zh-Hant' | 'en' | 'vi' | 'id';

export type ViewId =
  | 'home'
  | 'today'
  | 'reader'
  | 'tracks'
  | 'squad'
  | 'qna'
  | 'mentor'
  | 'help';

export type TrackId = 'bible66' | '30day' | 'golden' | 'theme';

export interface RouteState {
  view: ViewId;
  bookId?: number;
  chapter?: number;
  help?: 'what' | 'how' | 'why';
  trackId?: TrackId;
}

type Listener = (route: RouteState) => void;

const DEFAULT: RouteState = { view: 'home' };

let current: RouteState = { ...DEFAULT };
const listeners = new Set<Listener>();

function parseHash(): RouteState {
  const raw = (location.hash || '#home').replace(/^#/, '');
  const [view, ...rest] = raw.split('/');
  const valid: ViewId[] = ['home', 'today', 'reader', 'tracks', 'squad', 'qna', 'mentor', 'help'];
  if (!valid.includes(view as ViewId)) return { ...DEFAULT };
  const route: RouteState = { view: view as ViewId };
  if (view === 'reader' && rest[0]) {
    const [b, c] = rest[0].split('-').map(Number);
    if (b && c) {
      route.bookId = b;
      route.chapter = c;
    }
  }
  if (view === 'help' && rest[0]) {
    const h = rest[0] as RouteState['help'];
    if (h === 'what' || h === 'how' || h === 'why') route.help = h;
  }
  if (view === 'tracks' && rest[0]) {
    const tid = rest[0] as RouteState['trackId'];
    if (tid === 'bible66' || tid === '30day' || tid === 'golden' || tid === 'theme') {
      route.trackId = tid;
    }
    const pickBook = Number(rest[1]);
    if (pickBook >= 1 && pickBook <= 66) route.bookId = pickBook;
  }
  return route;
}

function syncHash(route: RouteState) {
  let hash = route.view;
  if (route.view === 'reader' && route.bookId && route.chapter) {
    hash += `/${route.bookId}-${route.chapter}`;
  }
  if (route.view === 'help' && route.help) {
    hash += `/${route.help}`;
  }
  if (route.view === 'tracks' && route.trackId) {
    hash += `/${route.trackId}`;
    if (route.bookId) hash += `/${route.bookId}`;
  }
  if (location.hash !== `#${hash}`) {
    history.replaceState(route, '', `#${hash}`);
  }
}

export function getRoute(): RouteState {
  return { ...current };
}

export function navigate(partial: Partial<RouteState> & { view: ViewId }) {
  const view = partial.view;
  const next: RouteState = { view };

  if (view === 'reader') {
    next.bookId = partial.bookId ?? 1;
    next.chapter = partial.chapter ?? 1;
    if (partial.trackId) next.trackId = partial.trackId;
  } else if (view === 'tracks') {
    next.trackId = partial.trackId ?? 'bible66';
    if (partial.bookId) next.bookId = partial.bookId;
  } else if (view === 'help') {
    next.help = partial.help ?? 'how';
  }

  current = next;
  syncHash(current);
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
  syncHash(current);
  listeners.forEach((fn) => fn({ ...current }));
}
