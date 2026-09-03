import type { Locale } from '../contract/routeState';
import type { TrackId } from '../tracks/catalog';

export type PlayfulTrackMeta = {
  title: string;
  audience: string;
  time: string;
  blurb: string;
  cta: string;
  /** 難度視覺長度（時長比例尺），非讀經進度 */
  scalePct: number;
};

export type PlayfulPack = {
  hudRunner: string;
  hudDefaultName: string;
  nicknameBanner: string;
  nicknamePlaceholder: string;
  nicknameSave: string;
  nicknameLater: string;
  mapTitle: string;
  mapHint: string;
  squadOnTrack: string;
  switchClassic: string;
  startStation: string;
  finishStation: string;
  trackPlayful: Record<TrackId, PlayfulTrackMeta>;
};

const PACKS: Record<Locale, PlayfulPack> = {
  'zh-Hant': {
    hudRunner: '車手',
    hudDefaultName: '小跑者',
    nicknameBanner: '嗨！小勇士，給你的賽車起個名字吧！',
    nicknamePlaceholder: '輸入暱稱…',
    nicknameSave: '出發！',
    nicknameLater: '稍後再說',
    mapTitle: '選一條適合你的賽道',
    mapHint: '賽道愈短愈輕鬆——看長度就知道要花多少力氣！',
    squadOnTrack: '同場車手',
    switchClassic: '切換成人介面',
    startStation: 'START',
    finishStation: '🏁 終點',
    trackPlayful: {
      golden: {
        title: '⭐ 迷你賽道：100 金句',
        audience: '👶 兒童／親子',
        time: '⏱️ 每天約 10 秒',
        blurb: '翻金幣拿星星',
        cta: '🚀 我要玩這個',
        scalePct: 40,
      },
      '30day': {
        title: '🌱 短跑賽道：30 日計畫',
        audience: '🌱 初信推薦',
        time: '⏱️ 每天約 5 分鐘',
        blurb: '聖經大故事一站一站走',
        cta: '🏃 我選這條路',
        scalePct: 60,
      },
      theme: {
        title: '💛 按心情找經文',
        audience: '💜 心裡有事時',
        time: '⏱️ 每關約 5 分鐘',
        blurb: '選最接近你心情的一條慢慢讀',
        cta: '💛 我選這條',
        scalePct: 80,
      },
      bible66: {
        title: '⛰️ 終極馬拉松：66 卷',
        audience: '👑 資深／終極',
        time: '⏱️ 無盡挑戰',
        blurb: '一生必讀的旅程',
        cta: '👑 挑戰大師路',
        scalePct: 100,
      },
    },
  },
  en: {
    hudRunner: 'Racer',
    hudDefaultName: 'Runner',
    nicknameBanner: 'Hey champ—name your race car!',
    nicknamePlaceholder: 'Nickname…',
    nicknameSave: 'Go!',
    nicknameLater: 'Later',
    mapTitle: 'Pick a track that fits you',
    mapHint: 'Shorter track = easier start. Length shows the commitment.',
    squadOnTrack: 'Racers nearby',
    switchClassic: 'Switch to adult UI',
    startStation: 'START',
    finishStation: '🏁 Finish',
    trackPlayful: {
      golden: {
        title: '⭐ Mini: Golden Verses',
        audience: '👶 Kids / family',
        time: '⏱️ ~10 sec / day',
        blurb: 'Flip cards, collect stars',
        cta: '🚀 Play this',
        scalePct: 40,
      },
      '30day': {
        title: '🌱 Sprint: 30-Day Plan',
        audience: '🌱 New believers',
        time: '⏱️ ~5 min / day',
        blurb: 'The big Bible story',
        cta: '🏃 Pick this path',
        scalePct: 60,
      },
      theme: {
        title: '💡 Quest: Themes',
        audience: '💡 Seekers',
        time: '⏱️ Flexible',
        blurb: 'Wisdom & courage stories',
        cta: '🚪 Enter quest',
        scalePct: 80,
      },
      bible66: {
        title: '⛰️ Marathon: 66 Books',
        audience: '👑 Mature / ultimate',
        time: '⏱️ Endless',
        blurb: 'A lifetime journey',
        cta: '👑 Challenge it',
        scalePct: 100,
      },
    },
  },
  vi: {
    hudRunner: 'Tay đua',
    hudDefaultName: 'Bé chạy',
    nicknameBanner: 'Chào nhóc—đặt tên xe đua nhé!',
    nicknamePlaceholder: 'Biệt danh…',
    nicknameSave: 'Đi thôi!',
    nicknameLater: 'Để sau',
    mapTitle: 'Chọn lộ trình phù hợp',
    mapHint: 'Đường càng ngắn càng dễ—độ dài cho biết độ khó!',
    squadOnTrack: 'Tay đua cùng đường',
    switchClassic: 'Giao diện người lớn',
    startStation: 'START',
    finishStation: '🏁 Đích',
    trackPlayful: {
      golden: {
        title: '⭐ Mini: 100 câu vàng',
        audience: '👶 Trẻ em / gia đình',
        time: '⏱️ ~10 giây/ngày',
        blurb: 'Lật thẻ, hái sao',
        cta: '🚀 Chơi cái này',
        scalePct: 40,
      },
      '30day': {
        title: '🌱 Chạy ngắn: 30 ngày',
        audience: '🌱 Tân tín',
        time: '⏱️ ~5 phút/ngày',
        blurb: 'Câu chuyện lớn Kinh Thánh',
        cta: '🏃 Chọn đường này',
        scalePct: 60,
      },
      theme: {
        title: '💡 Phiêu lưu: Chủ đề',
        audience: '💡 Khám phá',
        time: '⏱️ Linh hoạt',
        blurb: 'Khôn ngoan & dũng cảm',
        cta: '🚪 Vào nhiệm vụ',
        scalePct: 80,
      },
      bible66: {
        title: '⛰️ Marathon: 66 sách',
        audience: '👑 Thành thạo',
        time: '⏱️ Vô tận',
        blurb: 'Hành trình cả đời',
        cta: '👑 Thách thức',
        scalePct: 100,
      },
    },
  },
  id: {
    hudRunner: 'Pembalap',
    hudDefaultName: 'Pelari',
    nicknameBanner: 'Hai juara—beri nama mobil balapmu!',
    nicknamePlaceholder: 'Nama panggilan…',
    nicknameSave: 'Mulai!',
    nicknameLater: 'Nanti',
    mapTitle: 'Pilih jalur yang cocok',
    mapHint: 'Jalur lebih pendek = lebih mudah. Panjang = tingkat tantangan.',
    squadOnTrack: 'Pembalap lain',
    switchClassic: 'UI dewasa',
    startStation: 'START',
    finishStation: '🏁 Finish',
    trackPlayful: {
      golden: {
        title: '⭐ Mini: Ayat Emas',
        audience: '👶 Anak / keluarga',
        time: '⏱️ ~10 dtk/hari',
        blurb: 'Balik kartu, kumpulkan bintang',
        cta: '🚀 Main ini',
        scalePct: 40,
      },
      '30day': {
        title: '🌱 Sprint: 30 Hari',
        audience: '🌱 Orang baru',
        time: '⏱️ ~5 mnt/hari',
        blurb: 'Kisah besar Alkitab',
        cta: '🏃 Pilih jalur ini',
        scalePct: 60,
      },
      theme: {
        title: '💡 Petualangan: Tema',
        audience: '💡 Pencari',
        time: '⏱️ Fleksibel',
        blurb: 'Hikmat & keberanian',
        cta: '🚪 Masuk misi',
        scalePct: 80,
      },
      bible66: {
        title: '⛰️ Marathon: 66 Kitab',
        audience: '👑 Dewasa / ultimate',
        time: '⏱️ Tanpa akhir',
        blurb: 'Perjalanan seumur hidup',
        cta: '👑 Tantang',
        scalePct: 100,
      },
    },
  },
};

export function playfulCopy(locale: Locale): PlayfulPack {
  return PACKS[locale] || PACKS['zh-Hant'];
}

/** Playful 難度階梯：短→長（金句 → 30日 → 主題 → 66卷） */
export const PLAYFUL_TRACK_ORDER: TrackId[] = ['golden', '30day', 'theme', 'bible66'];

export const DEMO_RACERS = [
  { name: '小明', day: 4, emoji: '🏎️' },
  { name: '阿花', day: 2, emoji: '🚗' },
  { name: 'David', day: 3, emoji: '🏁' },
];
