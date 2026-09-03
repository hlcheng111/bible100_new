import type { Locale } from '../router';
import type { TrackId } from '../tracks/catalog';

export type AboutTrackRow = {
  id: TrackId;
  emoji: string;
  title: string;
  audience: string;
  time: string;
  body: string;
  cta: string;
};

export type AboutTracksPack = {
  title: string;
  lead: string;
  close: string;
  pasteNote: string;
  rows: AboutTrackRow[];
};

const PACKS: Record<Locale, AboutTracksPack> = {
  'zh-Hant': {
    title: '四條路線，選一條就開始',
    lead: '不用考試、不用完美。每天約 5 分鐘，幾天沒讀也歡迎回來。',
    close: '關閉',
    pasteNote: '讀完後如果想多問，可以複製一段提示去問 AI（可選）。',
    rows: [
      {
        id: '30day',
        emoji: '📅',
        title: '三十日計畫',
        audience: '最適合初信者',
        time: '每天約 5 分鐘',
        body: '30 天走過聖經大故事：創造、救贖、教會、新天新地。系統記住你讀到哪一天。',
        cta: '🏃 啟動 30 天挑戰',
      },
      {
        id: 'golden',
        emoji: '⭐',
        title: '100 金句',
        audience: '親子短讀',
        time: '每天 1 句 · 約 3 分鐘',
        body: '一天一句，精準單節。適合和孩子一起，慢慢把神的話記在心裡。',
        cta: '🎯 每日金句破關',
      },
      {
        id: 'theme',
        emoji: '🎯',
        title: '按心情找經文',
        audience: '心裡有事時',
        time: '每關約 5 分鐘',
        body: '例如「很難過、需要被安慰」或「站在分岔路」——選最接近你現在心情的一條，一關一關讀。',
        cta: '💛 按心情開始',
      },
      {
        id: 'bible66',
        emoji: '📜',
        title: '六十六卷',
        audience: '自由查經',
        time: '依章節自訂',
        body: '像地圖一樣選書卷、選章節。適合想按自己的節奏讀完整本聖經的人。',
        cta: '🧭 自由查經地圖',
      },
    ],
  },
  en: {
    title: 'Four tracks—pick one and go',
    lead: 'No exams, no guilt. About five minutes a day—welcome back anytime.',
    close: 'Close',
    pasteNote: 'After reading, copy a prompt and open AI mentor to paste your question.',
    rows: [
      {
        id: '30day',
        emoji: '📅',
        title: '30-Day Plan',
        audience: 'Best for new believers',
        time: '~5 min / day',
        body: '30 days through the big story. We remember which day you are on.',
        cta: '🏃 Start 30-day challenge',
      },
      {
        id: 'golden',
        emoji: '⭐',
        title: 'Golden Verses',
        audience: 'Family short reads',
        time: '1 verse · ~3 min',
        body: 'One verse a day—focused and memorable. Great with kids.',
        cta: '🎯 Daily golden verse',
      },
      {
        id: 'theme',
        emoji: '🎯',
        title: 'Thematic Reading',
        audience: 'Life themes',
        time: '~5 min / level',
        body: 'e.g. Wisdom for Life—start at Proverbs 3, level by level.',
        cta: '💡 Explore wisdom theme',
      },
      {
        id: 'bible66',
        emoji: '📜',
        title: '66 Books',
        audience: 'Free exploration',
        time: 'Your own pace',
        body: 'Pick any book and chapter—read the Bible your way.',
        cta: '🧭 Open Bible map',
      },
    ],
  },
  vi: {
    title: 'Bốn lộ trình—chọn một và bắt đầu',
    lead: 'Không thi, không ép. Khoảng 5 phút mỗi ngày—chào mừng trở lại.',
    close: 'Đóng',
    pasteNote: 'Sau khi đọc, sao chép gợi ý và mở cửa AI để dán câu hỏi.',
    rows: [
      {
        id: '30day',
        emoji: '📅',
        title: 'Kế hoạch 30 ngày',
        audience: 'Tốt cho tân tín',
        time: '~5 phút/ngày',
        body: '30 ngày theo câu chuyện lớn. Hệ thống nhớ ngày bạn đang ở.',
        cta: '🏃 Bắt đầu thử thách 30 ngày',
      },
      {
        id: 'golden',
        emoji: '⭐',
        title: 'Câu vàng',
        audience: 'Đọc gia đình',
        time: '1 câu · ~3 phút',
        body: 'Mỗi ngày một câu—ngắn gọn, dễ nhớ. Phù hợp với trẻ em.',
        cta: '🎯 Câu vàng hôm nay',
      },
      {
        id: 'theme',
        emoji: '🎯',
        title: 'Đọc theo chủ đề',
        audience: 'Chủ đề cuộc sống',
        time: '~5 phút/màn',
        body: 'Ví dụ Trí tuệ đời sống—bắt đầu từ Châm ngôn 3, từng màn một.',
        cta: '💡 Khám phá chủ đề trí tuệ',
      },
      {
        id: 'bible66',
        emoji: '📜',
        title: '66 sách',
        audience: 'Tự do khám phá',
        time: 'Tự chọn nhịp',
        body: 'Chọn sách và chương—đọc theo cách của bạn.',
        cta: '🧭 Bản đồ Kinh Thánh',
      },
    ],
  },
  id: {
    title: 'Empat jalur—pilih satu dan mulai',
    lead: 'Tanpa ujian, tanpa rasa bersalah. Sekitar 5 menit sehari—selamat datang kembali.',
    close: 'Tutup',
    pasteNote: 'Setelah baca, salin prompt dan buka mentor AI untuk menempel pertanyaan.',
    rows: [
      {
        id: '30day',
        emoji: '📅',
        title: 'Rencana 30 Hari',
        audience: 'Cocok untuk yang baru percaya',
        time: '~5 menit/hari',
        body: '30 hari kisah besar. Kami ingat hari ke berapa Anda berada.',
        cta: '🏃 Mulai tantangan 30 hari',
      },
      {
        id: 'golden',
        emoji: '⭐',
        title: 'Ayat emas',
        audience: 'Bacaan keluarga',
        time: '1 ayat · ~3 menit',
        body: 'Satu ayat sehari—fokus dan mudah diingat. Bagus untuk anak-anak.',
        cta: '🎯 Ayat emas hari ini',
      },
      {
        id: 'theme',
        emoji: '🎯',
        title: 'Bacaan bertema',
        audience: 'Tema kehidupan',
        time: '~5 menit/level',
        body: 'Mis. Hidup Bijak—mulai dari Amsal 3, level demi level.',
        cta: '💡 Jelajahi tema hikmat',
      },
      {
        id: 'bible66',
        emoji: '📜',
        title: '66 Kitab',
        audience: 'Eksplorasi bebas',
        time: 'Ritme sendiri',
        body: 'Pilih kitab dan pasal—baca Alkitab dengan cara Anda.',
        cta: '🧭 Peta Alkitab',
      },
    ],
  },
};

export function getAboutTracksContent(locale: Locale): AboutTracksPack {
  return PACKS[locale] || PACKS['zh-Hant'];
}

export function trackCtaCopy(locale: Locale, trackId: TrackId): string {
  const pack = getAboutTracksContent(locale);
  return pack.rows.find((r) => r.id === trackId)?.cta || pack.rows[0].cta;
}
