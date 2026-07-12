import type { Locale } from '../router';

export type HelpKind = 'what' | 'how' | 'why';

type Step = { icon: string; title: string; text: string };

type HelpPack = {
  title: string;
  lead: string;
  sections: { heading: string; body: string; bullets?: string[] }[];
  steps?: Step[];
  cta: string;
};

const WHAT: Record<Locale, HelpPack> = {
  'zh-Hant': {
    title: '這是什麼？',
    lead: '聖經跑道陪你每天約 5 分鐘讀經——不考勤、不考試、不內疚。',
    sections: [
      {
        heading: '每天四步',
        body: '今日關卡 → 讀經 → 打卡 → 偶爾看看同跑隊伍。系統幫你選好經段，你不用自己找書卷章節。',
      },
      {
        heading: '四條跑道',
        body: '依你的節奏選路線：',
        bullets: ['📜 六十六卷 — 全本探索', '📅 三十日 — 初信者大故事', '⭐ 100金句 — 親子短讀', '🎯 主題讀經 — 按主題走'],
      },
      {
        heading: '四語並排',
        body: '繁中、英文、越文、印尼文可同時顯示；頂欄按鈕可切換要看的語言。',
      },
    ],
    cta: '開始今日關卡 →',
  },
  en: {
    title: 'What is this?',
    lead: 'Bible Journey — about five minutes a day. No roll call, no exams, no guilt.',
    sections: [
      { heading: 'Four steps', body: 'Today → Read → Check in → Squad peek. We pick the passage for you.' },
      {
        heading: 'Four tracks',
        body: 'Pick your path:',
        bullets: ['📜 66 Books', '📅 30 Days', '⭐ Golden Verses', '🎯 Thematic'],
      },
      { heading: 'Four languages', body: 'ZH, EN, VI, ID side by side. Toggle languages in the top bar.' },
    ],
    cta: 'Start Today →',
  },
  vi: {
    title: 'Đây là gì?',
    lead: 'Hành trình Kinh Thánh — khoảng 5 phút mỗi ngày. Không điểm danh, không thi.',
    sections: [
      { heading: 'Bốn bước', body: 'Hôm nay → Đọc → Check-in → Đội chạy.' },
      {
        heading: 'Bốn lộ trình',
        body: 'Chọn con đường:',
        bullets: ['📜 66 sách', '📅 30 ngày', '⭐ Câu vàng', '🎯 Chủ đề'],
      },
      { heading: 'Bốn ngôn ngữ', body: 'Song song Trung, Anh, Việt, Indonesia.' },
    ],
    cta: 'Bắt đầu hôm nay →',
  },
  id: {
    title: 'Apa ini?',
    lead: 'Perjalanan Alkitab — sekitar 5 menit sehari. Tanpa absensi, tanpa ujian.',
    sections: [
      { heading: 'Empat langkah', body: 'Hari ini → Baca → Check-in → Tim lari.' },
      {
        heading: 'Empat jalur',
        body: 'Pilih jalur:',
        bullets: ['📜 66 Kitab', '📅 30 Hari', '⭐ Ayat emas', '🎯 Bertema'],
      },
      { heading: 'Empat bahasa', body: 'CN, EN, VI, ID berdampingan.' },
    ],
    cta: 'Mulai hari ini →',
  },
};

