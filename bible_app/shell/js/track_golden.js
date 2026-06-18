(function (global) {
  var UI = {
    'zh-Hant': {
      title: '四十句金句藏寶圖',
      lead: '點卡片翻面猜經節 · 讀經背誦 · 收集金星（共 40 句）',
      deck: '🃏 金句卡 deck（點一下翻面）',
      flipHint: '點一下翻面',
      collected: '已收集',
      ofStars: '顆金星',
      statStars: '總金星',
      start: '📖 開始讀經',
      done: '🎉 背到了',
      doneMark: '已背到 ⭐',
      loadFail: '資料載入失敗。請雙擊 <strong>聖經跑道一鍵開啟.vbs</strong>。',
    },
    en: {
      title: '40 Golden Verses Treasure Map',
      lead: 'Flip cards · read · memorize · collect stars (40 verses)',
      deck: '🃏 Verse cards (tap to flip)',
      flipHint: 'Tap to flip',
      collected: 'Collected',
      ofStars: 'stars',
      statStars: 'Total stars',
      start: '📖 Start reading',
      done: '🎉 Memorized',
      doneMark: 'Done ⭐',
      loadFail: 'Load failed. Run <strong>聖經跑道一鍵開啟.vbs</strong>.',
    },
    vi: {
      title: 'Bản đồ 40 câu vàng',
      lead: 'Lật thẻ · đọc · thuộc · gom sao (40 câu)',
      deck: '🃏 Bộ thẻ Kinh (chạm để lật)',
      flipHint: 'Chạm để lật',
      collected: 'Đã gom',
      ofStars: 'sao',
      statStars: 'Tổng sao',
      start: '📖 Bắt đầu đọc',
      done: '🎉 Thuộc rồi',
      doneMark: 'Xong ⭐',
      loadFail: 'Lỗi tải. Chạy <strong>聖經跑道一鍵開啟.vbs</strong>.',
    },
    id: {
      title: 'Peta 40 Ayat Emas',
      lead: 'Balik kartu · baca · hafal · kumpulkan bintang (40 ayat)',
      deck: '🃏 Kartu ayat (ketuk untuk balik)',
      flipHint: 'Ketuk untuk balik',
      collected: 'Terkumpul',
      ofStars: 'bintang',
      statStars: 'Total bintang',
      start: '📖 Mulai baca',
      done: '🎉 Sudah hafal',
      doneMark: 'Selesai ⭐',
      loadFail: 'Gagal memuat. Jalankan <strong>聖經跑道一鍵開啟.vbs</strong>.',
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

  function esc(s) {
    if (!s) return '';
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
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

  function applyStaticUi() {
    document.documentElement.lang = loc() === 'zh-Hant' ? 'zh-Hant' : loc();
    var h1 = document.querySelector('.track-hero h1');
    if (h1) h1.textContent = ui('title');
    var lead = document.querySelector('.track-hero > p:not(.track-hero__mascot)');
    if (lead) lead.textContent = ui('lead');
    var h2 = document.getElementById('deckTitle');
    if (h2) h2.textContent = ui('deck');
    var statLabel = document.getElementById('statStarsLabel');
    if (statLabel) statLabel.textContent = ui('statStars');
  }

  function render(data) {
    applyStaticUi();
    var list = data.verses || [];
    var goal = list.length || 40;
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

    var root = document.getElementById('verses');
    root.innerHTML = '';
    list.forEach(function (v) {
      var done = global.B100Progress.isDone(global.B100Progress.goldenId(v.id));
      var ref = global.B100LocalePick ? global.B100LocalePick.pickRef(v) : v.refZh;
      var tag = global.B100LocalePick ? global.B100LocalePick.pick(v, 'tag') : (v.tagZh || '');
      var card = document.createElement('div');
      card.className = 'golden-card' + (done ? ' done flipped' : '');
      card.innerHTML =
        '<div class="golden-card__inner">' +
          '<div class="golden-card__face">' +
            '<span class="spark">✨</span>' +
            '<span class="ref">???</span>' +
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

  function init() {
    var load = global.B100DataLoader
      ? global.B100DataLoader.golden()
      : fetch('../data/golden_verses_100.json').then(function (r) { return r.json(); });
    load.then(render).catch(function () {
      var el = document.getElementById('verses');
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
