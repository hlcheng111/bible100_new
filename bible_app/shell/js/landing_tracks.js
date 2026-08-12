/* PC Landing — 小白極簡首屏 + 可折疊跑道 */
(function (global) {
  var BUILD = '20260810c';

  var UI = {
    'zh-Hant': {
      title: '歡迎來到聖經跑道',
      tagline: '每天約 5 分鐘，陪你慢慢讀聖經。',
      lead: '不用背課、不用考試。斷更了也沒關係，回來就好。',
      progress: '進度',
      enter: '想多讀再進入 →',
      stars: '金星',
      streak: '連續天',
      quickEyebrow: '今日亮光 · 約 5 分鐘',
      quickTitle: '開始今日關卡',
      quickHint: '第一次來也可以直接按，不用先設定。',
      quickBtn: '開始今日關卡 →',
      reassure: '💚 斷更沒關係 · 不考勤 · 歡迎回來',
      flowTitle: '每天四步就夠了',
      flowSteps: [
        { icon: '☀️', title: '今日關卡', text: '系統幫你選好今天要讀的一段。' },
        { icon: '📖', title: '開始讀經', text: '按一下就好，不用自己找書卷章節。' },
        { icon: '✅', title: '讀完打卡', text: '領一句應用與短禱告，帶進生活。' },
        { icon: '🤝', title: '同跑隊伍', text: '偶爾看看，知道還有人在陪你。' },
      ],
      story: '新手可先走三十日；想读完全本请选「一年计划」或「三年计划」— 每日诗篇 + 旧约五类 + 新约五类，彩色月历看得见进度。',
      exploreSummary: '想多探索？點開看四條跑道',
      foot: '任一路線讀經時，可選四語並排或雙語對照。',
      helpWhat: '這是什麼',
      helpHow: '怎麼用',
      helpWhy: '為什麼做',
      auxPacing: '同跑隊伍',
      auxQna: '牧養問答',
      auxAi: '智慧導師',
      version: '聖經跑道 v{build} · 本機與雲端請保持同一版本',
      loadFail: '跑道資料暫時未載入，請重新整理。',
    },
    en: {
      title: 'Welcome to Bible Journey',
      tagline: 'About five minutes a day to walk through Scripture—at your pace.',
      lead: 'No exams, no guilt. Missed a few days? Just come back.',
      progress: 'Progress',
      enter: 'Explore more →',
      stars: 'Stars',
      streak: 'Streak',
      quickEyebrow: 'Today\'s light · ~5 min',
      quickTitle: 'Start Today\'s challenge',
      quickHint: 'First time? Tap below—no setup needed.',
      quickBtn: 'Start Today →',
      reassure: '💚 Missed days are OK · No roll call · Welcome back',
      flowTitle: 'Four steps each day',
      flowSteps: [
        { icon: '☀️', title: 'Today', text: 'We pick today\'s passage for you.' },
        { icon: '📖', title: 'Read', text: 'One tap—no hunting for book and chapter.' },
        { icon: '✅', title: 'Check in', text: 'One life line and a short prayer.' },
        { icon: '🤝', title: 'Squad', text: 'Peek sometimes—you\'re not alone.' },
      ],
      story: 'The 30-day plan follows the big story—creation, redemption, church, and new creation—not random quotes.',
      exploreSummary: 'Want more? Open the four tracks',
      foot: 'Any track opens the reader in quad, dual, or single language.',
      helpWhat: 'What is this?',
      helpHow: 'How to use',
      helpWhy: 'Why we built it',
      auxPacing: 'Squad',
      auxQna: 'Pastoral Q&A',
      auxAi: 'AI tutor',
      version: 'Bible Journey v{build} · Keep local & cloud in sync',
      loadFail: 'Track data failed to load. Please refresh.',
    },
    vi: {
      title: 'Chào mừng đến Hành trình Kinh Thánh',
      tagline: 'Khoảng 5 phút mỗi ngày, cùng bạn đọc Kinh Thánh từ từ.',
      lead: 'Không thi, không ép. Quên vài ngày? Cứ quay lại.',
      progress: 'Tiến độ',
      enter: 'Khám phá thêm →',
      stars: 'Sao',
      streak: 'Chuỗi ngày',
      quickEyebrow: 'Điểm sáng hôm nay · ~5 phút',
      quickTitle: 'Bắt đầu Thử thách hôm nay',
      quickHint: 'Lần đầu? Bấm bên dưới—không cần cài đặt.',
      quickBtn: 'Bắt đầu hôm nay →',
      reassure: '💚 Quên ngày cũng được · Không điểm danh · Chào mừng trở lại',
      flowTitle: 'Chỉ bốn bước mỗi ngày',
      flowSteps: [
        { icon: '☀️', title: 'Hôm nay', text: 'Hệ thống chọn đoạn Kinh cho bạn.' },
        { icon: '📖', title: 'Đọc', text: 'Một cú chạm—không cần tự tìm sách/chương.' },
        { icon: '✅', title: 'Check-in', text: 'Một câu ứng dụng và lời cầu ngắn.' },
        { icon: '🤝', title: 'Đội chạy', text: 'Thỉnh thoảng xem—bạn không đơn độc.' },
      ],
      story: 'Kế hoạch 30 ngày đi theo câu chuyện lớn—sáng tạo, cứu rỗi, Hội thánh, tạo mới—not những câu rời rạc.',
      exploreSummary: 'Muốn thêm? Mở bốn lộ trình',
      foot: 'Mọi lộ trình mở trình đọc bốn ngôn ngữ hoặc song ngữ.',
      helpWhat: 'Đây là gì?',
      helpHow: 'Cách dùng',
      helpWhy: 'Vì sao làm',
      auxPacing: 'Đội chạy',
      auxQna: 'Hỏi đáp',
      auxAi: 'Gia sư AI',
      version: 'Hành trình v{build} · Giữ bản cục bộ & đám mây đồng bộ',
      loadFail: 'Chưa tải được dữ liệu. Vui lòng tải lại.',
    },
    id: {
      title: 'Selamat datang di Perjalanan Alkitab',
      tagline: 'Sekitar 5 menit sehari, menemani Anda membaca Alkitab perlahan.',
      lead: 'Tanpa ujian, tanpa rasa bersalah. Terlewat? Kembali saja.',
      progress: 'Progres',
      enter: 'Jelajahi lebih →',
      stars: 'Bintang',
      streak: 'Beruntun',
      quickEyebrow: 'Sorotan hari ini · ~5 menit',
      quickTitle: 'Mulai Tantangan hari ini',
      quickHint: 'Pertama kali? Ketuk di bawah—tanpa pengaturan.',
      quickBtn: 'Mulai hari ini →',
      reassure: '💚 Terlewat boleh · Bukan absensi · Selamat datang kembali',
      flowTitle: 'Empat langkah setiap hari',
      flowSteps: [
        { icon: '☀️', title: 'Hari ini', text: 'Kami pilih bacaan untuk Anda.' },
        { icon: '📖', title: 'Baca', text: 'Satu ketuk—tanpa cari kitab/pasal sendiri.' },
        { icon: '✅', title: 'Check-in', text: 'Satu kalimat aplikasi dan doa singkat.' },
        { icon: '🤝', title: 'Tim lari', text: 'Sesekali lihat—Anda tidak sendirian.' },
      ],
      story: 'Rencana 30 hari mengikuti kisah besar—penciptaan, penebusan, gereja, ciptaan baru—bukan kutipan acak.',
      exploreSummary: 'Ingin lebih? Buka empat jalur',
      foot: 'Setiap jalur membuka pembaca berempat bahasa atau dwibahasa.',
      helpWhat: 'Apa ini?',
      helpHow: 'Cara pakai',
      helpWhy: 'Mengapa dibuat',
      auxPacing: 'Tim lari',
      auxQna: 'Tanya jawab',
      auxAi: 'Tutor AI',
      version: 'Perjalanan v{build} · Samakan versi lokal & awan',
      loadFail: 'Data jalur belum termuat. Silakan muat ulang.',
    },
  };

  var HELP_PAGES = {
    what: 'guide-howto.html',
    how: 'guide-howto.html',
    why: 'guide-idea.html',
  };

  var AUX_PAGES = {
    pacing: 'pacing.html',
    qna: 'ai-qna.html',
    ai: 'ai-tutor.html',
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

  function renderFlowSteps() {
    var root = document.getElementById('flowSteps');
    if (!root) return;
    var steps = ui('flowSteps');
    if (!Array.isArray(steps)) return;
    root.innerHTML = steps.map(function (s) {
      return (
        '<li class="landing-flow__step">' +
          '<span class="landing-flow__step-icon" aria-hidden="true">' + esc(s.icon) + '</span>' +
          '<div class="landing-flow__step-body">' +
            '<strong>' + esc(s.title) + '</strong>' +
            '<span>' + esc(s.text) + '</span>' +
          '</div>' +
        '</li>'
      );
    }).join('');
  }

  function applyStatic() {
    document.documentElement.lang = loc() === 'zh-Hant' ? 'zh-Hant' : loc();
    setText('landingTitle', ui('title'));
    setText('landingTagline', ui('tagline'));
    setText('landingLead', ui('lead'));
    setText('statStarsLabel', ui('stars'));
    setText('statStreakLabel', ui('streak'));
    setText('quickEyebrow', ui('quickEyebrow'));
    setText('quickTitle', ui('quickTitle'));
    setText('quickHint', ui('quickHint'));
    setText('reassureText', ui('reassure'));
    setText('flowTitle', ui('flowTitle'));
    setText('storyText', ui('story'));
    setText('exploreSummary', ui('exploreSummary'));
    setText('landingFoot', ui('foot'));
    setText('helpWhatLabel', ui('helpWhat'));
    setText('helpHowLabel', ui('helpHow'));
    setText('helpWhyLabel', ui('helpWhy'));
    setText('auxPacingLabel', ui('auxPacing'));
    setText('auxQnaLabel', ui('auxQna'));
    setText('auxAiLabel', ui('auxAi'));
    var qb = document.getElementById('quickStartBtn');
    if (qb) qb.textContent = ui('quickBtn');
    renderFlowSteps();
    var ver = document.getElementById('landingVersion');
    if (ver) {
      var build = (global.parent && global.parent.B100_SHELL_ASSET_V) || BUILD;
      ver.textContent = String(ui('version')).replace('{build}', build);
    }
  }

  var TRACK_LETTERS = { bible66: 'A', '30day': 'B', golden: 'C', theme: 'D' };

  function renderCards(summaries) {
    applyStatic();
    var st = global.B100Progress ? global.B100Progress.stats() : { stars: 0, streak: 0 };
    var starsEl = document.getElementById('statStars');
    var streakEl = document.getElementById('statStreak');
    if (starsEl) starsEl.textContent = st.stars || 0;
    if (streakEl) streakEl.textContent = st.streak || '0';

    var root = document.getElementById('trackCards');
    if (!root) return;
    root.innerHTML = '';

    summaries.forEach(function (s) {
      var card = document.createElement('article');
      card.className = 'track-card' + (s.error ? ' track-card--err' : '');
      card.style.setProperty('--track-color', s.color || '#818cf8');
      var pct = s.total ? Math.min(100, Math.round((s.done / s.total) * 100)) : 0;
      var letter = TRACK_LETTERS[s.id] || '';
      var title = (letter ? 'Track ' + letter + '：' : '') + (s.title || '');
      if (s.id === 'golden' && s.countNote) title += '（' + s.countNote + '）';
      card.innerHTML =
        '<div class="track-card__head">' +
          '<span class="track-card__emoji">' + esc(s.emoji) + '</span>' +
          '<div class="track-card__titles">' +
            (letter ? '<span class="track-card__letter">Track ' + letter + '</span>' : '') +
            '<h2>' + esc(title) + '</h2>' +
            (s.audience ? '<span class="track-card__audience">' + esc(s.audience) + '</span>' : '') +
          '</div>' +
        '</div>' +
        '<p class="track-card__lead">' + esc(s.lead) + '</p>' +
        '<div class="track-card__progress">' +
          '<div class="track-card__bar"><span style="width:' + pct + '%"></span></div>' +
          '<span class="track-card__prog-text">' + ui('progress') + ' <strong>' + esc(s.progressLabel) + '</strong>' +
            (s.countNote ? ' · <em>' + esc(s.countNote) + '</em>' : '') +
          '</span>' +
        '</div>' +
        '<button type="button" class="track-card__cta">' + ui('enter') + '</button>';
      card.querySelector('.track-card__cta').addEventListener('click', function (ev) {
        ev.stopPropagation();
        if (global.B100TrackRegistry) global.B100TrackRegistry.enterTrack(s.id);
      });
      card.addEventListener('click', function (ev) {
        if (ev.target.closest('.track-card__cta')) return;
        if (global.B100TrackRegistry) global.B100TrackRegistry.enterTrack(s.id);
      });
      root.appendChild(card);
    });
  }

  function goToday() {
    if (global.parent !== global && global.parent.BibleShellNav && global.parent.BibleShellNav.enterTrack) {
      global.parent.BibleShellNav.enterTrack('plan1y');
      return;
    }
    if (global.B100TrackRegistry) {
      global.B100TrackRegistry.enterTrack('plan1y');
      return;
    }
    location.href = 'track-plan1y.html?locale=' + encodeURIComponent(loc());
  }

  function goHelp(kind) {
    var page = HELP_PAGES[kind] || HELP_PAGES.how;
    var l = loc();
    location.href = page + '?locale=' + encodeURIComponent(l);
  }

  function goAux(zone) {
    var page = AUX_PAGES[zone];
    if (!page) return;
    var l = loc();
    location.href = page + '?locale=' + encodeURIComponent(l);
  }

  function bindActions() {
    var btn = document.getElementById('quickStartBtn');
    if (btn && !btn._bound) {
      btn._bound = true;
      btn.addEventListener('click', goToday);
    }
    ['what', 'how', 'why'].forEach(function (kind) {
      var el = document.querySelector('[data-help="' + kind + '"]');
      if (el && !el._bound) {
        el._bound = true;
        el.addEventListener('click', function () { goHelp(kind); });
      }
    });
    ['pacing', 'qna', 'ai'].forEach(function (zone) {
      var el = document.querySelector('[data-aux="' + zone + '"]');
      if (el && !el._bound) {
        el._bound = true;
        el.addEventListener('click', function () { goAux(zone); });
      }
    });
  }

  function init() {
    applyStatic();
    bindActions();
    if (!global.B100TrackRegistry) {
      var root = document.getElementById('trackCards');
      if (root) root.innerHTML = '<p class="landing-fail">' + esc(ui('loadFail')) + '</p>';
      return;
    }
    global.B100TrackRegistry.loadAllSummaries()
      .then(renderCards)
      .catch(function () {
        var root = document.getElementById('trackCards');
        if (root) root.innerHTML = '<p class="landing-fail">' + esc(ui('loadFail')) + '</p>';
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
