/**
 * 一年 / 三年讀經計劃 · 月曆彩色格 + 每日段落（詩 + 舊約類 + 新約類）
 * 設定 window.B100_PLAN_KEY = 'plan1y' | 'plan3y'
 */
(function (global) {
  var PLANS = {
    plan1y: {
      track: 'plan1y',
      prefix: '1y:',
      loader: function () {
        return global.B100DataLoader ? global.B100DataLoader.plan1y() : fetch('../data/one_year_plan.json').then(function (r) { return r.json(); });
      },
    },
    plan3y: {
      track: 'plan3y',
      prefix: '3y:',
      loader: function () {
        return global.B100DataLoader ? global.B100DataLoader.plan3y() : fetch('../data/three_year_plan.json').then(function (r) { return r.json(); });
      },
    },
  };

  var UI = {
    'zh-Hant': {
      statStars: '金星',
      statStreak: '連續天',
      statProg: '進度',
      today: '今天：第 ',
      dayUnit: ' 天',
      start: '📖 開始讀經',
      done: '🎉 讀完打卡',
      calendar: '📅 每月讀經表',
      segments: '今日段落',
      rulesTitle: '怎麼開始？',
      rulesSummary: '操作說明',
      rules: [
        '① 按「開始今日關卡」或下方彩色格選一天',
        '② 依序讀完当日全部章节（按书卷顺序）',
        '③ 读完后点「读完打卡」→ +1 金星，已读章计入进度',
        '🔥 连续天：有打卡的日历连续天数；断更欢迎回来',
      ],
      loadFail: '资料加载失败。请双击 <strong>打开圣经跑道.bat</strong>。',
      month: '第 {m} 月',
      calHint: '点选日期可看当日应读经卷；窄屏以列表显示。',
      journeyHint: '小图标 = 最近几天：✅ 已打卡 · 🔥 今天 · 📖 未读',
      freeExplore: '進階：譯本對照 / 釋經參讀 →',
    },
    en: {
      statStars: 'Stars',
      statStreak: 'Streak',
      statProg: 'Progress',
      today: 'Today: Day ',
      dayUnit: '',
      start: '📖 Start reading',
      done: '🎉 Mark done',
      calendar: '📅 Monthly grid',
      segments: "Today's passages",
      rulesTitle: 'How to start',
      rulesSummary: 'Instructions',
      rules: [
        '① Tap today\'s cell or "Start reading"',
        '② Read Psalm → OT → NT in order',
        '③ Tap "Mark done" → +1 star',
        '🔥 Streak counts days you check in; gaps are OK',
      ],
      loadFail: 'Load failed. Run the local server bat file.',
      month: 'Month {m}',
      freeExplore: 'Free explore → 66 Books map',
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

  function planId() {
    return global.B100_PLAN_KEY || 'plan1y';
  }

  function planCfg() {
    return PLANS[planId()] || PLANS.plan1y;
  }

  function progressId(day) {
    return planCfg().prefix + day;
  }

  function readLink(day, bookId, chapter) {
    var cfg = planCfg();
    if (global.B100PageLinks) {
      return global.B100PageLinks.bibleReadUrl({ bookId: bookId, chapter: chapter, track: cfg.track, day: day });
    }
    return 'bible66.html?book=' + bookId + '&chapter=' + chapter + '&track=' + cfg.track + '&day=' + day;
  }

  function doneLink(day, bookId, chapter, title) {
    var cfg = planCfg();
    var q = 'track=' + cfg.track + '&day=' + day + '&book=' + bookId + '&chapter=' + chapter;
    q += '&ref=' + encodeURIComponent(title || ('Day ' + day));
    q += '&locale=' + encodeURIComponent(loc());
    return 'read-done.html?' + q;
  }

  function suggestToday(doneMap, days) {
    for (var i = 0; i < days.length; i++) {
      if (!doneMap[progressId(days[i].day)]) return days[i].day;
    }
    return days.length ? days[days.length - 1].day : 1;
  }

  function daySummary(d) {
    var segs = d.segments || [];
    if (!segs.length) {
      return global.B100LocalePick
        ? global.B100LocalePick.bookChapterRef(d.bookId, d.chapter, loc())
        : pick(d, 'title');
    }
    return segs.map(function (seg) {
      return global.B100LocalePick
        ? global.B100LocalePick.bookChapterRef(seg.bookId, seg.chapter, loc())
        : (pick(seg, 'label') + ' ' + seg.chapter);
    }).join(' · ');
  }

  function isMobileList() {
    return global.matchMedia && global.matchMedia('(max-width: 720px)').matches;
  }

  var CAT_CLASS = {
    law: 'cat-law', history: 'cat-history', poetry: 'cat-poetry',
    major_prophet: 'cat-major', minor_prophet: 'cat-minor',
    gospel: 'cat-gospel', nt_history: 'cat-acts', paul: 'cat-paul',
    general: 'cat-general', prophecy: 'cat-revelation',
  };

  function chipClass(seg) {
    if (seg.category && CAT_CLASS[seg.category]) return CAT_CLASS[seg.category];
    if (seg.bookId <= 39) return 'cat-ot';
    return 'cat-nt';
  }

  function shortRef(seg) {
    if (global.B100LocalePick) {
      var full = global.B100LocalePick.bookChapterRef(seg.bookId, seg.chapter, loc());
      return full.replace(/\s*章\s*$/, '').replace(/\s+chapter\s*$/i, '');
    }
    return 'B' + seg.bookId + ' ' + seg.chapter;
  }

  function chipsHtml(segs, limit) {
    limit = limit || 3;
    return (segs || []).slice(0, limit).map(function (seg) {
      return '<span class="plan-chip ' + chipClass(seg) + '" title="' + segmentLabel(seg) + '">' + shortRef(seg) + '</span>';
    }).join('');
  }

  function renderRules(plan) {
    var box = document.getElementById('planRules');
    if (!box) return;
    var rules;
    if (plan.schema === 'one_year_books') {
      rules = loc() === 'en'
        ? [
            '① Tap "How to start" or pick a day below',
            '② Read all chapters for the day in book order',
            '③ Tap "Mark done" when finished → +1 star',
            '🔥 Bible.com Books of the Bible · 365 days',
          ]
        : [
            '① 点标题旁「怎麼開始？」或下方日期',
            '② 按六十六卷顺序读完当日全部章节',
            '③ 读完后点「读完打卡」→ +1 金星',
            '🔥 参考 Bible.com 13630 · 365 天读完全本',
          ];
    } else {
      rules = UI[loc()] && UI[loc()].rules ? UI[loc()].rules : UI['zh-Hant'].rules;
    }
    var html = '<details id="planRulesDetails"><summary><strong>' + ui('rulesSummary') + '</strong></summary><ul class="plan-rules">';
    rules.forEach(function (line) {
      html += '<li>' + line + '</li>';
    });
    html += '</ul>';
    if (plan.rulesZh || plan.rulesEn) {
      html += '<p class="plan-rules-note">' + pick(plan, 'rules') + '</p>';
    }
    html += '<p class="plan-rules-note"><a href="#" id="planReaderLink">' + ui('freeExplore') + '</a></p></details>';
    box.innerHTML = html;
    var link = document.getElementById('planReaderLink');
    if (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        openStudyReader();
      });
    }
  }

  function openStudyReader() {
    var studyUrl = 'bible_study/comprehensive_exegesis_reader.html?book=創世記&chapter=1';
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'navigate', url: studyUrl }, '*');
        return;
      }
    } catch (eParent) {}
    if (global.B100Bridge && global.B100Bridge.studyReaderUrl) {
      window.open(global.B100Bridge.studyReaderUrl(), '_blank', 'noopener');
    }
  }

  function renderMonthGrid(days, today, monthFilter) {
    var root = document.getElementById('monthGrid');
    var tabs = document.getElementById('monthTabs');
    if (!root || !tabs) return;

    var months = {};
    days.forEach(function (d) {
      var m = d.month || Math.ceil(d.day / 30);
      if (!months[m]) months[m] = [];
      months[m].push(d);
    });
    var monthKeys = Object.keys(months).map(Number).sort(function (a, b) { return a - b; });
    var activeMonth = monthFilter || monthKeys[0] || 1;

    tabs.innerHTML = '';
    monthKeys.forEach(function (m) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'month-tab' + (m === activeMonth ? ' on' : '');
      btn.textContent = ui('month').replace('{m}', String(m));
      btn.addEventListener('click', function () {
        renderMonthGrid(days, today, m);
      });
      tabs.appendChild(btn);
    });

    root.innerHTML = '';
    var listRoot = document.getElementById('monthList');
    if (listRoot) listRoot.innerHTML = '';
    var useList = isMobileList();
    if (listRoot) listRoot.hidden = !useList;
    if (root) root.hidden = useList;

    (months[activeMonth] || []).forEach(function (d) {
      var id = progressId(d.day);
      var done = global.B100Progress.isDone(id);
      var isToday = d.day === today;
      var summary = daySummary(d);
      if (useList && listRoot) {
        var row = document.createElement('a');
        row.href = readLink(d.day, d.bookId, d.chapter);
        row.className = 'plan-day-row plan-day-row--compact' + (done ? ' done' : '') + (isToday && !done ? ' today' : '');
        row.innerHTML =
          '<span class="plan-day-row__num">' + d.day + '</span>' +
          '<span class="plan-day-row__chips">' + chipsHtml(d.segments, 5) + '</span>' +
          (done ? '<span class="plan-day-row__mark">✅</span>' : '');
        listRoot.appendChild(row);
        return;
      }
      var cell = document.createElement('a');
      cell.href = readLink(d.day, d.bookId, d.chapter);
      cell.className = 'plan-day-cell' + (done ? ' done' : '') + (isToday && !done ? ' today' : '');
      cell.title = pick(d, 'title') + ' — ' + daySummary(d);
      cell.innerHTML =
        '<span class="plan-day-num">' + d.day + '</span>' +
        '<div class="plan-day-chips">' + chipsHtml(d.segments, 3) + '</div>' +
        '<span class="plan-day-ref">' + daySummary(d) + '</span>';
      if (d.milestone) cell.innerHTML += '<span class="plan-day-badge">' + (d.milestone.emoji || '🏆') + '</span>';
      root.appendChild(cell);
    });
  }

  function segmentLabel(seg) {
    if (global.B100LocalePick) {
      return global.B100LocalePick.bookChapterRef(seg.bookId, seg.chapter, loc());
    }
    return 'B' + seg.bookId + ' ' + seg.chapter;
  }

  function renderTodayHero(cur, cfg) {
    var hero = document.getElementById('todayHero');
    if (!hero || !cur) return;
    var segs = cur.segments || [];
    var segHtml = segs.map(function (seg) {
      var kindClass = 'seg-' + (seg.kind || 'reading');
      if (seg.category && CAT_CLASS[seg.category]) {
        kindClass = CAT_CLASS[seg.category];
      }
      var cat = pick(seg, 'label') || seg.category || seg.kind;
      return (
        '<a class="plan-seg ' + kindClass + '" href="' + readLink(cur.day, seg.bookId, seg.chapter) + '">' +
        '<span class="plan-seg-kind">' + cat + '</span>' +
        '<span class="plan-seg-ref">' + segmentLabel(seg) + '</span></a>'
      );
    }).join('');
    var ms = cur.milestone ? '<p class="plan-milestone">' + (cur.milestone.emoji || '🏆') + ' ' + pick(cur.milestone, 'badge') + '</p>' : '';
    hero.innerHTML =
      '<p class="track-hero__mascot">🦁</p>' +
      '<h2>' + ui('today') + cur.day + ui('dayUnit') + '</h2>' +
      ms +
      '<p class="plan-seg-title">' + ui('segments') + '</p>' +
      '<div class="plan-seg-list">' + segHtml + '</div>' +
      '<div class="b66-actions">' +
      '<a class="btn-track btn-done" href="' + readLink(cur.day, cur.bookId, cur.chapter) + '">' + ui('start') + '</a>' +
      '<a class="btn-track btn-ai" href="' + doneLink(cur.day, cur.bookId, cur.chapter, pick(cur, 'title')) + '">' + ui('done') + '</a>' +
      '</div>';
  }

  function render(plan) {
    var cfg = planCfg();
    var days = plan.days || [];
    var st = global.B100Progress.stats();
    var doneN = global.B100Progress.countDone(cfg.prefix);
    var today = suggestToday(global.B100Progress.load().done, days);

    document.getElementById('statStars').textContent = st.stars;
    document.getElementById('statStreak').textContent = st.streak || '—';
    document.getElementById('statDone').textContent = doneN + ' / ' + days.length;

    var h1 = document.querySelector('.track-hero h1');
    if (h1) h1.textContent = pick(plan, 'name');
    var lead = document.querySelector('.track-hero > p:not(.track-hero__mascot)');
    var leadEl = document.getElementById('planLead');
    if (leadEl) leadEl.textContent = pick(plan, 'rules') || '';
    else if (lead) lead.textContent = pick(plan, 'rules') || '';

    var calHint = document.getElementById('calHint');
    if (calHint && UI[loc()] && UI[loc()].calHint) calHint.textContent = UI[loc()].calHint;

    renderRules(plan);

    var cur = null;
    for (var j = 0; j < days.length; j++) {
      if (days[j].day === today) { cur = days[j]; break; }
    }
    if (!cur && days[0]) cur = days[0];
    renderTodayHero(cur, cfg);
    renderMonthGrid(days, today, cur ? cur.month : 1);

    var path = document.getElementById('recentDays');
    if (path) {
      path.innerHTML = '';
      var start = Math.max(0, today - 6);
      for (var i = start; i < Math.min(days.length, today + 2); i++) {
        var d = days[i];
        var id = progressId(d.day);
        var done = global.B100Progress.isDone(id);
        var isToday = d.day === today;
        var a = document.createElement('a');
        a.className = 'journey-stone' + (done ? ' done' : '') + (isToday && !done ? ' today' : '');
        a.href = readLink(d.day, d.bookId, d.chapter);
        a.innerHTML = '<span class="ico">' + (done ? '✅' : isToday ? '🔥' : '📖') + '</span><span class="num">' + d.day + '</span>';
        path.appendChild(a);
      }
    }
  }

  function init() {
    var run = function () {
      var cfg = planCfg();
      cfg.loader().then(render).catch(function () {
        var el = document.getElementById('monthGrid');
        if (el) el.innerHTML = '<p style="color:#b45309">' + ui('loadFail') + '</p>';
      });
      var howBtn = document.getElementById('btnHowto');
      if (howBtn) {
        howBtn.addEventListener('click', function () {
          var det = document.getElementById('planRulesDetails');
          if (det) {
            det.open = true;
            det.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      }
      if (global.matchMedia) {
        global.matchMedia('(max-width: 720px)').addEventListener('change', function () {
          cfg.loader().then(render);
        });
      }
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
