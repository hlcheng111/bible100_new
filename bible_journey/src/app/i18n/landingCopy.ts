import type { Locale } from '../router';

type FlowStep = { icon: string; title: string; text: string };

type LandingPack = {
  welcomeTitle: string;
  quickEyebrow: string;
  quickHint: string;
  pathTitle: string;
  pathLead: string;
  pathSteps: { emoji: string; trackId: '30day' | 'theme' | 'golden' | 'bible66'; title: string; text: string }[];
  pathFoot: string;
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
    quickEyebrow: '今天 · 大約 5 分鐘',
    quickHint: '第一次來也可以直接按，不用先設定。',
    pathTitle: '小白／初信可以這樣走',
    pathLead: '不用一次全讀。先有陪伴，再慢慢打開地圖。',
    pathSteps: [
      {
        emoji: '📅',
        trackId: '30day',
        title: '三十日（主幹）',
        text: '有人帶路，走過聖經大故事。最適合第一次。',
      },
      {
        emoji: '💛',
        trackId: 'theme',
        title: '按心情找經文',
        text: '卡住、難過、想放棄時，先被理解再讀。',
      },
      {
        emoji: '⭐',
        trackId: 'golden',
        title: '100 金句',
        text: '時間很少時，讀一句也算數。',
      },
      {
        emoji: '📜',
        trackId: 'bible66',
        title: '六十六卷（進階）',
        text: '做完上面幾條後再來：系統查讀、四語並排。',
      },
    ],
    pathFoot: '下面大按鈕＝今天這一段。想換路線，也可點上面任一張。',
    flowTitle: '每天四步就夠了',
    flowSteps: [
      { icon: '☀️', title: '今天要讀', text: '我們幫你選好今天要讀的一小段。' },
      { icon: '📖', title: '開始讀經', text: '按一下就好，不用自己找章節。' },
      { icon: '✅', title: '讀完打卡', text: '帶走一句可實行的話，放進生活裡。' },
      { icon: '🤝', title: '一起讀的朋友', text: '偶爾看看，知道還有人在陪你。' },
    ],
    story: '三十日計畫會帶你走過聖經裡的大故事——不是零散的一兩句。',
    exploreSummary: '想多看看其他路線？打開這裡',
    foot: '讀經時可以同時看多種語言。',
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
    pathTitle: 'A gentle path for beginners',
    pathLead: 'You don’t need to read everything at once. Start guided, then open the map.',
    pathSteps: [
      {
        emoji: '📅',
        trackId: '30day',
        title: '30 days (main path)',
        text: 'Someone walks you through the big story—best first step.',
      },
      {
        emoji: '💛',
        trackId: 'theme',
        title: 'By how you feel',
        text: 'When you’re stuck or heavy—be understood, then read.',
      },
      {
        emoji: '⭐',
        trackId: 'golden',
        title: '100 golden verses',
        text: 'Short on time? One verse still counts.',
      },
      {
        emoji: '📜',
        trackId: 'bible66',
        title: '66 books (next level)',
        text: 'After the paths above: look up any book, side-by-side languages.',
      },
    ],
    pathFoot: 'The big button below is today’s passage. Or tap a path card above.',
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
    pathTitle: 'Lối đi nhẹ cho người mới',
    pathLead: 'Không cần đọc hết một lần. Có người dẫn trước, rồi mới mở bản đồ.',
    pathSteps: [
      {
        emoji: '📅',
        trackId: '30day',
        title: '30 ngày (chính)',
        text: 'Được dẫn qua câu chuyện lớn—bước đầu tốt nhất.',
      },
      {
        emoji: '💛',
        trackId: 'theme',
        title: 'Theo tâm trạng',
        text: 'Khi mệt hoặc muốn bỏ cuộc—được hiểu rồi hãy đọc.',
      },
      {
        emoji: '⭐',
        trackId: 'golden',
        title: '100 câu vàng',
        text: 'Ít thời gian? Một câu cũng được.',
      },
      {
        emoji: '📜',
        trackId: 'bible66',
        title: '66 sách (nâng cao)',
        text: 'Sau các lối trên: tra cứu sách, bốn ngôn ngữ.',
      },
    ],
    pathFoot: 'Nút lớn bên dưới là đoạn hôm nay. Hoặc chọn thẻ lối ở trên.',
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
    pathTitle: 'Jalur lembut untuk pemula',
    pathLead: 'Tidak perlu baca semua sekaligus. Dipandu dulu, baru buka peta.',
    pathSteps: [
      {
        emoji: '📅',
        trackId: '30day',
        title: '30 hari (utama)',
        text: 'Dituntun lewat kisah besar—langkah pertama terbaik.',
      },
      {
        emoji: '💛',
        trackId: 'theme',
        title: 'Menurut perasaan',
        text: 'Saat lelah atau ingin menyerah—dipahami dulu, lalu baca.',
      },
      {
        emoji: '⭐',
        trackId: 'golden',
        title: '100 ayat emas',
        text: 'Waktu sempit? Satu ayat pun berarti.',
      },
      {
        emoji: '📜',
        trackId: 'bible66',
        title: '66 kitab (lanjutan)',
        text: 'Setelah jalur di atas: cari kitab, empat bahasa berdampingan.',
      },
    ],
    pathFoot: 'Tombol besar di bawah = bacaan hari ini. Atau ketuk kartu jalur di atas.',
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
