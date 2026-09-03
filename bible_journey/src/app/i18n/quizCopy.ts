import type { Locale } from '../contract/routeState';
import type { TrackId } from '../tracks/catalog';

export type QuizOption = { id: string; emoji: string; label: string };

export type QuizStep = {
  id: string;
  question: string;
  options: QuizOption[];
};

export type QuizPack = {
  banner: string;
  title: string;
  stepOf: (n: number, total: number) => string;
  resultTitle: string;
  resultLead: (trackName: string) => string;
  startTrack: string;
  close: string;
  skip: string;
  steps: [QuizStep, QuizStep, QuizStep];
  trackNames: Record<TrackId, string>;
};

const PACKS: Record<Locale, QuizPack> = {
  'zh-Hant': {
    banner: '🔮 15 秒測出你的專屬聖經賽道',
    title: '跑道小測驗',
    stepOf: (n, total) => `第 ${n} / ${total} 題`,
    resultTitle: '鑑定完成！',
    resultLead: (name) => `你適合「${name}」——系統已為你標記專屬跑道！`,
    startTrack: '立刻開跑',
    close: '關閉',
    skip: '跳過測驗',
    trackNames: {
      '30day': '故事小火車',
      golden: '星星奪寶賽',
      theme: '主題副本',
      bible66: '探險大地圖',
    },
    steps: [
      {
        id: 'lang',
        question: '你想用哪種語言冒險？',
        options: [
          { id: 'zh-Hant', emoji: '🇹🇼', label: '中文' },
          { id: 'en', emoji: '🇺🇸', label: 'English' },
          { id: 'vi', emoji: '🇻🇳', label: 'Tiếng Việt' },
          { id: 'id', emoji: '🇮🇩', label: 'Indonesia' },
        ],
      },
      {
        id: 'familiar',
        question: '你對聖經有多熟悉？',
        options: [
          { id: 'egg', emoji: '🥚', label: '像雞蛋—剛開始' },
          { id: 'compass', emoji: '🧭', label: '像羅盤—聽過一些' },
          { id: 'sword', emoji: '⚔️', label: '像聖劍—我很熟了' },
        ],
      },
      {
        id: 'interest',
        question: '今天想探索什麼？',
        options: [
          { id: 'crown', emoji: '👑', label: '大衛王的勇氣' },
          { id: 'whale', emoji: '🐳', label: '約拿的海怪冒險' },
          { id: 'bulb', emoji: '💡', label: '聰明人的智慧' },
        ],
      },
    ],
  },
  en: {
    banner: '🔮 Find your Bible track in 15 sec',
    title: 'Track quiz',
    stepOf: (n, total) => `Question ${n} / ${total}`,
    resultTitle: 'All set!',
    resultLead: (name) => `You're a great fit for "${name}"—we marked your track!`,
    startTrack: 'Start now',
    close: 'Close',
    skip: 'Skip quiz',
    trackNames: {
      '30day': 'Story Train',
      golden: 'Star Hunt',
      theme: 'Theme Quest',
      bible66: 'Explorer Map',
    },
    steps: [
      {
        id: 'lang',
        question: 'Which language for your adventure?',
        options: [
          { id: 'zh-Hant', emoji: '🇹🇼', label: '中文' },
          { id: 'en', emoji: '🇺🇸', label: 'English' },
          { id: 'vi', emoji: '🇻🇳', label: 'Tiếng Việt' },
          { id: 'id', emoji: '🇮🇩', label: 'Indonesia' },
        ],
      },
      {
        id: 'familiar',
        question: 'How well do you know the Bible?',
        options: [
          { id: 'egg', emoji: '🥚', label: 'Egg—just starting' },
          { id: 'compass', emoji: '🧭', label: 'Compass—heard some stories' },
          { id: 'sword', emoji: '⚔️', label: 'Sword—I know a lot' },
        ],
      },
      {
        id: 'interest',
        question: 'What do you want to explore today?',
        options: [
          { id: 'crown', emoji: '👑', label: "David's courage" },
          { id: 'whale', emoji: '🐳', label: "Jonah's sea adventure" },
          { id: 'bulb', emoji: '💡', label: 'Wise sayings' },
        ],
      },
    ],
  },
  vi: {
    banner: '🔮 15 giây tìm lộ trình riêng',
    title: 'Quiz lộ trình',
    stepOf: (n, total) => `Câu ${n} / ${total}`,
    resultTitle: 'Xong rồi!',
    resultLead: (name) => `Bạn hợp với "${name}"—đã đánh dấu lộ trình!`,
    startTrack: 'Chạy ngay',
    close: 'Đóng',
    skip: 'Bỏ qua quiz',
    trackNames: {
      '30day': 'Tàu chuyện',
      golden: 'Săn sao',
      theme: 'Nhiệm vụ chủ đề',
      bible66: 'Bản đồ thám hiểm',
    },
    steps: [
      {
        id: 'lang',
        question: 'Bạn muốn phiêu lưu bằng ngôn ngữ nào?',
        options: [
          { id: 'zh-Hant', emoji: '🇹🇼', label: '中文' },
          { id: 'en', emoji: '🇺🇸', label: 'English' },
          { id: 'vi', emoji: '🇻🇳', label: 'Tiếng Việt' },
          { id: 'id', emoji: '🇮🇩', label: 'Indonesia' },
        ],
      },
      {
        id: 'familiar',
        question: 'Bạn quen Kinh Thánh đến mức nào?',
        options: [
          { id: 'egg', emoji: '🥚', label: 'Trứng—mới bắt đầu' },
          { id: 'compass', emoji: '🧭', label: 'La bàn—đã nghe vài câu' },
          { id: 'sword', emoji: '⚔️', label: 'Kiếm—rất quen' },
        ],
      },
      {
        id: 'interest',
        question: 'Hôm nay muốn khám phá gì?',
        options: [
          { id: 'crown', emoji: '👑', label: 'Lòng dũng cảm Đa-vít' },
          { id: 'whale', emoji: '🐳', label: 'Phiêu lưu Giô-na' },
          { id: 'bulb', emoji: '💡', label: 'Sự khôn ngoan' },
        ],
      },
    ],
  },
  id: {
    banner: '🔮 15 detik temukan jalur Anda',
    title: 'Kuis jalur',
    stepOf: (n, total) => `Soal ${n} / ${total}`,
    resultTitle: 'Selesai!',
    resultLead: (name) => `Cocok untuk "${name}"—jalur sudah ditandai!`,
    startTrack: 'Mulai sekarang',
    close: 'Tutup',
    skip: 'Lewati kuis',
    trackNames: {
      '30day': 'Kereta cerita',
      golden: 'Berburu bintang',
      theme: 'Misi tema',
      bible66: 'Peta penjelajah',
    },
    steps: [
      {
        id: 'lang',
        question: 'Bahasa petualanganmu?',
        options: [
          { id: 'zh-Hant', emoji: '🇹🇼', label: '中文' },
          { id: 'en', emoji: '🇺🇸', label: 'English' },
          { id: 'vi', emoji: '🇻🇳', label: 'Tiếng Việt' },
          { id: 'id', emoji: '🇮🇩', label: 'Indonesia' },
        ],
      },
      {
        id: 'familiar',
        question: 'Seberapa kenal Alkitabmu?',
        options: [
          { id: 'egg', emoji: '🥚', label: 'Telur—baru mulai' },
          { id: 'compass', emoji: '🧭', label: 'Kompas—pernah dengar' },
          { id: 'sword', emoji: '⚔️', label: 'Pedang—sudah mahir' },
        ],
      },
      {
        id: 'interest',
        question: 'Mau jelajahi apa hari ini?',
        options: [
          { id: 'crown', emoji: '👑', label: 'Keberanian Daud' },
          { id: 'whale', emoji: '🐳', label: 'Petualangan Yunus' },
          { id: 'bulb', emoji: '💡', label: 'Kebijaksanaan' },
        ],
      },
    ],
  },
};

