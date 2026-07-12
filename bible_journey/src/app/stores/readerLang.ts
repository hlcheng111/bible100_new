import type { Locale } from '../router';

export type ReaderLang = 'zh' | 'en' | 'vi' | 'id';

const KEY = 'bible_journey_reader_langs';
const ALL: ReaderLang[] = ['zh', 'en', 'vi', 'id'];

const LOCALE_TO_READER: Record<Locale, ReaderLang> = {
  'zh-Hant': 'zh',
  en: 'en',
  vi: 'vi',
  id: 'id',
};

let visible = new Set<ReaderLang>(ALL);
const listeners = new Set<() => void>();

function load(): Set<ReaderLang> {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const arr = JSON.parse(raw) as ReaderLang[];
      const set = new Set(arr.filter((x) => ALL.includes(x)));
      if (set.size > 0) return set;
    }
  } catch {
    /* ignore */
  }
  return new Set(ALL);
}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify([...visible]));
  } catch {
    /* ignore */
  }
}

function applyDom() {
  const root = document.documentElement;
  for (const lang of ALL) {
    root.classList.toggle(`bj-show-${lang}`, visible.has(lang));
  }
}

export function readerLangFromLocale(locale: Locale): ReaderLang {
  return LOCALE_TO_READER[locale];
}

export function localeFromReaderLang(lang: ReaderLang): Locale {
  if (lang === 'zh') return 'zh-Hant';
  return lang;
}

export function isReaderLangVisible(lang: ReaderLang): boolean {
  return visible.has(lang);
}

export function getVisibleReaderLangs(): ReaderLang[] {
  return ALL.filter((l) => visible.has(l));
}

export function toggleReaderLang(lang: ReaderLang) {
  if (visible.has(lang) && visible.size <= 1) return;
  if (visible.has(lang)) visible.delete(lang);
  else visible.add(lang);
  save();
  applyDom();
  listeners.forEach((fn) => fn());
}

export function setReaderLangVisible(lang: ReaderLang, on: boolean) {
  if (!on && visible.size <= 1 && visible.has(lang)) return;
  if (on) visible.add(lang);
  else visible.delete(lang);
  save();
  applyDom();
  listeners.forEach((fn) => fn());
}

export function subscribeReaderLang(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function initReaderLang() {
  visible = load();
  applyDom();
}
