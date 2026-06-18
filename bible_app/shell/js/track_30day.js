(function (global) {
  var UI = {
    'zh-Hant': {
      title: '三十日讀經大冒險',
      lead: '從創造到新天新地 · 每天一顆旅程石 · 連續打卡有火焰 🔥',
      stones: '🗺️ 三十顆旅程石',
      foot: '讀完當天經文後，點「讀完打卡」可獲金星，並跳到 AI 創作工具。',
      today: '今天：第 ',
      dayUnit: ' 天',
      start: '📖 開始讀經',
      done: '🎉 讀完打卡',
      statStars: '金星',
      statStreak: '連續天',
      statProg: '進度',
      loadFail: '資料載入失敗。請雙擊 <strong>打開聖經跑道.bat</strong>。',
    },
    en: {
      title: '30-Day Bible Adventure',
      lead: 'Creation to new heaven and earth · one stone per day · streak flame 🔥',
      stones: '🗺️ 30 journey stones',
      foot: 'After reading, tap Done for a star and AI tools.',
      today: 'Today: Day ',
      dayUnit: '',
      start: '📖 Start reading',
      done: '🎉 Mark done',
      statStars: 'Stars',
      statStreak: 'Streak',
      statProg: 'Progress',
      loadFail: 'Load failed. Run <strong>打開聖經跑道.bat</strong>.',
    },
    vi: {
      title: 'Cuộc phiêu lưu 30 ngày',
      lead: 'Sáng thế đến trời mới · mỗi ngày một viên đá · chuỗi ngày 🔥',
      stones: '🗺️ 30 viên đá hành trình',
      foot: 'Đọc xong, bấm Hoàn thành để nhận sao và công cụ AI.',
      today: 'Hôm nay: Ngày ',
      dayUnit: '',
      start: '📖 Bắt đầu đọc',
      done: '🎉 Đã đọc xong',
      statStars: 'Sao',
      statStreak: 'Chuỗi',
      statProg: 'Tiến độ',
      loadFail: 'Lỗi tải dữ liệu. Chạy <strong>打開聖經跑道.bat</strong>.',
    },
    id: {
      title: 'Petualangan 30 Hari',
      lead: 'Penciptaan sampai langit baru · satu batu per hari · streak 🔥',
      stones: '🗺️ 30 batu perjalanan',
      foot: 'Setelah baca, ketuk Selesai untuk bintang dan alat AI.',
      today: 'Hari ini: Hari ',
      dayUnit: '',
      start: '📖 Mulai baca',
      done: '🎉 Tandai selesai',
      statStars: 'Bintang',
      statStreak: 'Beruntun',
      statProg: 'Progres',
      loadFail: 'Gagal memuat. Jalankan <strong>打開聖經跑道.bat</strong>.',
    },
  };

  function loc() {
    return global.B100LocalePick
      ? global.B100LocalePick.getLocale()
      : (new URLSearchParams(location.search).get('locale') || 'zh-Hant');
  }

  function ui(key) {
    var pack = UI[loc()] || UI['zh-Hant'];
    return pack[key] || UI['zh-Hant'][key] || key;
  }

  function pick(row, base) {
    return global.B100LocalePick ? global.B100LocalePick.pick(row, base) : (row[base + 'Zh'] || '');
  }

  function readLink(day, bookId, chapter) {
    return global.B100PageLinks
      ? global.B100PageLinks.bibleReadUrl({ bookId: bookId, chapter: chapter, track: '30day', day: day })
      : 'bible66.html?book=' + bookId + '&chapter=' + chapter + '&track=30day&day=' + day;
  }

  function doneLink(day, bookId, chapter, title) {
    var q = 'track=30day&day=' + day + '&book=' + bookId + '&chapter=' + chapter;
    q += '&ref=' + encodeURIComponent(title || ('Day ' + day));
    q += '&locale=' + encodeURIComponent(loc());
    return 'read-done.html?' + q;
  }

  function applyStaticUi() {
    document.documentElement.lang = loc() === 'zh-Hant' ? 'zh-Hant' : loc();
    var h1 = document.querySelector('.track-hero h1');
    if (h1) h1.textContent = ui('title');
    var lead = document.querySelector('.track-hero > p:not(.track-hero__mascot)');
    if (lead) lead.textContent = ui('lead');
    var h2 = document.querySelector('.track-page > h2');
    if (h2) h2.textContent = ui('stones');
    var foot = document.querySelector('.track-page > p:last-of-type');
    if (foot && foot.id !== 'fileNote') foot.textContent = ui('foot');
  }

  function suggestToday(doneMap, days) {
    for (var i = 0; i < days.length; i++) {
      var d = days[i];
      if (!doneMap[global.B100Progress.dayId(d.day)]) return d.day;
    }
    return days.length ? days[days.length - 1].day : 1;
  }

  function render(plan) {
    applyStaticUi();
    var days = plan.days || [];
    var root = document.getElementById('days');
    var st = global.B100Progress.stats();
    var doneN = global.B100Progress.countDone('30d:');
    var today = suggestToday(global.B100Progress.load().done, days);
    var locale = loc();

    document.getElementById('statStars').textContent = st.stars;
    document.getElementById('statStreak').textContent = st.streak || '—';
    document.getElementById('statDone').textContent = doneN + ' / ' + days.length;

    root.innerHTML = '';
    days.forEach(function (d) {
      var id = global.B100Progress.dayId(d.day);
      var done = global.B100Progress.isDone(id);
      var isToday = d.day === today;
      var title = pick(d, 'title');
      var ref = global.B100LocalePick
        ? global.B100LocalePick.bookChapterRef(d.bookId, d.chapter, locale)
        : '';
      var a = document.createElement('a');
      a.className = 'journey-stone' + (done ? ' done' : '') + (isToday && !done ? ' today' : '');
      a.href = readLink(d.day, d.bookId, d.chapter);
      a.title = title + (ref ? ' · ' + ref : '');
      a.innerHTML =
        '<span class="ico">' + (done ? '✅' : isToday ? '🔥' : '📖') + '</span>' +
        '<span class="num">' + d.day + '</span>' +
        '<span class="mini">' + title + '</span>' +
        (ref ? '<span class="mini ref">' + ref + '</span>' : '');
      root.appendChild(a);
    });

    var hero = document.getElementById('todayHero');
    if (hero) {
      var cur = null;
      for (var j = 0; j < days.length; j++) {
        if (days[j].day === today) { cur = days[j]; break; }
      }
      if (!cur) cur = days[0];
      if (cur) {
        var tTitle = pick(cur, 'title');
        var tHint = pick(cur, 'hint');
        var tRef = global.B100LocalePick
          ? global.B100LocalePick.bookChapterRef(cur.bookId, cur.chapter, locale)
          : '';
        hero.innerHTML =
          '<p class="track-hero__mascot">🦁</p>' +
          '<h2>' + ui('today') + cur.day + ui('dayUnit') + '</h2>' +
          '<p><strong>' + tTitle + '</strong>' +
            (tRef ? ' · <span style="color:#4338ca">' + tRef + '</span>' : '') +
            (tHint ? ' · ' + tHint : '') + '</p>' +
          '<div class="b66-actions">' +
            '<a class="btn-track btn-done" href="' + readLink(cur.day, cur.bookId, cur.chapter) + '">' + ui('start') + '</a>' +
            '<a class="btn-track btn-ai" href="' + doneLink(cur.day, cur.bookId, cur.chapter, tTitle) + '">' + ui('done') + '</a>' +
          '</div>';
      }
    }
  }

  function init() {
    var load = global.B100DataLoader
      ? global.B100DataLoader.thirtyDay()
      : fetch('../data/thirty_day_plan.json').then(function (r) { return r.json(); });
    load.then(render).catch(function () {
      var el = document.getElementById('days');
      if (el) el.innerHTML = '<p style="color:#b45309">' + ui('loadFail') + '</p>';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  window.addEventListener('pageshow', function (ev) {
    if (ev.persisted) init();
  });
})(window);
