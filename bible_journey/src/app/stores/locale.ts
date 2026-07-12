import type { Locale } from '../router';

const KEY = 'bible_journey_locale';

let locale: Locale = 'zh-Hant';
const listeners = new Set<(l: Locale) => void>();

export function getLocale(): Locale {
  try {
    const s = localStorage.getItem(KEY) as Locale | null;
    if (s === 'zh-Hant' || s === 'en' || s === 'vi' || s === 'id') return s;
  } catch {
    /* ignore */
  }
  return locale;
}

export function setLocale(l: Locale) {
  locale = l;
  try {
    localStorage.setItem(KEY, l);
  } catch {
    /* ignore */
  }
  document.documentElement.lang = l === 'zh-Hant' ? 'zh-Hant' : l;
  listeners.forEach((fn) => fn(l));
}

export function subscribeLocale(fn: (l: Locale) => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function initLocale() {
  locale = getLocale();
  document.documentElement.lang = locale === 'zh-Hant' ? 'zh-Hant' : locale;
}
