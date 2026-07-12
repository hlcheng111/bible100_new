import type { Locale } from '../router';

type FlowStep = { icon: string; title: string; text: string };

type LandingPack = {
  welcomeTitle: string;
  quickEyebrow: string;
  quickHint: string;
  flowTitle: string;
  flowSteps: FlowStep[];
  story: string;
  exploreSummary: string;
  foot: string;
  progress: string;
  enter: string;
  stars: string;
  streak: string;
  version: string;
};

const PACKS: Record<Locale, LandingPack> = {
  'zh-Hant': {
    welcomeTitle: '歡迎來到聖經跑道',
    quickEyebrow: '今日亮光 · 約 5 分鐘',
    quickHint: '第一次來也可以直接按，不用先設定。',
    flowTitle: '每天四步就夠了',
    flowSteps: [
      { icon: '☀️', title: '今日關卡', text: '系統幫你選好今天要讀的一段。' },
      { icon: '📖', title: '開始讀經', text: '按一下就好，不用自己找書卷章節。' },
      { icon: '✅', title: '讀完打卡', text: '領一句應用與短禱告，帶進生活。' },
      { icon: '🤝', title: '同跑隊伍', text: '偶爾看看，知道還有人在陪你。' },
    ],
    story: '三十日計畫會帶你走過創造、救贖、教會與新天新地的大故事——不是零散金句。',
    exploreSummary: '想多探索？點開看四條跑道',
    foot: '任一路線讀經時，可選四語並排或雙語對照。',
    progress: '進度',
    enter: '想多讀再進入 →',
    stars: '金星',
    streak: '連續天',
    version: '聖經跑道 v2.0-mvp',
  },
  en: {
    welcomeTitle: 'Welcome to Bible Journey',
    quickEyebrow: "Today's light · ~5 min",
    quickHint: 'First time? Tap below—no setup needed.',
    flowTitle: 'Four steps each day',
    flowSteps: [
      { icon: '☀️', title: 'Today', text: 'We pick today\'s passage for you.' },
      { icon: '📖', title: 'Read', text: 'One tap—no hunting for book and chapter.' },
      { icon: '✅', title: 'Check in', text: 'One life line and a short prayer.' },
      { icon: '🤝', title: 'Squad', text: 'Peek sometimes—you\'re not alone.' },
    ],
    story: 'The 30-day plan follows the big story—creation, redemption, church, and new creation.',
    exploreSummary: 'Want more? Open the four tracks',
    foot: 'Any track opens the reader in quad or dual language.',
    progress: 'Progress',
    enter: 'Explore more →',
    stars: 'Stars',
    streak: 'Streak',
    version: 'Bible Journey v2.0-mvp',
  },
  vi: {
    welcomeTitle: 'Chào mừng đến Hành trình Kinh Thánh',
    quickEyebrow: 'Điểm sáng hôm nay · ~5 phút',
    quickHint: 'Lần đầu? Bấm bên dưới—không cần cài đặt.',
    flowTitle: 'Chỉ bốn bước mỗi ngày',
    flowSteps: [
      { icon: '☀️', title: 'Hôm nay', text: 'Hệ thống chọn đoạn Kinh cho bạn.' },
      { icon: '📖', title: 'Đọc', text: 'Một cú chạm—không cần tự tìm sách/chương.' },
      { icon: '✅', title: 'Check-in', text: 'Một câu ứng dụng và lời cầu ngắn.' },
      { icon: '🤝', title: 'Đội chạy', text: 'Thỉnh thoảng xem—bạn không đơn độc.' },
    ],
    story: 'Kế hoạch 30 ngày đi theo câu chuyện lớn—sáng tạo, cứu rỗi, Hội thánh, tạo mới.',
    exploreSummary: 'Muốn thêm? Mở bốn lộ trình',
    foot: 'Mọi lộ trình mở trình đọc bốn ngôn ngữ hoặc song ngữ.',
    progress: 'Tiến độ',
    enter: 'Khám phá thêm →',
    stars: 'Sao',
    streak: 'Chuỗi ngày',
    version: 'Hành trình v2.0-mvp',
  },
  id: {
    welcomeTitle: 'Selamat datang di Perjalanan Alkitab',
    quickEyebrow: 'Sorotan hari ini · ~5 menit',
    quickHint: 'Pertama kali? Ketuk di bawah—tanpa pengaturan.',
    flowTitle: 'Empat langkah setiap hari',
    flowSteps: [
      { icon: '☀️', title: 'Hari ini', text: 'Kami pilih bacaan untuk Anda.' },
      { icon: '📖', title: 'Baca', text: 'Satu ketuk—tanpa cari kitab/pasal sendiri.' },
      { icon: '✅', title: 'Check-in', text: 'Satu kalimat aplikasi dan doa singkat.' },
      { icon: '🤝', title: 'Tim lari', text: 'Sesekali lihat—Anda tidak sendirian.' },
    ],
    story: 'Rencana 30 hari mengikuti kisah besar—penciptaan, penebusan, gereja, ciptaan baru.',
    exploreSummary: 'Ingin lebih? Buka empat jalur',
    foot: 'Setiap jalur membuka pembaca berempat bahasa atau dwibahasa.',
    progress: 'Progres',
    enter: 'Jelajahi lebih →',
    stars: 'Bintang',
    streak: 'Beruntun',
    version: 'Perjalanan v2.0-mvp',
  },
};

export function landingCopy(locale: Locale): LandingPack {
  return PACKS[locale] || PACKS['zh-Hant'];
}
