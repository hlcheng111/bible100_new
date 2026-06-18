/* 主站殼：React 式單頁佈局 + 視窗分頁 */
(function () {
  var STORAGE = 'bible_hub_state';
  var bibleReader = null;

  var TRACKS = [
    { id: 'kids', title: '萌幼故事 🧒', days: [
      { day: 1, title: '起初奇妙大创造', ref: '创世记 1:1', bookId: 1, chapter: 1, hint: '天父造天地' },
      { day: 2, title: '小孩子来耶稣这里', ref: '马太福音 19:14', bookId: 40, chapter: 19, hint: '天国属于孩子' },
      { day: 3, title: '重担交给耶稣', ref: '马太福音 11:28', bookId: 40, chapter: 11, hint: '心里得安息' },
    ]},
    { id: 'seeker', title: '初信金句 🚀', days: [
      { day: 1, title: '专心仰赖', ref: '箴言 3:5', bookId: 20, chapter: 3, hint: '不认靠自己的聪明' },
      { day: 2, title: '本乎恩典', ref: '以弗所书 2:8', bookId: 49, chapter: 2, hint: '因信称义' },
      { day: 3, title: '万事互相效力', ref: '罗马书 8:28', bookId: 45, chapter: 8, hint: '爱神的人得益处' },
    ]},
    { id: 'wisdom', title: '智慧旧约 🪵', days: [
      { day: 1, title: '耶和华是我的牧者', ref: '诗篇 23:1', bookId: 19, chapter: 23, hint: '不致缺乏' },
      { day: 2, title: '认定祂指引', ref: '箴言 3:6', bookId: 20, chapter: 3, hint: '路必正直' },
      { day: 3, title: '脚前的明灯', ref: '诗篇 119:105', bookId: 19, chapter: 119, hint: '路上的光' },
    ]},
    { id: 'prophets', title: '先知旧约 🕊️', days: [
      { day: 1, title: '等候重新得力', ref: '以赛亚书 40:31', bookId: 23, chapter: 40, hint: '如鹰展翅' },
      { day: 2, title: '行公义好怜悯', ref: '弥迦书 6:8', bookId: 33, chapter: 6, hint: '存谦卑的心' },
      { day: 3, title: '平安的意念', ref: '耶利米书 29:11', bookId: 24, chapter: 29, hint: '赐平安不赐灾祸' },
    ]},
    { id: 'gospel', title: '福音新约 👑', days: [
      { day: 1, title: '神爱世人', ref: '约翰福音 3:16', bookId: 43, chapter: 3, hint: '不致灭亡' },
      { day: 2, title: '大使命', ref: '马太福音 28:19', bookId: 40, chapter: 28, hint: '使万民作门徒' },
      { day: 3, title: '圣灵降临', ref: '使徒行传 1:8', bookId: 44, chapter: 1, hint: '得著能力' },
    ]},
  ];

  var TRIVIA = [
    { q: '创世记第一章说，第一天神创造了什么？', opts: ['光', '动物', '人类', '月亮'], ok: 0, exp: '神说要有光，就有了光。（创 1:3）' },
    { q: '诗篇 23 篇称耶和华为？', opts: ['牧者', '君王', '先知', '战士'], ok: 0, exp: '「耶和华是我的牧者，我必不致缺乏。」' },
    { q: '约翰福音 3:16 说神爱？', opts: ['世人', '以色列', '门徒', '天使'], ok: 0, exp: '「神爱世人，甚至将他的独生子赐给他们。」' },
  ];

  var PRIZES = [
    { id: 'p1', name: '贴纸一包', stars: 3 },
    { id: 'p2', name: '读经证书', stars: 8 },
    { id: 'p3', name: '小组奶茶券', stars: 15 },
  ];

  var GOLDEN = [
    { ref: '创 1:1', bookId: 1, chapter: 1, theme: '创造' },
    { ref: '诗 23:1', bookId: 19, chapter: 23, theme: '牧者' },
    { ref: '箴 3:5', bookId: 20, chapter: 3, theme: '仰赖' },
    { ref: '赛 40:31', bookId: 23, chapter: 40, theme: '得力' },
    { ref: '太 11:28', bookId: 40, chapter: 11, theme: '安息' },
    { ref: '约 3:16', bookId: 43, chapter: 3, theme: '神爱' },
    { ref: '罗 8:28', bookId: 45, chapter: 8, theme: '效力' },
    { ref: '弗 2:8', bookId: 49, chapter: 2, theme: '恩典' },
  ];

  var state = load();

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE);
      if (raw) return Object.assign(defaultState(), JSON.parse(raw));
    } catch (e) {}
    return defaultState();
  }

  function defaultState() {
    return {
      locale: 'zh-Hant',
      audience: 'kids',
      track: 0,
      day: 1,
      tab: 'today',
      bottom: 'plans',
      stars: 3,
      done: ['kids-day-1'],
      quiz: 0,
      quizScore: 0,
    };
  }

  function save() {
    localStorage.setItem(STORAGE, JSON.stringify(state));
  }

  function $(sel) { return document.querySelector(sel); }

  function setActive(group, val) {
    document.querySelectorAll('[data-hub="' + group + '"]').forEach(function (el) {
      el.classList.toggle('active', el.getAttribute('data-value') === String(val));
    });
  }

  function jumpBible(bookId, chapter) {
    state.tab = 'browser';
    state.pendingJump = { bookId: bookId, chapter: chapter };
    save();
    syncChrome();
    renderTab();
    var vp = document.getElementById('central-viewport');
    if (vp) vp.scrollIntoView({ behavior: 'smooth' });
  }

  function applyPendingJump() {
    if (!bibleReader || !state.pendingJump) return;
    bibleReader.go(state.pendingJump.bookId, state.pendingJump.chapter);
    state.pendingJump = null;
    save();
  }

  function syncChrome() {
    var starsEl = $('#hubStars');
    if (starsEl) starsEl.textContent = state.stars;
    setActive('locale', state.locale);
    setActive('audience', state.audience);
    setActive('track', state.track);
    setActive('tab', state.tab);
    setActive('bottom', state.bottom);
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      if (typeof BibleShellI18n !== 'undefined') {
        el.textContent = BibleShellI18n.t(state.locale, el.getAttribute('data-i18n'));
      }
    });
  }

  function renderToday() {
    var tr = TRACKS[state.track] || TRACKS[0];
    var d = tr.days[state.day - 1] || tr.days[0];
    var key = tr.id + '-day-' + d.day;
    var done = state.done.indexOf(key) >= 0;
    return (
      '<div class="today-board kids">' +
        '<div class="today-head">' +
          '<span class="day-badge">第 ' + d.day + ' 天</span>' +
          '<h3>' + d.title + '</h3>' +
          '<div class="day-picks">' + tr.days.map(function (x) {
            return '<button type="button" class="day-btn' + (x.day === d.day ? ' on' : '') + '" data-pick-day="' + x.day + '">' + x.day + '</button>';
          }).join('') + '</div>' +
        '</div>' +
        '<div class="verse-card">' +
          '<span class="ref">📖 ' + d.ref + '</span>' +
          '<p class="summary">' + d.hint + ' — 点开「六十六卷」可读整章和合本 + KJV 对照。</p>' +
        '</div>' +
        '<div class="today-actions">' +
          '<button type="button" class="btn-ghost" data-jump-bible="' + d.bookId + '-' + d.chapter + '">读这一章 📖</button>' +
          '<button type="button" class="btn-primary" data-mark-done="' + key + '"' + (done ? ' disabled' : '') + '>' +
            (done ? '今日已读 ✅' : '标记已读 🌟') + '</button>' +
        '</div>' +
      '</div>' +
      '<div class="split-2">' + renderTrivia() + renderPrizes() + '</div>'
    );
  }

  function renderPacing() {
    var runners = [
      { name: '阿果(10岁) 🧒', pct: 66, msg: '我快追上你了！' },
      { name: '新朋友大卫 🆕', pct: 45, msg: '今天的经文好感动' },
      { name: '恩恩 🧒', pct: 33, msg: '又拿到 2 颗星！' },
    ];
  var myPct = Math.min(100, Math.max(15, state.stars * 10));
    return (
      '<h3 class="pane-title">🏃 你跑我追 · 队伍步调</h3>' +
      '<p class="pane-lead">你已累积 <strong>' + state.stars + ' 颗</strong> 黄金星。</p>' +
      '<div class="pace-block">' +
        '<div class="pace-row"><span class="pace-name you">🏃 你</span><div class="pace-bar"><div class="pace-fill you" style="width:' + myPct + '%"></div></div></div>' +
        runners.map(function (r) {
          return '<div class="pace-row"><span class="pace-name">' + r.name + '</span><div class="pace-bar"><div class="pace-fill" style="width:' + r.pct + '%"></div></div><span class="pace-msg">' + r.msg + '</span></div>';
        }).join('') +
      '</div>'
    );
  }

  function renderTrivia() {
    var q = TRIVIA[state.quiz % TRIVIA.length];
    return (
      '<div class="mini-pane trivia">' +
        '<h4>✝ 趣味问答</h4>' +
        '<p class="tq">' + q.q + '</p>' +
        '<div class="t-opts">' + q.opts.map(function (o, i) {
          return '<button type="button" class="t-opt" data-quiz="' + i + '">' + o + '</button>';
        }).join('') + '</div>' +
        '<p class="tq-score">已答对 ' + state.quizScore + ' 题</p>' +
      '</div>'
    );
  }

  function renderPrizes() {
    return (
      '<div class="mini-pane prizes">' +
        '<h4>🎁 星星兑换</h4>' +
        '<p class="pane-lead">手头星星：' + state.stars + ' 颗</p>' +
        PRIZES.map(function (p) {
          var ok = state.stars >= p.stars;
          return '<div class="prize-line"><span>' + p.name + '</span><button type="button" class="btn-prize" data-prize="' + p.id + '" data-cost="' + p.stars + '"' + (ok ? '' : ' disabled') + '>⭐ ' + p.stars + '</button></div>';
        }).join('') +
      '</div>'
    );
  }

  function renderQna() {
    return (
      '<h3 class="pane-title">💬 牧养问答（草稿）</h3>' +
      '<p class="pane-lead">写下问题，复制到 ChatGPT / Kimi 请老师审核后再用。</p>' +
      '<textarea id="aiPrompt" class="ai-box" rows="3" placeholder="例如：马太 11:28 如何应用在学业压力？"></textarea>' +
      '<button type="button" class="btn-primary" id="btnCopyPrompt">复制提问草稿</button>' +
      '<pre class="ai-draft" id="aiDraft"></pre>'
    );
  }

  function renderGuide() {
    return (
      '<h3 class="pane-title">🛡️ 神学导师 & 代祷</h3>' +
      '<p class="pane-lead">选心情，取得简短代祷文（示范）。</p>' +
      '<div class="emo-row">' +
        ['焦虑😰', '很累🥱', '迷茫🌫️', '喜乐😆'].map(function (e, i) {
          return '<button type="button" class="emo-btn' + (i === 0 ? ' active' : '') + '" data-emo="' + i + '">' + e + '</button>';
        }).join('') +
      '</div>' +
      '<p class="prayer-text" id="prayerText">天父，求你陪伴我，赐平安和力量。阿们。</p>'
    );
  }

  function renderBrowser() {
    return '<div id="bibleMount" class="bible-mount"></div>';
  }

  function renderBottom() {
    if (state.bottom === 'philosophy') {
      return (
        '<h3>🗺️ 本站理念</h3>' +
        '<p>每日跑道 + Bible100 补给站；儿童开心跑，成人深度读。经库为<strong>和合本 + KJV</strong>双栏对照，已去除原文编号标记。</p>' +
        '<ol class="how-list"><li>选语言与对象</li><li>选赛道与每日打卡</li><li>中间视窗切换：同跑 / 今日 / 六十六卷 / 问答</li><li>累积星星兑换奖品（示范）</li></ol>'
      );
    }
    return (
      '<h3>📚 读经大师专区</h3>' +
      '<p>点击金句卡片，自动跳到六十六卷对照镜。</p>' +
      '<div class="golden-grid">' + GOLDEN.map(function (g) {
        return '<button type="button" class="g-card" data-jump-bible="' + g.bookId + '-' + g.chapter + '"><span class="g-ref">' + g.ref + '</span><span class="g-theme">' + g.theme + '</span></button>';
      }).join('') + '</div>'
    );
  }

  function renderTab() {
    var pane = $('#viewportPane');
    if (!pane) return;
    var html = '';
    if (state.tab === 'pacing') html = renderPacing();
    else if (state.tab === 'today') html = renderToday();
    else if (state.tab === 'browser') html = renderBrowser();
    else if (state.tab === 'qna') html = renderQna();
    else if (state.tab === 'ai') html = renderGuide();
    pane.innerHTML = html;
    bindPaneEvents();
    if (state.tab === 'browser') {
      if (!bibleReader) {
        bibleReader = new BibleReaderCore();
        var mount = document.getElementById('bibleMount');
        if (mount) {
          bibleReader.mount(mount).then(applyPendingJump);
        }
      } else {
        applyPendingJump();
      }
    }
  }

  function bindPaneEvents() {
    document.querySelectorAll('[data-pick-day]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.day = parseInt(btn.getAttribute('data-pick-day'), 10);
        save();
        renderTab();
      });
    });
    document.querySelectorAll('[data-jump-bible]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var p = btn.getAttribute('data-jump-bible').split('-');
        jumpBible(parseInt(p[0], 10), parseInt(p[1], 10));
      });
    });
    document.querySelectorAll('[data-mark-done]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.getAttribute('data-mark-done');
        if (state.done.indexOf(key) >= 0) return;
        state.done.push(key);
        state.stars += 1;
        save();
        syncChrome();
        renderTab();
      });
    });
    document.querySelectorAll('[data-quiz]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = parseInt(btn.getAttribute('data-quiz'), 10);
        var q = TRIVIA[state.quiz % TRIVIA.length];
        if (idx === q.ok) {
          state.quizScore += 1;
          state.stars += 1;
        }
        state.quiz += 1;
        save();
        syncChrome();
        renderTab();
        alert(idx === q.ok ? '答对了！+1 星 ⭐' : '再试一次～\n' + q.exp);
      });
    });
    document.querySelectorAll('[data-prize]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var cost = parseInt(btn.getAttribute('data-cost'), 10);
        if (state.stars < cost) return;
        state.stars -= cost;
        save();
        syncChrome();
        renderTab();
        alert('兑换成功（示范）🎁');
      });
    });
    var copyBtn = $('#btnCopyPrompt');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        var t = ($('#aiPrompt') || {}).value || '';
        var draft = '【经文创世纪念】请引用经文、不编造经文、不确定请明说。\n问题：' + t;
        var pre = $('#aiDraft');
        if (pre) pre.textContent = draft;
        if (navigator.clipboard) navigator.clipboard.writeText(draft);
      });
    }
    document.querySelectorAll('.emo-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.emo-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var prayers = [
          '天父，我心里不安，求你赐平安。阿们。',
          '主啊，我好累，求你赐我安息和力量。阿们。',
          '神啊，我不知道前路，求你指引。阿们。',
          '感谢主今天的恩典！阿们。',
        ];
        var i = parseInt(btn.getAttribute('data-emo'), 10);
        var el = $('#prayerText');
        if (el) el.textContent = prayers[i] || prayers[0];
      });
    });
  }

  function bind() {
    document.querySelectorAll('[data-hub]').forEach(function (el) {
      el.addEventListener('click', function () {
        var group = el.getAttribute('data-hub');
        var val = el.getAttribute('data-value');
        if (group === 'locale') state.locale = val;
        else if (group === 'audience') { state.audience = val; state.day = 1; }
        else if (group === 'track') { state.track = parseInt(val, 10); state.day = 1; }
        else if (group === 'tab') state.tab = val;
        else if (group === 'bottom') state.bottom = val;
        save();
        syncChrome();
        if (group === 'tab' || group === 'track' || group === 'audience') renderTab();
        if (group === 'bottom') {
          var b = $('#bottomPane');
          if (b) b.innerHTML = renderBottom();
          bindBottom();
        }
      });
    });
    var home = $('#btnHome');
    if (home) {
      home.addEventListener('click', function () {
        state.tab = 'today';
        state.track = 0;
        state.day = 1;
        save();
        syncChrome();
        renderTab();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  function bindBottom() {
    document.querySelectorAll('#bottomPane [data-jump-bible]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var p = btn.getAttribute('data-jump-bible').split('-');
        jumpBible(parseInt(p[0], 10), parseInt(p[1], 10));
      });
    });
  }

  function init() {
    bind();
    syncChrome();
    renderTab();
    var b = $('#bottomPane');
    if (b) { b.innerHTML = renderBottom(); bindBottom(); }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.BibleAppHub = { jumpBible: jumpBible, getState: function () { return state; } };
})();
