/**
 * 全域語系同步：介面語 + 讀經語（單語書頁）一致。
 * Ctrl／⌘＋點語言鈕＝加開對照語（不改介面語）。
 */
import type { Locale } from '../contract/routeState';
import { setLocale } from './locale';
import {
  localeFromReaderLang,
  readerLangFromLocale,
  setSoleReaderLang,
  setReaderLangVisible,
  type ReaderLang,
} from './readerLang';

/** 一鍵：介面＋經文同步為同一語（陪伴文案隨 getLocale 重繪） */
export function setPrimaryLanguage(lang: ReaderLang): void {
  setSoleReaderLang(lang);
  setLocale(localeFromReaderLang(lang));
}

/** 測驗／設定選 Locale 時同步讀經語 */
export function setLocaleAndSyncReader(locale: Locale): void {
  setSoleReaderLang(readerLangFromLocale(locale));
  setLocale(locale);
}

/** 加開對照語（不改 UI locale） */
export function addCompareReaderLang(lang: ReaderLang): void {
  setReaderLangVisible(lang, true);
}
