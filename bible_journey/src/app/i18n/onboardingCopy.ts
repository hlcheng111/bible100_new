import type { Locale } from '../contract/routeState';

export type OnboardingPack = {
  title: string;
  lead: string;
  playful: string;
  playfulHint: string;
  classic: string;
  classicHint: string;
  skip: string;
  skipHint: string;
};

const PACKS: Record<Locale, OnboardingPack> = {
  'zh-Hant': {
    title: '歡迎來到聖經跑道',
    lead: '選一種進站方式——同一個 App，兩種體驗。',
    playful: '🎮 我要闖關玩',
    playfulHint: '兒童／青少年 · 星星、賽道、趣味測驗',
    classic: '📖 我是成人讀者',
    classicHint: '牧師／資深信徒 · 簡潔查經介面',
    skip: '🏠 先看首頁賽道',
    skipHint: '不讀經文，先看四條路再說',
  },
  en: {
    title: 'Welcome to Bible Journey',
    lead: 'Pick how you enter—one app, two experiences.',
    playful: '🎮 Play mode',
    playfulHint: 'Kids & youth · stars, tracks, fun quiz',
    classic: '📖 Adult reader',
    classicHint: 'Pastors & mature believers · clean UI',
    skip: '🏠 See tracks first',
    skipHint: 'Go home map—don\'t jump into reading',
  },
  vi: {
    title: 'Chào mừng đến Hành trình Kinh Thánh',
    lead: 'Chọn cách vào—một app, hai trải nghiệm.',
    playful: '🎮 Chơi phiêu lưu',
    playfulHint: 'Thiếu nhi · sao, đường đua, quiz vui',
    classic: '📖 Người lớn đọc',
    classicHint: 'Mục sư · giao diện gọn',
    skip: '🏠 Xem bản đồ trước',
    skipHint: 'Về trang chủ—không nhảy vào đọc ngay',
  },
  id: {
    title: 'Selamat datang di Perjalanan Alkitab',
    lead: 'Pilih cara masuk—satu app, dua pengalaman.',
    playful: '🎮 Mode petualangan',
    playfulHint: 'Anak & remaja · bintang, lintasan, kuis',
    classic: '📖 Pembaca dewasa',
    classicHint: 'Pendeta · UI ringkas',
    skip: '🏠 Lihat jalur dulu',
    skipHint: 'Ke beranda—jangan langsung baca',
  },
};

export function onboardingCopy(locale: Locale): OnboardingPack {
  return PACKS[locale] || PACKS['zh-Hant'];
}
