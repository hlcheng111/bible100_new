(function (global) {
  var selected = null;

  var UI = {
    'zh-Hant': {
      title: '主題讀經冒險',
      lead: '選一個世界門，跟著故事線一關一關讀下去！',
      prog: ' 關完成',
      detailLead: '跟著故事線一關一關讀，像闖關冒險！',
      readGo: '讀經 →',
      done: '已完成',
      portalTitle: '🚪 選一扇門進入',
      statThemes: '主題',
      statStars: '金星',
      loadFail: '資料載入失敗。請雙擊 <strong>聖經跑道一鍵開啟.vbs</strong>。',
    },
    en: {
      title: 'Thematic Reading Adventure',
      lead: 'Pick a portal and read through the story!',
      prog: ' units done',
      detailLead: 'Read level by level like an adventure!',
      readGo: 'Read →',
      done: 'Done',
      portalTitle: '🚪 Choose a portal',
      statThemes: 'Themes',
      statStars: 'Stars',
      loadFail: 'Load failed. Run <strong>聖經跑道一鍵開啟.vbs</strong>.',
    },
    vi: {
      title: 'Phiêu lưu đọc theo chủ đề',
      lead: 'Chọn cổng và đọc theo câu chuyện!',
      prog: ' màn xong',
      detailLead: 'Đọc từng màn như chinh phục!',
      readGo: 'Đọc →',
      done: 'Xong',
      portalTitle: '🚪 Chọn cổng',
      statThemes: 'Chủ đề',
      statStars: 'Sao',
      loadFail: 'Lỗi tải. Chạy <strong>聖經跑道一鍵開啟.vbs</strong>.',
    },
    id: {
      title: 'Petualangan Baca Bertema',
      lead: 'Pilih portal dan baca mengikuti cerita!',
      prog: ' level selesai',
      detailLead: 'Baca per level seperti petualangan!',
      readGo: 'Baca →',
      done: 'Selesai',
      portalTitle: '🚪 Pilih portal',
      statThemes: 'Tema',
      statStars: 'Bintang',
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

  function pick(row, base) {
    return global.B100LocalePick ? global.B100LocalePick.pick(row, base) : (row[base + 'Zh'] || '');
  }

  function readLink(themeId, u, idx) {
    return global.B100PageLinks
      ? global.B100PageLinks.bibleReadUrl({
        bookId: u.bookId,
        chapter: u.chapter,
        track: 'theme',
        theme: themeId,
        unit: idx,
      })
      : 'bible66.html?book=' + u.bookId + '&chapter=' + u.chapter;
  }

  function doneLink(themeId, u, idx) {
    var label = pick(u, 'label');
    var q = 'track=theme&theme=' + themeId + '&unit=' + idx + '&book=' + u.bookId + '&chapter=' + u.chapter;
    q += '&ref=' + encodeURIComponent(label);
    q += '&locale=' + encodeURIComponent(loc());
    return 'read-done.html?' + q;
  }

  function themeProgress(t) {
    var n = 0;
    (t.units || []).forEach(function (_u, i) {
      if (global.B100Progress.isDone(global.B100Progress.themeUnitId(t.id, i))) n += 1;
    });
    return n;
  }

  function applyStaticUi() {
    document.documentElement.lang = loc() === 'zh-Hant' ? 'zh-Hant' : loc();
    var h1 = document.querySelector('.track-hero h1');
    if (h1) h1.textContent = ui('title');
    var lead = document.querySelector('.track-hero > p:not(.track-hero__mascot)');
    if (lead) lead.textContent = ui('lead');
    var st = document.getElementById('statThemesLabel');
    if (st) st.textContent = ui('statThemes');
    var ss = document.getElementById('statStarsLabel');
    if (ss) ss.textContent = ui('statStars');
    var pt = document.getElementById('portalTitle');
    if (pt) pt.textContent = ui('portalTitle');
  }

  function renderPortals(data) {
    applyStaticUi();
    var root = document.getElementById('themes');
    root.innerHTML = '';
    (data.themes || []).forEach(function (t) {
      var prog = themeProgress(t);
      var total = (t.units || []).length;
      var a = document.createElement('a');
      a.className = 'theme-portal';
      a.href = '#';
      a.style.setProperty('--theme-color', t.color || '#818cf8');
      a.innerHTML =
        '<span class="big">' + (t.emoji || '📖') + '</span>' +
        '<span class="name">' + pick(t, 'name') + '</span>' +
        '<span class="prog">' + prog + ' / ' + total + ui('prog') + '</span>';
      a.addEventListener('click', function (e) {
        e.preventDefault();
        selected = t;
        renderDetail(t);
        document.getElementById('themeDetail').scrollIntoView({ behavior: 'smooth' });
      });
      root.appendChild(a);
    });
  }

  function renderDetail(t) {
    var box = document.getElementById('themeDetail');
    if (!t) { box.hidden = true; return; }
    box.hidden = false;
    box.style.borderColor = t.color || '#c4b5fd';
    var units = t.units || [];
    var html =
      '<h2 style="margin:0 0 8px;color:' + (t.color || '#4338ca') + '">' +
        (t.emoji || '📖') + ' ' + pick(t, 'name') + '</h2>' +
      '<p style="margin:0 0 10px;font-size:13px;color:#64748b">' + ui('detailLead') + '</p>' +
      '<div class="theme-units">';
    units.forEach(function (u, i) {
      var done = global.B100Progress.isDone(global.B100Progress.themeUnitId(t.id, i));
      var label = pick(u, 'label');
      html +=
        '<a class="theme-unit' + (done ? ' done' : '') + '" href="' + readLink(t.id, u, i) + '" style="--theme-color:' + (t.color || '#818cf8') + '">' +
          '<span class="step">' + (done ? '✓' : (i + 1)) + '</span>' +
          '<span><strong>' + label + '</strong>' +
            (done ? ' <span style="color:#16a34a;font-size:11px">' + ui('done') + '</span>' : '') +
          '</span>' +
          '<span style="margin-left:auto;font-size:11px;color:#6366f1">' + ui('readGo') + '</span>' +
        '</a>';
    });
    html += '</div>';
    box.innerHTML = html;
  }

  function init() {
    var load = global.B100DataLoader
      ? global.B100DataLoader.thematic()
      : fetch('../data/thematic_readings.json').then(function (r) { return r.json(); });
    load.then(function (data) {
      applyStaticUi();
      document.getElementById('statThemes').textContent = (data.themes || []).length;
      document.getElementById('statStars').textContent = global.B100Progress.stats().stars;
      renderPortals(data);
      var focus = new URLSearchParams(location.search).get('focus');
      if (focus) {
        var t = (data.themes || []).find(function (x) { return x.id === focus; });
        if (t) {
          selected = t;
          renderDetail(t);
          document.getElementById('themeDetail').hidden = false;
        }
      }
    }).catch(function () {
      document.getElementById('themes').innerHTML = '<p style="color:#b45309">' + ui('loadFail') + '</p>';
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