export function quizCopy(locale: Locale): QuizPack {
  return PACKS[locale] || PACKS['zh-Hant'];
}

/** 依三題答案計分推薦跑道 */
export function recommendTrackFromQuiz(answers: {
  familiar?: string;
  interest?: string;
}): TrackId {
  const scores: Record<TrackId, number> = { '30day': 0, golden: 0, theme: 0, bible66: 0 };
  const f = answers.familiar;
  if (f === 'egg') scores['30day'] += 3;
  if (f === 'compass') scores.theme += 3;
  if (f === 'sword') scores.bible66 += 3;
  const i = answers.interest;
  if (i === 'crown') scores.theme += 2;
  if (i === 'whale') scores['30day'] += 2;
  if (i === 'bulb') scores.golden += 3;
  let best: TrackId = '30day';
  let max = -1;
  for (const id of ['30day', 'golden', 'theme', 'bible66'] as TrackId[]) {
    if (scores[id] > max) {
      max = scores[id];
      best = id;
    }
  }
  const tied = (['30day', 'golden', 'theme', 'bible66'] as TrackId[]).filter((id) => scores[id] === max);
  if (tied.length > 1 && f) {
    const familiarPick: TrackId =
      f === 'egg' ? '30day' : f === 'compass' ? 'theme' : f === 'sword' ? 'bible66' : best;
    if (tied.includes(familiarPick)) return familiarPick;
  }
  return best;
}