const HOW: Record<Locale, HelpPack> = {
  'zh-Hant': {
    title: '怎麼用？',
    lead: '像朋友帶你走一遍，只要幾分鐘。',
    steps: [
      { icon: '☀️', title: '點「今日關卡」', text: '每天約 5 分鐘，系統選好經段。' },
      { icon: '📖', title: '讀四語經文', text: '每節獨立區塊，節數醒目標示。' },
      { icon: '✅', title: '讀完打卡', text: '領一句應用與短禱告（下一版）。' },
      { icon: '🤝', title: '同跑隊伍', text: '偶爾看看，知道還有人在陪你。' },
    ],
    sections: [
      {
        heading: '斷更了？沒關係',
        body: '這不是考勤。忙了好幾天？直接點今日關卡，從今天重新出發就好。',
      },
      {
        heading: '頂欄工具',
        body: '中/EN/VI/ID 切換顯示語言；A−/A/A+ 調整字級。',
      },
    ],
    cta: '去今日關卡 →',
  },
  en: {
    title: 'How to use',
    lead: 'A quick walkthrough — a few minutes a day.',
    steps: [
      { icon: '☀️', title: 'Tap Today', text: '~5 min; we pick the passage.' },
      { icon: '📖', title: 'Read quad text', text: 'Each verse in its own block.' },
      { icon: '✅', title: 'Check in', text: 'Mark today when done.' },
      { icon: '🤝', title: 'Squad', text: 'Peek sometimes — you\'re not alone.' },
    ],
    sections: [
      { heading: 'Missed days?', body: 'No penalty. Tap Today and start fresh.' },
      { heading: 'Top bar', body: 'Toggle languages and font size.' },
    ],
    cta: 'Go to Today →',
  },
  vi: {
    title: 'Cách dùng',
    lead: 'Vài phút mỗi ngày là đủ.',
    steps: [
      { icon: '☀️', title: 'Bấm Hôm nay', text: 'Hệ thống chọn đoạn Kinh.' },
      { icon: '📖', title: 'Đọc bốn ngôn ngữ', text: 'Mỗi câu một khối riêng.' },
      { icon: '✅', title: 'Check-in', text: 'Đánh dấu khi xong.' },
      { icon: '🤝', title: 'Đội chạy', text: 'Thỉnh thoảng xem.' },
    ],
    sections: [{ heading: 'Quên ngày?', body: 'Không sao. Bấm Hôm nay là được.' }],
    cta: 'Đến Hôm nay →',
  },
  id: {
    title: 'Cara pakai',
    lead: 'Beberapa menit sehari sudah cukup.',
    steps: [
      { icon: '☀️', title: 'Ketuk Hari ini', text: 'Kami pilih bacaan.' },
      { icon: '📖', title: 'Baca empat bahasa', text: 'Setiap ayat dalam blok sendiri.' },
      { icon: '✅', title: 'Check-in', text: 'Tandai saat selesai.' },
      { icon: '🤝', title: 'Tim lari', text: 'Sesekali lihat.' },
    ],
    sections: [{ heading: 'Terlewat?', body: 'Tidak masalah. Ketuk Hari ini.' }],
    cta: 'Ke Hari ini →',
  },
};

const WHY: Record<Locale, HelpPack> = {
  'zh-Hant': {
    title: '為什麼做？',
    lead: '開心長跑、你跑我追、跨代同行。',
    sections: [
      {
        heading: '我們的承諾',
        body: '每天一點點，養成讀經習慣；不排名、不攀比、不用罪惡感逼你。',
        bullets: [
          '讀不懂 → 牧養問答（白話，不取代牧師）',
          '覺得孤單 → 同跑隊伍',
          '進度留在本機，我們不比較任何人',
        ],
      },
      {
        heading: '聖經有大故事',
        body: '三十日計畫走過創造、墮落、救贖、教會、新天新地——不是零散金句。',
      },
      {
        heading: '跑道 vs 補給站',
        body: '聖經跑道 = 每天操場。Bible100 = 查經工具與教材，需要時再去。',
      },
    ],
    cta: '從今日關卡開始 →',
  },
  en: {
    title: 'Why we built it',
    lead: 'Joyful long run — run together, across generations.',
    sections: [
      {
        heading: 'Our promises',
        body: 'Build habit without shame or leaderboards.',
        bullets: ['Stuck? Q&A', 'Lonely? Squad', 'Progress stays on your device'],
      },
      { heading: 'Big story', body: 'The 30-day plan follows Scripture\'s storyline—not random quotes.' },
      { heading: 'Track vs supply', body: 'Bible Journey = daily track. Bible100 = deeper study when needed.' },
    ],
    cta: 'Start with Today →',
  },
  vi: {
    title: 'Vì sao làm?',
    lead: 'Chạy vui vẻ — cùng nhau, đa thế hệ.',
    sections: [
      { heading: 'Lời hứa', body: 'Không xếp hạng, không làm bạn cảm thấy tội lỗi.' },
      { heading: 'Câu chuyện lớn', body: 'Kế hoạch 30 ngày theo mạch Kinh Thánh.' },
    ],
    cta: 'Bắt đầu hôm nay →',
  },
  id: {
    title: 'Mengapa dibuat?',
    lead: 'Lari bersama dengan sukacita.',
    sections: [
      { heading: 'Janji kami', body: 'Tanpa peringkat, tanpa rasa bersalah.' },
      { heading: 'Kisah besar', body: 'Rencana 30 hari mengikuti alur Alkitab.' },
    ],
    cta: 'Mulai hari ini →',
  },
};

export function getHelpContent(kind: HelpKind, locale: Locale): HelpPack {
  if (kind === 'how') return HOW[locale] || HOW['zh-Hant'];
  if (kind === 'why') return WHY[locale] || WHY['zh-Hant'];
  return WHAT[locale] || WHAT['zh-Hant'];
}
