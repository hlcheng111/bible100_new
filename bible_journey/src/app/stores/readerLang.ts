import type { Locale } from '../router';
import { getLocale } from './locale';

export type ReaderLang = 'zh' | 'en' | 'vi' | 'id';

const KEY = 'bible_journey_reader_langs';
const ALL: ReaderLang[] = ['zh', 'en', 'vi', 'id'];

const LOCALE_TO_READER: Record<Locale, ReaderLang> = {
  'zh-Hant': 'zh',
  en: 'en',
  vi: 'vi',
  id: 'id',
};

let visible = new Set<ReaderLang>(['zh']);
const listeners = new Set<() => void>();

function defaultSingleFromLocale(): Set<ReaderLang> {
  return new Set<ReaderLang>([readerLangFromLocale(getLocale())]);
}

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
  /** 新使用者預設單語書頁；≡ 可再加開對照 */
  return defaultSingleFromLocale();
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
  root.classList.toggle('bj-reader-single', visible.size === 1);
  root.classList.toggle('bj-reader-compare', visible.size > 1);
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

/** 只保留一種讀經語（書頁感；與介面語同步時用） */
export function setSoleReaderLang(lang: ReaderLang) {
  visible = new Set<ReaderLang>([lang]);
  save();
  applyDom();
  listeners.forEach((fn) => fn());
}

export function subscribeReaderLang(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function ensureAtLeastOneReaderLang(): void {
  if (visible.size > 0) {
    applyDom();
    return;
  }
  visible = defaultSingleFromLocale();
  save();
  applyDom();
  listeners.forEach((fn) => fn());
}

/**
 * 舊預設「四語全開」易造成標題／經文／陪伴混語。
 * 若儲存仍是四語全開 → 收斂為與 UI 語一致的單語。
 */
export function initReaderLang() {
  visible = load();
  if (visible.size >= 4) {
    visible = defaultSingleFromLocale();
    save();
  }
  ensureAtLeastOneReaderLang();
}
