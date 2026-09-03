/* PC Landing — 引導 Tab + 短長比例尋寶地圖 */
(function (global) {
  var BUILD = '20260903w1';

  var LANE_ORDER = ['30day', 'golden', 'theme', 'plan1y', 'plan3y'];

  var YEAR_PATHS = [
    { id: 'A', color: '#6366f1', d: 'M 8 22 C 52 4 88 42 128 18 C 168 0 204 44 244 20 C 276 4 300 34 312 24' },
    { id: 'B', color: '#f59e0b', d: 'M 8 48 C 52 30 88 68 128 46 C 168 28 204 70 244 48 C 276 32 300 60 312 50' },
    { id: 'C', color: '#34d399', d: 'M 8 74 C 52 56 88 90 128 72 C 168 54 204 92 244 74 C 276 58 300 86 312 76' },
  ];

  var SEASON_CHIPS = [
    { id: 'advent', zh: '將臨', en: 'Advent', emoji: '🕯️' },
    { id: 'lent', zh: '大齋', en: 'Lent', emoji: '✝️' },
    { id: 'easter', zh: '復活', en: 'Easter', emoji: '🌅' },
  ];

  var LANE_META = {
    '30day': {
      size: 'S',
      shape: 'loop',
      color: '#f59e0b',
      width: 28,
      path: 'M 10 32 C 10 8 52 6 72 32 C 90 54 48 56 38 32 C 86 8 150 54 210 28 C 258 10 292 48 312 32',
      spots: [0.12, 0.38, 0.62, 0.88],
      spotLabels: {
        'zh-Hant': ['創造與約', '君王與先知', '耶穌生平', '教會與盼望'],
        en: ['Promise', 'Kings', 'Jesus', 'Hope'],
        vi: ['Lời hứa', 'Vua', 'Chúa Giêsu', 'Hy vọng'],
        id: ['Janji', 'Raja', 'Yesus', 'Harapan'],
      },
    },
    golden: {
      size: 'S',
      shape: 'stars',
      color: '#fb7185',
      width: 38,
      path: 'M 8 46 L 52 14 L 96 44 L 140 12 L 184 42 L 228 14 L 272 40 L 312 18',
      spots: [0.06, 0.28, 0.5, 0.72, 0.94],
      spotLabels: {
        'zh-Hant': ['創造', '律法', '詩歌智慧', '先知', '新約'],
        en: ['Creation', 'Law', 'Wisdom', 'Prophets', 'NT'],
        vi: ['Sáng tạo', 'Luật', 'Thi thiên', 'Tiên tri', 'Ước mới'],
        id: ['Penciptaan', 'Hukum', 'Mazmur', 'Nabi', 'PB'],
      },
    },
    theme: {
      size: 'M',
      shape: 'm',
      color: '#14b8a6',
      width: 52,
      path: 'M 8 50 L 70 10 L 132 48 L 194 10 L 256 48 L 312 16',
      spots: [0.05, 0.26, 0.5, 0.74, 0.95],
      spotLabels: {
        'zh-Hant': ['創造', '信心英雄', '耶穌生平', '禱告', '更多→'],
        en: ['Creation', 'Heroes', 'Jesus', 'Prayer', 'More→'],
        vi: ['Sáng tạo', 'Anh hùng', 'Chúa Giêsu', 'Cầu nguyện', 'Thêm→'],
        id: ['Penciptaan', 'Pahlawan', 'Yesus', 'Doa', 'Lain→'],
      },
    },
    plan1y: {
      size: 'L',
      shape: 's',
      color: '#6366f1',
      width: 74,
      path: 'M 8 42 C 64 8 108 56 168 22 C 224 0 268 54 312 28',
      spots: [0.08, 0.24, 0.42, 0.6, 0.78, 0.94],
      spotLabels: {
        'zh-Hant': ['2月', '4月', '6月', '8月', '10月', '12月'],
        en: ['Feb', 'Apr', 'Jun', 'Aug', 'Oct', 'Dec'],
        vi: ['2', '4', '6', '8', '10', '12'],
        id: ['2', '4', '6', '8', '10', '12'],
      },
    },
    plan3y: {
      size: 'XL',
      shape: 'wave',
      color: '#34d399',
      width: 100,
      triple: true,
    },
  };

  var UI = {
    'zh-Hant': {
      title: '歡迎來到聖經跑道',
      tagline: '每天約 5 分鐘，陪你慢慢讀聖經。',
      lead: '不用背課、不用考試。斷更了也沒關係，回來就好。',
      progress: '進度',
      enter: '走這條 →',
      quickEyebrow: '第一次來 · 約 5 分鐘',
      quickTitle: '先走三十日',
      quickHint: '最短的一條。打開、讀完、回來就好。',
      quickBtn: '先走三十日 →',
      lanesTitle: '尋寶地圖 · 選一條路',
      lanesHint: '格子越寬，路越長。線上節點＝路標（像三年線的節期）。',
      foot: '任一路線都可以用四語並排或雙語對照讀。',
      helpWhat: '這是什麼',
      helpHow: '怎麼用',
      helpWhy: '我的進度',
      whatHtml:
        '<p class="landing-guide__lead">這裡是<strong>讀經尋寶地圖</strong>。聖經很大，不用一次走完——我們把路畫出來，讓每天只要<strong>一小步</strong>。</p>' +
        '<div class="landing-guide__cards">' +
        '<div class="landing-guide__card"><strong>📅 三十日</strong><span>創→啟救恩故事 · 4 路標</span><em>Short · Bible Track</em></div>' +
        '<div class="landing-guide__card"><strong>⭐ 百句金句</strong><span>8 主題默想／背誦</span><em>100 verses</em></div>' +
        '<div class="landing-guide__card"><strong>🎯 主題讀經</strong><span>按人生題目橫切</span><em>Themes</em></div>' +
        '<div class="landing-guide__card"><strong>🗓️ 一年／🐢 三年</strong><span>長路慢慢走完</span><em>Long paths</em></div>' +
        '</div>' +
        '<p class="landing-guide__nudge">同一關可用 <strong>繁中／English／越／印</strong> 並排。不知道選哪條？看下面最短的——三十日。AI 草稿須老師／牧者審核。</p>',
      howHtml:
        '<p class="landing-guide__lead">今天只要三步：<strong>選路 → 讀一小段 → 打卡</strong>。打卡後可往這五站繼續：</p>' +
        '<ol class="landing-guide__steps landing-forward">' +
        '<li><a class="landing-fwd" href="../../../ai_tools/tools/creative_tools_landing.html"><strong>🎨 讀後創意</strong></a> — 畫圖／朗讀／音樂／短片 <em>After-read</em></li>' +
        '<li><a class="landing-fwd" href="ai-qna.html"><strong>💬 牧養問答</strong></a> — 複製 Prompt · 或查難題題庫 <em>Q&amp;A</em></li>' +
        '<li><a class="landing-fwd" href="ai-tutor.html"><strong>🎓 智慧導師</strong></a> — 三鏡導讀 <em>Go deeper</em></li>' +
        '<li><a class="landing-fwd" href="reader-multilang.html"><strong>🌐 多語查經</strong></a> — 四語並排再讀 <em>Versions</em></li>' +
        '<li><a class="landing-fwd" href="../../../bible_study/comprehensive_exegesis_reader.html?book=創世記&amp;chapter=1"><strong>📚 釋經參讀</strong></a> — 懂這章在說什麼 <em>Commentary</em></li>' +
        '</ol>' +
        '<p class="landing-guide__nudge">讀完頁會寫「✅ 這關打過卡了 · 再看讀後創意 →」。備課台在總站「AI 輔助」，這裡不預設進去。</p>',
      whyHtml: '',
      progressTrackTitle: '各線進度',
      progressLast: '最近打卡',
      progressNext: '建議下一步',
      progressNext30: '先走三十日最短一條 →',
      progressBarHint: '有進度的線會亮起來；點下面地圖即可接著走。',
      progressLead: '讀完啦！看看你走了哪幾條路——終點有新天新地在等你。',
      nudge: '你已經走了 {n} 步。回來就好，從下面地圖接著尋寶。',
      continueLast: '接著上次讀的那一章 →',
      sizeHint: { S: '短', M: '中', L: '長', XL: '更長' },
      laneLead: {
        '30day': '給初進讀經寶藏的你',
        golden: '給想把一句話藏在心裡的人',
        theme: '給心裡有題目、想對症尋寶的人',
        plan1y: '給想一年走完整本的人',
        plan3y: '三條路＝三年走完舊約與新約',
      },
      yearPick: '① 教會年',
      seasonPick: '② 節期',
      monthPick: '③ 選月份 · 點線上的數字',
      yearA: '甲年',
      yearB: '乙年',
      yearC: '丙年',
      moreSeason: '更多節期 →',
      month: '月',
      hotspot: '關卡',
      version: '聖經跑道 v{build}',
      progressEmpty: '還沒打卡？沒關係。從下面最短的三十日走一步，就有第一顆 ⭐。',
      progressLead: '讀完啦！看看你走了哪幾條路——終點有新天新地在等你。',
      progressStars: '目前共 ⭐ {n} 顆金星',
      progressStreak: '連續 {n} 天有打開',
      progressDone: '已打卡 {n} 關',
      progressCheerMid: '中途加油：斷更了也沒關係，回來接著讀就好。',
      progressCheerEnd: '願你願意打開，就已經在路上——走完這條，還可以換另一條尋寶。',
    },
    en: {
      title: 'Welcome to Bible Journey',
      tagline: 'About five minutes a day—at your pace.',
      lead: 'No exams, no guilt. Missed days? Just come back.',
      progress: 'Progress',
      enter: 'Take this path →',
      quickEyebrow: 'First time · ~5 min',
      quickTitle: 'Start with 30 days',
      quickHint: 'The shortest path. Open, read, come back.',
      quickBtn: 'Start 30 days →',
      lanesTitle: 'Treasure map · pick a path',
      lanesHint: 'Wider card, longer path. Taste short ones first.',
      foot: 'Any path can be read in four languages or two.',
      helpWhat: 'What is this?',
      helpHow: 'How to use',
      helpWhy: 'My progress',
      whatHtml:
        '<p class="landing-guide__lead">This is a <strong>treasure map</strong> for reading Scripture. You do not have to finish it all at once.</p>' +
        '<ul class="landing-guide__list">' +
        '<li><strong>Short paths</strong> let beginners taste Scripture.</li>' +
        '<li><strong>Long paths</strong> walk the whole Bible slowly.</li>' +
        '<li>Not a class. Not an exam. Missed days are OK.</li>' +
        '</ul>' +
        '<p class="landing-guide__nudge">Not sure? Start with the shortest card—30 days.</p>',
      howHtml:
        '<p class="landing-guide__lead">Do one thing today: <strong>pick a path and read a little</strong>.</p>' +
        '<ol class="landing-guide__steps">' +
        '<li>Tap a card below (or Start 30 days)</li>' +
        '<li>Read—no hunting for chapter</li>' +
        '<li>Check in. Come back tomorrow</li>' +
        '<li>After check-in: <strong>🎨 After-reading studio</strong> — take the passage to AI art, audio, or Q&amp;A (pastor review)</li>' +
        '</ol>',
      whyHtml:
        '<p class="landing-guide__lead">Many want to read the Bible, but freeze at “too thick, where do I start?”</p>' +
        '<ul class="landing-guide__list">' +
        '<li>We drew the paths so opening Scripture can be one small step a day.</li>' +
        '<li>A verse, a story, a year or three years—treasure, not homework.</li>' +
        '<li>If you open it, you are already on the way.</li>' +
        '</ul>',
      nudge: 'You have taken {n} steps. Come back and keep going.',
      continueLast: 'Continue the last chapter →',
      sizeHint: { S: 'Short', M: 'Mid', L: 'Long', XL: 'Longer' },
      laneLead: {
        '30day': 'For a first taste of Scripture',
        golden: 'For hiding one verse in your heart',
        theme: 'For a question you want to explore',
        plan1y: 'For walking the whole Bible in a year',
        plan3y: 'Three lines = three years through Scripture',
      },
      yearPick: '① Church year',
      seasonPick: '② Season',
      monthPick: '③ Month · tap the numbers on the line',
      yearA: 'Year A',
      yearB: 'Year B',
      yearC: 'Year C',
      moreSeason: 'More seasons →',
      month: '',
      hotspot: 'Stop',
      version: 'Bible Journey v{build}',
    },
    vi: {
      title: 'Chào mừng đến Hành trình Kinh Thánh',
      tagline: 'Khoảng 5 phút mỗi ngày.',
      lead: 'Không thi, không ép. Quên vài ngày? Cứ quay lại.',
      progress: 'Tiến độ',
      enter: 'Đi đường này →',
      quickEyebrow: 'Lần đầu · ~5 phút',
      quickTitle: 'Bắt đầu 30 ngày',
      quickHint: 'Đường ngắn nhất.',
      quickBtn: 'Bắt đầu 30 ngày →',
      lanesTitle: 'Bản đồ kho báu · chọn một đường',
      lanesHint: 'Ô càng rộng, đường càng dài.',
      foot: 'Mọi lộ trình có thể đọc bốn ngôn ngữ.',
      helpWhat: 'Đây là gì?',
      helpHow: 'Cách dùng',
      helpWhy: 'Vì sao làm',
      whatHtml:
        '<p class="landing-guide__lead">Đây là <strong>bản đồ kho báu</strong> để đọc Kinh Thánh.</p>' +
        '<ul class="landing-guide__list"><li>Đường ngắn cho người mới.</li><li>Đường dài đi chậm cả Kinh Thánh.</li><li>Không phải kỳ thi.</li></ul>' +
        '<p class="landing-guide__nudge">Chưa biết chọn? Bắt đầu ô ngắn nhất—30 ngày.</p>',
      howHtml:
        '<p class="landing-guide__lead">Hôm nay chỉ một việc: <strong>chọn đường và đọc một đoạn</strong>.</p>' +
        '<ol class="landing-guide__steps"><li>Chọn một ô</li><li>Đọc</li><li>Check-in, mai quay lại</li></ol>',
      whyHtml:
        '<p class="landing-guide__lead">Nhiều người muốn đọc nhưng không biết bắt đầu.</p>' +
        '<ul class="landing-guide__list"><li>Chúng tôi vẽ đường để mỗi ngày một bước nhỏ.</li></ul>',
      nudge: 'Bạn đã đi {n} bước. Cứ quay lại.',
      continueLast: 'Tiếp chương lần trước →',
      sizeHint: { S: 'Ngắn', M: 'Vừa', L: 'Dài', XL: 'Dài hơn' },
      laneLead: {
        '30day': 'Cho người mới vào kho báu Kinh Thánh',
        golden: 'Giữ một câu trong lòng',
        theme: 'Có chủ đề muốn tìm',
        plan1y: 'Đọc cả Kinh Thánh trong một năm',
        plan3y: 'Ba đường = ba năm',
      },
      yearPick: '① Năm phụng vụ',
      seasonPick: '② Mùa',
      monthPick: '③ Tháng · chạm số trên đường',
      yearA: 'Năm A',
      yearB: 'Năm B',
      yearC: 'Năm C',
      moreSeason: 'Thêm mùa →',
      month: '',
      hotspot: 'Điểm',
      version: 'Hành trình v{build}',
    },
    id: {
      title: 'Selamat datang di Perjalanan Alkitab',
      tagline: 'Sekitar 5 menit sehari.',
      lead: 'Tanpa ujian. Terlewat? Kembali saja.',
      progress: 'Progres',
      enter: 'Ambil jalur ini →',
      quickEyebrow: 'Pertama kali · ~5 menit',
      quickTitle: 'Mulai 30 hari',
      quickHint: 'Jalur terpendek.',
      quickBtn: 'Mulai 30 hari →',
      lanesTitle: 'Peta harta · pilih jalur',
      lanesHint: 'Kartu lebih lebar, jalur lebih panjang.',
      foot: 'Setiap jalur bisa empat bahasa.',
      helpWhat: 'Apa ini?',
      helpHow: 'Cara pakai',
      helpWhy: 'Mengapa dibuat',
      whatHtml:
        '<p class="landing-guide__lead">Ini <strong>peta harta</strong> untuk membaca Alkitab.</p>' +
        '<ul class="landing-guide__list"><li>Jalur pendek untuk pemula.</li><li>Jalur panjang menempuh seluruh Alkitab.</li><li>Bukan ujian.</li></ul>' +
        '<p class="landing-guide__nudge">Bingung? Mulai kartu terpendek—30 hari.</p>',
      howHtml:
        '<p class="landing-guide__lead">Hari ini satu hal: <strong>pilih jalur dan baca sedikit</strong>.</p>' +
        '<ol class="landing-guide__steps"><li>Pilih kartu</li><li>Baca</li><li>Check-in, kembali besok</li></ol>',
      whyHtml:
        '<p class="landing-guide__lead">Banyak orang ingin baca Alkitab tapi tidak tahu mulai dari mana.</p>' +
        '<ul class="landing-guide__list"><li>Kami menggambar jalurnya agar tiap hari satu langkah kecil.</li></ul>',
      nudge: 'Anda sudah {n} langkah. Kembali saja.',
      continueLast: 'Lanjutkan pasal terakhir →',
      sizeHint: { S: 'Pendek', M: 'Sedang', L: 'Panjang', XL: 'Lebih panjang' },
      laneLead: {
        '30day': 'Untuk yang baru masuk harta Alkitab',
        golden: 'Simpan satu ayat di hati',
        theme: 'Ada pertanyaan untuk ditelusuri',
        plan1y: 'Seluruh Alkitab dalam setahun',
        plan3y: 'Tiga garis = tiga tahun',
      },
      yearPick: '① Tahun gereja',
      seasonPick: '② Musim',
      monthPick: '③ Bulan · ketuk angka di garis',
      yearA: 'Tahun A',
      yearB: 'Tahun B',
      yearC: 'Tahun C',
      moreSeason: 'Musim lain →',
      month: '',
      hotspot: 'Titik',
      version: 'Perjalanan v{build}',
    },
  };

  function loc() {
    return global.B100LocalePick
      ? global.B100LocalePick.getLocale()
      : (new URLSearchParams(location.search).get('locale') || 'zh-Hant');
  }

  function ui(key) {
    var pack = UI[loc()] || UI['zh-Hant'];
    var val = pack[key];
    if (val === undefined) val = UI['zh-Hant'][key];
    return val !== undefined ? val : key;
  }

  function esc(s) {
    if (!s) return '';
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function setText(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function setHtml(id, html) {
    var el = document.getElementById(id);
    if (el) el.innerHTML = html;
  }

  function applyStatic() {
    document.documentElement.lang = loc() === 'zh-Hant' ? 'zh-Hant' : loc();
    setText('landingTitle', ui('title'));
    setText('landingTagline', ui('tagline'));
    setText('landingLead', ui('lead'));
    setText('quickEyebrow', ui('quickEyebrow'));
    setText('quickTitle', ui('quickTitle'));
    setText('quickHint', ui('quickHint'));
    setText('lanesTitle', ui('lanesTitle'));
    setText('lanesHint', ui('lanesHint'));
    setText('landingFoot', ui('foot'));
    setText('helpWhatLabel', ui('helpWhat'));
    setText('helpHowLabel', ui('helpHow'));
    setText('helpWhyLabel', ui('helpWhy'));
    setHtml('whatGuide', ui('whatHtml'));
    setHtml('howGuide', ui('howHtml'));
    setHtml('whyGuide', buildProgressHtml());
    var qb = document.getElementById('quickStartBtn');
    if (qb) qb.textContent = ui('quickBtn');
    var ver = document.getElementById('landingVersion');
    if (ver) {
      var build = (global.parent && global.parent.B100_SHELL_ASSET_V) || BUILD;
      ver.textContent = String(ui('version')).replace('{build}', build);
    }
    renderHowExtras();
  }

  function buildProgressHtml() {
    var P = global.B100Progress;
    var st = P ? P.stats() : { stars: 0, streak: 0, totalDone: 0, lastDay: '' };
    var stars = st.stars || 0;
    var streak = st.streak || 0;
    var done = st.totalDone || 0;
    var tracks = [
      { id: '30day', emoji: '📅', zh: '三十日', en: '30-day', prefix: '30d:', total: 30, href: 'track-30day.html' },
      { id: 'golden', emoji: '⭐', zh: '金句', en: 'Golden', prefix: 'gv:', total: 100, href: 'track-golden.html' },
      { id: 'theme', emoji: '🎯', zh: '主題', en: 'Theme', prefix: 'theme:', total: 0, href: 'track-theme.html' },
      { id: 'plan1y', emoji: '🗓️', zh: '一年', en: '1-year', prefix: '1y:', total: 365, href: 'track-plan1y.html' },
      { id: 'plan3y', emoji: '🐢', zh: '三年', en: '3-year', prefix: '3y:', total: 0, href: 'track-plan3y.html' },
    ];
    var bars = '';
    var best = null;
    tracks.forEach(function (t) {
      var n = P && P.countDone ? P.countDone(t.prefix) : 0;
      if (n > 0 && (!best || n > best.n)) best = { t: t, n: n };
      var pct = t.total > 0 ? Math.min(100, Math.round((n / t.total) * 100)) : (n > 0 ? 12 : 0);
      bars +=
        '<a class="landing-prog-row" href="' + t.href + '">' +
        '<span class="landing-prog-row__label">' + t.emoji + ' ' + t.zh +
        ' <em>' + t.en + '</em></span>' +
        '<span class="landing-prog-row__meta">' + n + (t.total ? '/' + t.total : '') + '</span>' +
        '<span class="landing-prog-row__bar"><i style="width:' + pct + '%"></i></span>' +
        '</a>';
    });
    var lastHtml = '';
    if (P && P.load) {
      var log = (P.load().log || [])[0];
      if (log) {
        var when = log.at ? new Date(log.at).toLocaleString() : (st.lastDay || '');
        lastHtml =
          '<p class="landing-guide__nudge"><strong>' +
          esc(ui('progressLast') || '最近打卡') +
          '：</strong> ' +
          esc(String(log.id || '')) +
          (when ? ' · ' + esc(String(when)) : '') +
          '</p>';
      }
    }
    var nextHtml = '';
    if (best) {
      nextHtml =
        '<p class="landing-guide__lead" style="margin-top:10px"><strong>' +
        esc(ui('progressNext') || '建議下一步') +
        '：</strong> 接著走 ' +
        best.t.emoji +
        ' ' +
        esc(best.t.zh) +
        '（已 ' +
        best.n +
        ' 關）→ <a class="landing-fwd" href="' +
        best.t.href +
        '">打開這條路</a></p>';
    } else {
      nextHtml =
        '<p class="landing-guide__lead" style="margin-top:10px"><a class="landing-fwd" href="track-30day.html">' +
        esc(ui('progressNext30') || UI['zh-Hant'].progressNext30) +
        '</a></p>';
    }
    if (!stars && !done) {
      return (
        '<p class="landing-guide__lead">' + esc(ui('progressEmpty') || UI['zh-Hant'].progressEmpty) + '</p>' +
        '<p class="landing-guide__nudge">' + esc(ui('progressCheerEnd') || UI['zh-Hant'].progressCheerEnd) + '</p>' +
        '<h3 class="landing-prog-title">' + esc(ui('progressTrackTitle') || '各線進度') + '</h3>' +
        '<div class="landing-prog-list">' + bars + '</div>' +
        '<p class="landing-guide__nudge">' + esc(ui('progressBarHint') || '') + '</p>' +
        nextHtml
      );
    }
    return (
      '<p class="landing-guide__lead">' + esc(ui('progressLead') || UI['zh-Hant'].progressLead) + '</p>' +
      '<ul class="landing-guide__list">' +
      '<li>' + esc(String(ui('progressStars') || UI['zh-Hant'].progressStars).replace('{n}', String(stars))) + '</li>' +
      '<li>' + esc(String(ui('progressDone') || UI['zh-Hant'].progressDone).replace('{n}', String(done))) + '</li>' +
      (streak
        ? '<li>' + esc(String(ui('progressStreak') || UI['zh-Hant'].progressStreak).replace('{n}', String(streak))) + '</li>'
        : '') +
      '</ul>' +
      lastHtml +
      '<h3 class="landing-prog-title">' + esc(ui('progressTrackTitle') || '各線進度') + '</h3>' +
      '<div class="landing-prog-list">' + bars + '</div>' +
      nextHtml +
      '<p class="landing-guide__nudge">' +
      esc(ui('progressCheerMid') || UI['zh-Hant'].progressCheerMid) +
      '<br>' +
      esc(ui('progressCheerEnd') || UI['zh-Hant'].progressCheerEnd) +
      '</p>'
    );
  }

  function renderHowExtras() {
    var nudge = document.getElementById('howNudge');
    var stars = global.B100Progress ? (global.B100Progress.stats().stars || 0) : 0;
    if (nudge) {
      if (stars > 0) {
        nudge.hidden = false;
        nudge.textContent = String(ui('nudge')).replace('{n}', String(stars));
      } else {
        nudge.hidden = true;
      }
    }
    var cont = document.getElementById('howContinue');
    if (!cont) return;
    var st = global.parent && global.parent.BibleShellNav && global.parent.BibleShellNav.getState
      ? global.parent.BibleShellNav.getState()
      : null;
    var can = st && st.lastFrame && /bible66\.html|read66\.html/i.test(st.lastFrame);
    cont.hidden = !can;
    cont.textContent = ui('continueLast');
  }

  function mergeLane(summary) {
    var meta = LANE_META[summary.id] || LANE_META['30day'];
    var leads = ui('laneLead') || UI['zh-Hant'].laneLead;
    var sizes = ui('sizeHint') || UI['zh-Hant'].sizeHint;
    return {
      id: summary.id,
      emoji: summary.emoji || '📖',
      title: summary.title || summary.id,
      color: summary.color || meta.color,
      total: summary.total || 0,
      done: summary.done || 0,
      progressLabel: summary.progressLabel || '—',
      error: !!summary.error,
      size: meta.size,
      sizeLabel: sizes[meta.size] || meta.size,
      shape: meta.shape,
      path: meta.path,
      spots: meta.spots,
      spotLabels: meta.spotLabels || null,
      width: meta.width,
      triple: !!meta.triple,
      lead: leads[summary.id] || '',
    };
  }

  function stubSummary(id) {
    var fb = (global.B100TrackRegistry && global.B100TrackRegistry.metaById)
      ? global.B100TrackRegistry.metaById(id)
      : {};
    return {
      id: id,
      emoji: (fb && fb.emoji) || '📖',
      title: (fb && (fb.titleZh || fb.title)) || id,
      color: (fb && fb.color) || (LANE_META[id] && LANE_META[id].color),
      total: 0,
      done: 0,
      progressLabel: '—',
      error: true,
    };
  }

  function renderLanes(summaries) {
    applyStatic();
    var byId = {};
    (summaries || []).forEach(function (s) { byId[s.id] = s; });
    var root = document.getElementById('laneRoot');
    if (!root) return;
    root.innerHTML = '';
    LANE_ORDER.forEach(function (id) {
      var lane = mergeLane(byId[id] || stubSummary(id));
      root.appendChild(buildLane(lane));
    });
    layoutLaneTracks(root);
  }

  function monthDots(row) {
    var year = YEAR_PATHS[row].id;
    var html = '';
    for (var i = 0; i < 12; i++) {
      var t = (i + 0.5) / 12;
      html +=
        '<button type="button" class="lane__spot lane__spot--mo" data-year="' + year +
        '" data-month="' + (i + 1) + '" data-t="' + t + '"' +
        ' aria-label="' + esc(year + ' · ' + (i + 1) + ui('month')) + '">' +
        (i + 1) + '</button>';
    }
    return html;
  }

  function placeSpotsOnPath(trackEl, pathSel, spotSel) {
    var svg = trackEl.querySelector('svg');
    var path = trackEl.querySelector(pathSel);
    if (!svg || !path || !path.getTotalLength) return;
    var len = path.getTotalLength();
    if (!len) return;
    var box = svg.viewBox && svg.viewBox.baseVal ? svg.viewBox.baseVal : { width: 320, height: 64 };
    var w = box.width || 320;
    var h = box.height || 64;
    trackEl.querySelectorAll(spotSel).forEach(function (btn) {
      var t = parseFloat(btn.getAttribute('data-t'));
      if (isNaN(t)) t = 0.5;
      var pt = path.getPointAtLength(Math.max(0, Math.min(1, t)) * len);
      btn.style.left = ((pt.x / w) * 100) + '%';
      btn.style.top = ((pt.y / h) * 100) + '%';
    });
  }

  function layoutLaneTracks(root) {
    if (!root) return;
    root.querySelectorAll('.lane__track:not(.lane__track--triple)').forEach(function (trackEl) {
      placeSpotsOnPath(trackEl, 'path.lane__path', '.lane__spot');
    });
    root.querySelectorAll('.lane__track--triple').forEach(function (trackEl) {
      YEAR_PATHS.forEach(function (y, i) {
        placeSpotsOnPath(
          trackEl,
          'path.lane__path--y' + (i + 1),
          '.lane__spot--mo[data-year="' + y.id + '"]'
        );
      });
    });
  }

  function buildTripleTrack() {
    var paths = YEAR_PATHS.map(function (y, i) {
      return (
        '<path class="lane__path-bg" d="' + y.d + '" />' +
        '<path class="lane__path lane__path--y' + (i + 1) + '" d="' + y.d + '" style="stroke:' + y.color + '" />'
      );
    }).join('');
    var dots = monthDots(0) + monthDots(1) + monthDots(2);
    return (
      '<div class="lane__track lane__track--triple">' +
        '<svg class="lane__svg" viewBox="0 0 320 96" preserveAspectRatio="none" aria-hidden="true">' + paths + '</svg>' +
        '<div class="lane__spots">' + dots + '</div>' +
      '</div>'
    );
  }

  function buildYearChips() {
    var years = [
      { id: 'A', label: ui('yearA') },
      { id: 'B', label: ui('yearB') },
      { id: 'C', label: ui('yearC') },
    ];
    return (
      '<div class="lane__picks">' +
        '<span class="lane__pick-label">' + esc(ui('yearPick')) + '</span>' +
        years.map(function (y) {
          return '<button type="button" class="lane__chip" data-year="' + y.id + '">' + esc(y.label) + '</button>';
        }).join('') +
        '<span class="lane__pick-label">' + esc(ui('seasonPick')) + '</span>' +
        SEASON_CHIPS.map(function (s) {
          var name = loc() === 'zh-Hant' ? s.zh : s.en;
          return '<button type="button" class="lane__chip" data-season="' + s.id + '">' + esc(s.emoji + ' ' + name) + '</button>';
        }).join('') +
        '<button type="button" class="lane__chip lane__chip--more" data-track="plan3y">' + esc(ui('moreSeason')) + '</button>' +
        '<span class="lane__pick-label">' + esc(ui('monthPick')) + '</span>' +
      '</div>'
    );
  }

  function buildLane(lane) {
    var pct = lane.total ? Math.min(100, Math.round((lane.done / lane.total) * 100)) : 0;
    var wrap = document.createElement('article');
    wrap.className = 'lane lane--' + lane.shape + (lane.triple ? ' lane--triple' : '') + (lane.error ? ' lane--err' : '');
    wrap.style.setProperty('--lane-color', lane.color);
    wrap.style.setProperty('--lane-w', lane.width + '%');
    wrap.setAttribute('data-track', lane.id);

    var trackHtml;
    if (lane.triple) {
      trackHtml = buildTripleTrack() + buildYearChips();
    } else {
      var labelPack = (lane.spotLabels && (lane.spotLabels[loc()] || lane.spotLabels['zh-Hant'])) || [];
      var spots = (lane.spots || []).map(function (p, i) {
        var hot = pct > 0 && i === Math.min(lane.spots.length - 1, Math.floor((pct / 100) * lane.spots.length));
        var lab = labelPack[i] || '';
        return (
          '<button type="button" class="lane__spot' + (hot ? ' is-hot' : '') + '" data-track="' + esc(lane.id) + '"' +
            ' data-t="' + p + '" aria-label="' + esc((lab ? lab + ' · ' : '') + ui('hotspot') + ' · ' + lane.title) + '">' +
            (lab ? '<span class="lane__spot-lab">' + esc(lab) + '</span>' : '') +
          '</button>'
        );
      }).join('');
      trackHtml =
        '<div class="lane__track">' +
          '<svg class="lane__svg" viewBox="0 0 320 64" preserveAspectRatio="none" aria-hidden="true">' +
            '<path class="lane__path-bg" d="' + lane.path + '" />' +
            '<path class="lane__path" d="' + lane.path + '" />' +
          '</svg>' +
          '<div class="lane__spots">' + spots + '</div>' +
        '</div>';
    }

    wrap.innerHTML =
      '<div class="lane__meta">' +
        '<div class="lane__row">' +
          '<span class="lane__size">' + esc(lane.sizeLabel) + '</span>' +
          '<span class="lane__emoji" aria-hidden="true">' + esc(lane.emoji) + '</span>' +
          '<strong class="lane__name">' + esc(lane.title) + '</strong>' +
          '<button type="button" class="lane__go" data-track="' + esc(lane.id) + '">' + esc(ui('enter')) + '</button>' +
        '</div>' +
        '<p class="lane__lead">' +
          (lane.lead ? esc(lane.lead) + ' · ' : '') +
          esc(ui('progress')) + ' ' + esc(lane.progressLabel) +
        '</p>' +
      '</div>' +
      trackHtml;

    wrap.addEventListener('click', function (ev) {
      if (ev.target.closest('button')) return;
      enter(lane.id);
    });
    wrap.querySelectorAll('[data-track]').forEach(function (btn) {
      btn.addEventListener('click', function (ev) {
        ev.stopPropagation();
        enter(btn.getAttribute('data-track') || lane.id);
      });
    });
    wrap.querySelectorAll('[data-year]').forEach(function (btn) {
      btn.addEventListener('click', function (ev) {
        ev.stopPropagation();
        var extra = { year: btn.getAttribute('data-year') };
        if (btn.getAttribute('data-month')) extra.month = btn.getAttribute('data-month');
        enter('plan3y', extra);
      });
    });
    wrap.querySelectorAll('[data-season]').forEach(function (btn) {
      btn.addEventListener('click', function (ev) {
        ev.stopPropagation();
        enter('plan3y', { season: btn.getAttribute('data-season') });
      });
    });
    return wrap;
  }

  function enter(trackId, extra) {
    if (global.B100TrackRegistry) {
      global.B100TrackRegistry.enterTrack(trackId, extra);
      return;
    }
    var q = new URLSearchParams();
    q.set('locale', loc());
    if (extra) {
      Object.keys(extra).forEach(function (k) { q.set(k, extra[k]); });
    }
    location.href = (trackId === 'plan3y' ? 'track-plan3y.html' : 'track-30day.html') + '?' + q.toString();
  }

  function goToday() {
    enter('30day');
  }

  function continueLast() {
    var nav = global.parent && global.parent.BibleShellNav;
    if (!nav || !nav.getState || !nav.setFrame) return;
    var st = nav.getState();
    if (st.lastFrame) nav.setFrame(st.lastFrame, st.lastFrameExtra || null);
  }

  function showTab(id) {
    ['what', 'how', 'why'].forEach(function (k) {
      var tab = document.querySelector('.landing-tab[data-tab="' + k + '"]');
      var panel = document.getElementById('panel' + k.charAt(0).toUpperCase() + k.slice(1));
      var on = k === id;
      if (tab) {
        tab.classList.toggle('is-on', on);
        tab.setAttribute('aria-selected', on ? 'true' : 'false');
      }
      if (panel) {
        panel.hidden = !on;
        panel.classList.toggle('is-on', on);
      }
    });
  }

  function bindActions() {
    var btn = document.getElementById('quickStartBtn');
    if (btn && !btn._bound) {
      btn._bound = true;
      btn.addEventListener('click', goToday);
    }
    var cont = document.getElementById('howContinue');
    if (cont && !cont._bound) {
      cont._bound = true;
      cont.addEventListener('click', continueLast);
    }
    document.querySelectorAll('.landing-tab[data-tab]').forEach(function (el) {
      if (el._bound) return;
      el._bound = true;
      el.addEventListener('click', function () { showTab(el.getAttribute('data-tab')); });
    });
  }

  function init() {
    applyStatic();
    bindActions();
    showTab('what');
    if (!global.B100TrackRegistry) {
      renderLanes(LANE_ORDER.map(stubSummary));
      return;
    }
    global.B100TrackRegistry.loadAllSummaries()
      .then(renderLanes)
      .catch(function () {
        renderLanes(LANE_ORDER.map(stubSummary));
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  global.addEventListener('pageshow', function (ev) {
    if (ev.persisted) init();
  });
})(window);
