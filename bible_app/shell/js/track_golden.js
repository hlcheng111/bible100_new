(function (global) {
  var activeGroup = 'all';

  var UI = {
    'zh-Hant': {
      title: '100 金句選',
      lead: '100 個主題軸 · 點主題篩選 · 卡片正面看主題、翻面看經節 · 收集金星',
      deck: '🃏 金句卡（正面＝主題軸，點一下翻面看經節）',
      flipHint: '點一下看經節',
      allGroups: '全部',
      collected: '已收集',
      ofStars: '顆金星',
      statStars: '總金星',
      start: '📖 開始讀經',
      done: '🎉 背到了',
      doneMark: '已背到 ⭐',
      loadFail: '資料載入失敗。請雙擊 <strong>聖經跑道一鍵開啟.vbs</strong>。',
    },
    en: {
      title: '100 Golden Verses',
      lead: '100 theme axes · filter by topic · front shows theme, flip for reference · collect stars',
      deck: '🃏 Verse cards (front = theme, tap to flip for reference)',
      flipHint: 'Tap for reference',
      allGroups: 'All',
      collected: 'Collected',
      ofStars: 'stars',
      statStars: 'Total stars',
      start: '📖 Start reading',
      done: '🎉 Memorized',
      doneMark: 'Done ⭐',
      loadFail: 'Load failed. Run <strong>聖經跑道一鍵開啟.vbs</strong>.',
    },
    vi: {
      title: '100 câu vàng',
      lead: '100 chủ đề · lọc theo nhóm · mặt trước = chủ đề · lật xem câu Kinh',
      deck: '🃏 Thẻ (mặt trước = chủ đề, chạm để lật)',
      flipHint: 'Chạm xem câu',
      allGroups: 'Tất cả',
      collected: 'Đã gom',
      ofStars: 'sao',
      statStars: 'Tổng sao',
      start: '📖 Bắt đầu đọc',
      done: '🎉 Thuộc rồi',
      doneMark: 'Xong ⭐',
      loadFail: 'Lỗi tải. Chạy <strong>聖經跑道一鍵開啟.vbs</strong>.',
    },
    id: {
      title: '100 Ayat Emas',
      lead: '100 tema · saring topik · depan = tema · balik untuk rujukan',
      deck: '🃏 Kartu (depan = tema, ketuk untuk balik)',
      flipHint: 'Ketuk untuk rujukan',
      allGroups: 'Semua',
      collected: 'Terkumpul',
      ofStars: 'bintang',
      statStars: 'Total bintang',
      start: '📖 Mulai baca',
      done: '🎉 Sudah hafal',
      doneMark: 'Selesai ⭐',
      loadFail: 'Gagal memuat. Jalankan <strong>聖經跑道一鍵開啟.vbs</strong>.',
    },
  };

  var cachedData = null;

  function loc() {
    return global.B100LocalePick
      ? global.B100LocalePick.getLocale()
      : (new URLSearchParams(location.search).get('locale') || 'zh-Hant');
  }

  function ui(key) {
    var pack = UI[loc()] || UI['zh-Hant'];
    return pack[key] || UI['zh-Hant'][key] || key;
  }

  function esc(s) {
    if (!s) return '';
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function groupLabel(g) {
    if (global.B100LocalePick) {
      return global.B100LocalePick.pick(g, 'name') || g.nameZh;
    }
    return loc() === 'en' ? (g.nameEn || g.nameZh) : g.nameZh;
  }

  function readLink(v) {
    return global.B100PageLinks
      ? global.B100PageLinks.bibleReadUrl({
        bookId: v.bookId,
        chapter: v.chapter,
        verse: v.verse,
        track: 'golden',
        gv: v.id,
      })
      : 'bible66.html?book=' + v.bookId + '&chapter=' + v.chapter + '&verse=' + v.verse + '&track=golden&gv=' + v.id;
  }

  function doneLink(v) {
    var ref = global.B100LocalePick ? global.B100LocalePick.pickRef(v) : v.refZh;
    var q = 'track=golden&gv=' + v.id + '&book=' + v.bookId + '&chapter=' + v.chapter + '&verse=' + v.verse;
    q += '&ref=' + encodeURIComponent(ref);
    q += '&locale=' + encodeURIComponent(loc());
    return 'read-done.html?' + q;
  }

  function applyStaticUi(data) {
    document.documentElement.lang = loc() === 'zh-Hant' ? 'zh-Hant' : loc();
    document.title = ui('title');
    var h1 = document.querySelector('.track-hero h1');
    if (h1) h1.textContent = pickName(data) || ui('title');
    var lead = document.querySelector('.track-hero > p:not(.track-hero__mascot)');
    if (lead) lead.textContent = ui('lead');
    var h2 = document.getElementById('deckTitle');
    if (h2) h2.textContent = ui('deck');
    var statLabel = document.getElementById('statStarsLabel');
    if (statLabel) statLabel.textContent = ui('statStars');
  }

  function pickName(data) {
    if (global.B100LocalePick) return global.B100LocalePick.pick(data, 'name');
    return loc() === 'en' ? data.nameEn : data.nameZh;
  }

  function renderGroups(data) {
    var tabs = document.getElementById('goldenGroups');
    if (!tabs) return;
    var groups = data.themeGroups || [];
    tabs.innerHTML = '';
    function addTab(id, label, emoji) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'golden-group-tab' + (activeGroup === id ? ' on' : '');
      btn.textContent = (emoji ? emoji + ' ' : '') + label;
      btn.addEventListener('click', function () {
        activeGroup = id;
        renderGroups(data);
        renderCards(data);
      });
      tabs.appendChild(btn);
    }
    addTab('all', ui('allGroups'), '✨');
    groups.forEach(function (g) {
      addTab(g.id, groupLabel(g), g.emoji || '');
    });
  }

  function renderCards(data) {
    var list = data.verses || [];
    var goal = data.targetCount || list.length || 100;
    var doneN = global.B100Progress.countDone('gv:');
    var pct = Math.min(100, Math.round((doneN / goal) * 100));
    var ring = document.getElementById('goldenRing');
    if (ring) {
      ring.style.setProperty('--pct', pct + '%');
      ring.querySelector('span').textContent = doneN;
    }
    var countEl = document.getElementById('count');
    if (countEl) {
      countEl.textContent = ui('collected') + ' ' + doneN + ' / ' + goal + ' ' + ui('ofStars');
    }
    var statEl = document.getElementById('statStars');
    if (statEl) statEl.textContent = global.B100Progress.stats().stars;

    var filtered = list;
    if (activeGroup !== 'all') {
      filtered = list.filter(function (v) { return v.groupId === activeGroup; });
    }

    var root = document.getElementById('verses');
    root.innerHTML = '';
    filtered.forEach(function (v) {
      var done = global.B100Progress.isDone(global.B100Progress.goldenId(v.id));
      var ref = global.B100LocalePick ? global.B100LocalePick.pickRef(v) : v.refZh;
      var tag = global.B100LocalePick ? global.B100LocalePick.pick(v, 'tag') : (v.tagZh || '');
      var card = document.createElement('div');
      card.className = 'golden-card' + (done ? ' done flipped' : '');
      card.innerHTML =
        '<div class="golden-card__inner">' +
          '<div class="golden-card__face">' +
            '<span class="spark">✨</span>' +
            '<span class="ref golden-card__theme">' + esc(tag) + '</span>' +
            '<span class="tag">' + esc(ui('flipHint')) + '</span>' +
          '</div>' +
          '<div class="golden-card__face golden-card__back">' +
            '<span class="ref">' + esc(ref) + '</span>' +
            '<span class="tag">' + esc(tag) + '</span>' +
            '<div class="golden-card__actions">' +
              '<a class="btn-track btn-done" href="' + readLink(v) + '">' + esc(ui('start')) + '</a>' +
              (done
                ? '<span class="golden-done-mark">' + esc(ui('doneMark')) + '</span>'
                : '<a class="btn-track btn-ai" href="' + doneLink(v) + '">' + esc(ui('done')) + '</a>') +
            '</div>' +
          '</div>' +
        '</div>';
      card.addEventListener('click', function (e) {
        if (e.target.closest('a')) return;
        card.classList.toggle('flipped');
      });
      root.appendChild(card);
    });
  }

  function render(data) {
    cachedData = data;
    applyStaticUi(data);
    renderGroups(data);
    renderCards(data);
  }

  function init() {
    var run = function () {
      var load = global.B100DataLoader
        ? global.B100DataLoader.golden()
        : fetch('../data/golden_verses_100.json').then(function (r) { return r.json(); });
      load.then(render).catch(function () {
        var el = document.getElementById('verses');
        if (el) el.innerHTML = '<p style="color:#b45309">' + ui('loadFail') + '</p>';
      });
    };
    if (global.B100LiveDb && global.B100LiveDb.afterLiveProbe) {
      global.B100LiveDb.afterLiveProbe(run);
    } else {
      run();
    }
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
