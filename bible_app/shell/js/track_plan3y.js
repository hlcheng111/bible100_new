/**
 * 三年教會年 · 甲/乙/丙 + 節期 + 月 + 每日經課（列表，手機友好）
 */
(function (global) {
  var plan = null;
  var yearId = 'A';
  var seasonId = 'all';
  var monthFilter = 0;

  var UI = {
    'zh-Hant': {
      pickYear: '① 選教會年',
      pickSeason: '② 選節期',
      pickMonth: '③ 選月份',
      dailyList: '④ 每日經課',
      howto: '怎麼開始？',
      rulesSummary: '操作說明',
      statStars: '金星',
      statStreak: '連續天',
      statProg: '進度',
      start: '📖 開始讀經',
      done: '🎉 讀完打卡',
      allSeasons: '全部節期',
      loadFail: '資料載入失敗。請雙擊 <strong>打開聖經跑道.bat</strong>。',
      dayUnit: ' 天',
    },
    en: {
      pickYear: '① Church year',
      pickSeason: '② Season',
      pickMonth: '③ Month',
      dailyList: '④ Daily readings',
      howto: 'How to start',
      rulesSummary: 'Instructions',
      statStars: 'Stars',
      statStreak: 'Streak',
      statProg: 'Progress',
      start: '📖 Read',
      done: '🎉 Done',
      allSeasons: 'All seasons',
      loadFail: 'Load failed.',
      dayUnit: '',
    },
  };

  function loc() {
    return global.B100LocalePick ? global.B100LocalePick.getLocale() : (new URLSearchParams(location.search).get('locale') || 'zh-Hant');
  }

  function ui(key) {
    var pack = UI[loc()] || UI['zh-Hant'];
    return pack[key] || UI['zh-Hant'][key] || key;
  }

  function pick(row, base) {
    return global.B100LocalePick ? global.B100LocalePick.pick(row, base) : (row[base + 'Zh'] || row[base + 'En'] || '');
  }

  function progressId(dayKey) {
    return '3y:' + yearId + ':' + dayKey;
  }

  function dayParam(d) {
    return yearId + ':' + d.day;
  }

  function readLink(d, bookId, chapter) {
    var day = dayParam(d);
    if (global.B100PageLinks) {
      return global.B100PageLinks.bibleReadUrl({ bookId: bookId, chapter: chapter, track: 'plan3y', day: day, locale: loc() });
    }
    return 'bible66.html?book=' + bookId + '&chapter=' + chapter + '&track=plan3y&day=' + encodeURIComponent(day) + '&locale=' + encodeURIComponent(loc());
  }

  function doneLink(d, bookId, chapter, title) {
    var day = dayParam(d);
    var q = 'track=plan3y&day=' + encodeURIComponent(day) + '&book=' + bookId + '&chapter=' + chapter;
    q += '&ref=' + encodeURIComponent(title || '');
    q += '&locale=' + encodeURIComponent(loc());
    return 'read-done.html?' + q;
  }

  function segmentLabel(seg) {
    if (global.B100LocalePick) return global.B100LocalePick.bookChapterRef(seg.bookId, seg.chapter, loc());
    return pick(seg, 'ref') || ('B' + seg.bookId + ' ' + seg.chapter);
  }

  function daySummary(d) {
    var segs = d.segments || [];
    return segs.map(segmentLabel).join(' · ');
  }

  function currentYear() {
    if (!plan || !plan.years) return null;
    for (var i = 0; i < plan.years.length; i++) {
      if (plan.years[i].id === yearId) return plan.years[i];
    }
    return plan.years[0];
  }

  function readingsForSeason() {
    var y = currentYear();
    if (!y) return [];
    return (y.readings || []).filter(function (d) {
      if (seasonId !== 'all' && d.seasonId !== seasonId) return false;
      return true;
    });
  }

  function filteredReadings() {
    return readingsForSeason().filter(function (d) {
      if (monthFilter && d.month !== monthFilter) return false;
      return true;
    });
  }

  function renderRules() {
    var box = document.getElementById('planRules');
    if (!box || !plan) return;
    box.innerHTML =
      '<details id="planRulesDetails">' +
      '<summary><strong>' + ui('rulesSummary') + '</strong></summary>' +
      '<p class="plan-rules-note">' + pick(plan, 'rules') + '</p>' +
      '<ul class="plan-rules">' +
      '<li>① 選甲/乙/丙年（馬太/馬可/路加福音輪替）</li>' +
      '<li>② 選教會節期（將臨→聖誕→顯現→大齋→復活→五旬→常期）</li>' +
      '<li>③ 點每日列：詩篇 + 舊約 + 福音 → 讀完打卡</li>' +
      '</ul></details>';
  }

  function renderYearTabs() {
    var root = document.getElementById('yearTabs');
    if (!root || !plan) return;
    root.innerHTML = '<span class="plan-layer-label">' + ui('pickYear') + '</span>';
    plan.years.forEach(function (y) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'plan-layer-tab' + (y.id === yearId ? ' on' : '');
      btn.textContent = pick(y, 'name');
      btn.addEventListener('click', function () {
        yearId = y.id;
        renderAll();
      });
      root.appendChild(btn);
    });
  }

  function renderSeasonTabs() {
    var root = document.getElementById('seasonTabs');
    if (!root || !plan) return;
    root.innerHTML = '<span class="plan-layer-label">' + ui('pickSeason') + '</span>';
    function add(id, label, emoji) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'plan-layer-tab' + (seasonId === id ? ' on' : '');
      btn.textContent = (emoji ? emoji + ' ' : '') + label;
      btn.addEventListener('click', function () {
        seasonId = id;
        monthFilter = 0;
        renderAll();
      });
      root.appendChild(btn);
    }
    add('all', ui('allSeasons'), '✨');
    (plan.seasons || []).forEach(function (s) {
      add(s.id, pick(s, 'name'), s.emoji);
    });
  }

  function renderMonthTabs(readings) {
    var root = document.getElementById('monthTabs');
    if (!root) return;
    var months = {};
    readings.forEach(function (d) { months[d.month] = true; });
    var keys = Object.keys(months).map(Number).sort(function (a, b) { return a - b; });
    root.innerHTML = '<span class="plan-layer-label">' + ui('pickMonth') + '</span>';
    keys.forEach(function (m) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'month-tab' + (monthFilter === m ? ' on' : '');
      btn.textContent = (loc() === 'en' ? 'Month ' : '第 ') + m + (loc() === 'en' ? '' : ' 月');
      btn.addEventListener('click', function () {
        monthFilter = monthFilter === m ? 0 : m;
        renderAll();
      });
      root.appendChild(btn);
    });
  }

  function renderDayList(readings) {
    var root = document.getElementById('dayList');
    var title = document.getElementById('dailyTitle');
    if (title) title.textContent = ui('dailyList');
    if (!root) return;
    root.innerHTML = '';
    readings.forEach(function (d) {
      var id = progressId(d.day);
      var done = global.B100Progress.isDone(id);
      var row = document.createElement('div');
      row.className = 'plan-day-row' + (done ? ' done' : '');
      var segs = (d.segments || []).map(function (seg) {
        return '<a class="plan-day-row__seg" href="' + readLink(d, seg.bookId, seg.chapter) + '">' +
          '<span class="plan-seg-kind seg-' + (seg.kind || 'ot') + '">' + pick(seg, 'label') + '</span> ' +
          segmentLabel(seg) + '</a>';
      }).join('');
      row.innerHTML =
        '<div class="plan-day-row__head">' +
          '<span class="plan-day-row__title">' + pick(d, 'title') + '</span>' +
          '<a class="btn-track btn-done plan-day-row__go" href="' + readLink(d, d.bookId, d.chapter) + '">' + ui('start') + '</a>' +
        '</div>' +
        '<div class="plan-day-row__segs">' + segs + '</div>' +
        '<div class="plan-day-row__foot">' +
          '<a class="btn-track btn-ai" href="' + doneLink(d, d.bookId, d.chapter, pick(d, 'title')) + '">' + ui('done') + '</a>' +
        '</div>';
      root.appendChild(row);
    });
  }

  function renderAll() {
    if (!plan) return;
    var y = currentYear();
    var readings = filteredReadings();
    var doneN = 0;
    (y.readings || []).forEach(function (d) {
      if (global.B100Progress.isDone(progressId(d.day))) doneN++;
    });
    document.getElementById('statDone').textContent = doneN + ' / ' + (y.totalDays || readings.length);
    document.getElementById('statStars').textContent = global.B100Progress.stats().stars;
    document.getElementById('statStreak').textContent = global.B100Progress.stats().streak || '—';
    renderRules();
    renderYearTabs();
    renderSeasonTabs();
    renderMonthTabs(readingsForSeason());
    renderDayList(readings);
  }

  function init() {
    var run = function () {
      var load = global.B100DataLoader
        ? global.B100DataLoader.lectionary()
        : fetch('../data/lectionary_plan.json').then(function (r) { return r.json(); });
      load.then(function (data) {
        plan = data;
        var h1 = document.querySelector('.track-hero h1');
        if (h1) h1.textContent = pick(plan, 'name');
        renderAll();
      }).catch(function () {
        var el = document.getElementById('dayList');
        if (el) el.innerHTML = '<p style="color:#b45309">' + ui('loadFail') + '</p>';
      });
      var howBtn = document.getElementById('btnHowto');
      if (howBtn) {
        howBtn.addEventListener('click', function () {
          var det = document.getElementById('planRulesDetails');
          if (det) { det.open = true; det.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
        });
      }
    };
    if (global.B100LiveDb && global.B100LiveDb.afterLiveProbe) {
      global.B100LiveDb.afterLiveProbe(run);
    } else {
      run();
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})(window);
