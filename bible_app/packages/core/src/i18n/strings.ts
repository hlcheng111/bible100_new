import type { Locale } from '../types';

type StringKey =
  | 'appTitle'
  | 'welcome'
  | 'signIn'
  | 'guestMode'
  | 'tracks'
  | 'settings'
  | 'markComplete'
  | 'progress'
  | 'bilingual'
  | 'copyPrompt'
  | 'signOut'
  | 'churchDashboard'
  | 'syncReading'
  | 'qna'
  | 'childMode'
  | 'parentView';

const STRINGS: Record<StringKey, Record<Locale, string>> = {
  appTitle: {
    'zh-Hant': '聖經讀經',
    en: 'Bible Reading',
    vi: 'Đọc Kinh Thánh',
    id: 'Baca Alkitab',
  },
  welcome: {
    'zh-Hant': '歡迎開始讀經旅程',
    en: 'Welcome to your reading journey',
    vi: 'Chào mừng hành trình đọc Kinh Thánh',
    id: 'Selamat datang di perjalanan membaca',
  },
  signIn: { 'zh-Hant': '登入', en: 'Sign in', vi: 'Đăng nhập', id: 'Masuk' },
  guestMode: { 'zh-Hant': '訪客模式', en: 'Guest mode', vi: 'Khách', id: 'Tamu' },
  tracks: { 'zh-Hant': '讀經跑道', en: 'Reading tracks', vi: 'Lộ trình', id: 'Jalur baca' },
  settings: { 'zh-Hant': '設定', en: 'Settings', vi: 'Cài đặt', id: 'Pengaturan' },
  markComplete: { 'zh-Hant': '標記完成', en: 'Mark complete', vi: 'Hoàn thành', id: 'Selesai' },
  progress: { 'zh-Hant': '進度', en: 'Progress', vi: 'Tiến độ', id: 'Kemajuan' },
  bilingual: { 'zh-Hant': '雙語並排', en: 'Bilingual view', vi: 'Song ngữ', id: 'Dwibahasa' },
  copyPrompt: { 'zh-Hant': '複製 Prompt', en: 'Copy prompt', vi: 'Sao chép prompt', id: 'Salin prompt' },
  signOut: { 'zh-Hant': '登出', en: 'Sign out', vi: 'Đăng xuất', id: 'Keluar' },
  churchDashboard: { 'zh-Hant': '教會儀表板', en: 'Church dashboard', vi: 'Bảng hội thánh', id: 'Dasbor gereja' },
  syncReading: { 'zh-Hant': '小組共讀', en: 'Group sync reading', vi: 'Đọc nhóm', id: 'Baca bersama' },
  qna: { 'zh-Hant': '讀經問答', en: 'Q&A', vi: 'Hỏi đáp', id: 'Tanya jawab' },
  childMode: { 'zh-Hant': '兒童模式', en: 'Kids mode', vi: 'Trẻ em', id: 'Anak' },
  parentView: { 'zh-Hant': '家長檢視', en: 'Parent view', vi: 'Phụ huynh', id: 'Orang tua' },
};

export function t(key: StringKey, locale: Locale): string {
  return STRINGS[key][locale] || STRINGS[key].en;
}
