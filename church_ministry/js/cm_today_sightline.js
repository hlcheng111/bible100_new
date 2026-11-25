/**
 * Bible100 · 今日視線（S1＋B2 主選單）
 * 同一套三塊：①今天做什麼 ②寫崗位交接 ③會友／配對 — dashboard 與 layout_v1 共用，禁雙真相。
 * 依賴：ChurchDataBridge.getCrmWorkbenchTodos（可選）；shell_nav.js（可選）
 */
(function (global) {
  'use strict';

  var CSS_ID = 'cm-today-sightline-css';

  function ensureCss() {
    if (document.getElementById(CSS_ID)) return;
    var s = document.createElement('style');
    s.id = CSS_ID;
    s.textContent = [
      '.cm-ts{margin:0 0 16px;padding:14px 14px 12px;border-radius:16px;border:1px solid #c7d2fe;background:linear-gradient(180deg,#eef2ff 0%,#fff 42%);box-shadow:0 6px 22px rgba(67,56,202,.1)}',
      '.cm-ts__head{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:8px;margin-bottom:12px}',
      '.cm-ts__title{margin:0;font-size:18px;font-weight:800;color:#312e81}',
      '.cm-ts__sub{margin:4px 0 0;font-size:12px;color:#64748b;line-height:1.5;max-width:54em}',
      '.cm-ts__badge{font-size:11px;font-weight:800;color:#4338ca;background:#e0e7ff;border-radius:999px;padding:4px 11px}',
      '.cm-ts__grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}',
      '@media(max-width:900px){.cm-ts__grid{grid-template-columns:1fr}}',
      '.cm-ts__col{background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:14px 12px 12px;min-height:200px;display:flex;flex-direction:column}',
      '.cm-ts__col--1{border-top:4px solid #059669;background:linear-gradient(180deg,#ecfdf5 0%,#fff 36%)}',
      '.cm-ts__col--2{border-top:4px solid #7c3aed;background:linear-gradient(180deg,#f5f3ff 0%,#fff 36%)}',
      '.cm-ts__col--3{border-top:4px solid #2563eb;background:linear-gradient(180deg,#eff6ff 0%,#fff 36%)}',
      '.cm-ts__step{display:inline-block;font-size:10px;font-weight:800;letter-spacing:.04em;color:#64748b;margin:0 0 4px}',
      '.cm-ts__col-h{font-size:16px;font-weight:800;color:#0f172a;margin:0 0 4px;line-height:1.3}',
      '.cm-ts__col-q{font-size:12px;color:#475569;margin:0 0 10px;line-height:1.45;flex:0 0 auto}',
      '.cm-ts__stat{font-size:12px;font-weight:700;color:#334155;margin:0 0 8px}',
      '.cm-ts__stat b{font-size:18px;color:#0f172a}',
      '.cm-ts__list{list-style:none;margin:0 0 8px;padding:0;flex:1}',
      '.cm-ts__list li{font-size:11px;color:#334155;padding:5px 0;border-bottom:1px solid #f1f5f9;line-height:1.4}',
      '.cm-ts__list li:last-child{border-bottom:0}',
      '.cm-ts__list a{color:#2563eb;font-weight:600;text-decoration:none}',
      '.cm-ts__list a:hover{text-decoration:underline}',
      '.cm-ts__empty{font-size:11px;color:#94a3b8;padding:2px 0 8px;margin:0;flex:1}',
      '.cm-ts__btn{display:block;text-align:center;margin-top:auto;padding:12px 14px;border-radius:12px;font-size:13px;font-weight:800;text-decoration:none;cursor:pointer;border:none;font-family:inherit;line-height:1.3}',
      '.cm-ts__btn--1{background:#059669;color:#fff}',
      '.cm-ts__btn--2{background:#7c3aed;color:#fff}',
      '.cm-ts__btn--3{background:#2563eb;color:#fff}',
      '.cm-ts__btn:hover{filter:brightness(1.05)}',
      '.cm-ts__foot{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;padding-top:8px;border-top:1px dashed #e2e8f0}',
      '.cm-ts__chip{font-size:10px;font-weight:700;padding:4px 8px;border-radius:8px;border:1px solid #cbd5e1;background:#f8fafc;color:#334155;text-decoration:none;cursor:pointer}',
      '.cm-ts__chip:hover{background:#eef2ff;border-color:#a5b4fc}',
      '.cm-ts__note{margin:10px 0 0;font-size:10px;color:#64748b;line-height:1.45}',
      '.cm-ts__cta{margin:0 0 14px;padding:14px 14px 12px;border-radius:14px;border:2px solid #4ade80;background:linear-gradient(135deg,#ecfdf5,#f0fdf4);}',
      '.cm-ts__cta-title{margin:0 0 6px;font-size:15px;font-weight:800;color:#14532d}',
      '.cm-ts__cta-sub{margin:0 0 12px;font-size:12px;color:#166534;line-height:1.5}',
      '.cm-ts__cta-row{display:flex;flex-wrap:wrap;gap:8px}',
      '.cm-ts__cta-btn{display:inline-block;padding:12px 16px;border-radius:12px;font-size:13px;font-weight:800;text-decoration:none;cursor:pointer;border:none;font-family:inherit}',
      '.cm-ts__cta-btn--go{background:#059669;color:#fff}',
      '.cm-ts__cta-btn--sec{background:#fff;color:#166534;border:1px solid #86efac}'
    ].join('');
    document.head.appendChild(s);
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/"/g, '&quot;');
  }

  function openContent(ev, url) {
    if (ev && ev.preventDefault) ev.preventDefault();
    if (typeof global.bible100OpenContent === 'function') {
      return global.bible100OpenContent(ev, url);
    }
    global.location.href = url;
    return false;
  }

  function openModule(ev, sidebarUrl, contentUrl) {
    if (ev && ev.preventDefault) ev.preventDefault();
    if (typeof global.bible100ShellNav === 'function') {
      return global.bible100ShellNav(ev, { sidebarUrl: sidebarUrl, contentUrl: contentUrl });
    }
    return openContent(ev, contentUrl);
  }

  function normalizeTodoHref(href) {
    if (!href) return '';
    var h = String(href);
    if (/^https?:/i.test(h) || h.indexOf('file:') === 0) return h;
    if (h.indexOf('../') === 0 || h.indexOf('church_') === 0 || h.indexOf('ai_tools/') === 0 || h.indexOf('smart_ministry/') === 0) {
      return h.replace(/^\.\.\//, '');
    }
    if (h.indexOf('modules/') === 0 || h.indexOf('tools/') === 0) {
      return 'church_ministry/' + h;
    }
    return h;
  }

  function todoLink(item) {
    var href = normalizeTodoHref(item.href);
    var label = esc(item.name || item.member_id || '項目');
    var title = esc(item.title || '');
    if (!href) {
      return '<li><strong>' + label + '</strong> — ' + title + '</li>';
    }
    return (
      '<li><strong>' +
      label +
      '</strong> — ' +
      title +
      ' <a href="' +
      esc(href) +
      '" data-cm-ts-content="' +
      esc(href) +
      '">處理</a></li>'
    );
  }

  function renderList(items, emptyText, maxN) {
    maxN = maxN || 4;
    items = items || [];
    if (!items.length) return '<p class="cm-ts__empty">' + esc(emptyText) + '</p>';
    var html = '<ul class="cm-ts__list">';
    items.slice(0, maxN).forEach(function (it) {
      html += todoLink(it);
    });
    html += '</ul>';
    if (items.length > maxN) {
      html += '<p class="cm-ts__empty">另有 ' + (items.length - maxN) + ' 項…</p>';
    }
    return html;
  }

  function bindClicks(root) {
    root.addEventListener('click', function (ev) {
      var a = ev.target && ev.target.closest ? ev.target.closest('[data-cm-ts-content],[data-cm-ts-module]') : null;
      if (!a) return;
      var mod = a.getAttribute('data-cm-ts-module');
      if (mod) {
        var parts = mod.split('|');
        openModule(ev, parts[0], parts[1]);
        return;
      }
      var c = a.getAttribute('data-cm-ts-content');
      if (c) openContent(ev, c);
    });
  }

  function buildHtml(wb) {
    var t = (wb && wb.totals) || {};
    var nHandover = t.handover || 0;
    var nAction =
      (t.newcomer || 0) +
      (t.care_risk || 0) +
      (t.stage_promotion || 0) +
      nHandover;
    var nPlan = t.planning || 0;
    var total = nAction + nPlan;
    var actionItems = []
      .concat((wb && wb.handover) || [])
      .concat((wb && wb.newcomer) || [])
      .concat((wb && wb.care_risk) || [])
      .concat((wb && wb.stage_promotion) || []);
    var planning = (wb && wb.planning) || [];
    var isEmpty = total === 0;

    var emptyCta = isEmpty
      ? '<div class="cm-ts__cta" role="region" aria-label="空狀態引導">' +
        '<p class="cm-ts__cta-title">太好了——目前沒有待辦。想先體驗？按下面就能亮起來</p>' +
        '<p class="cm-ts__cta-sub">不是壞掉：本機還沒有崗位／新人資料。載入<strong>試用資料</strong>（只存你瀏覽器），再回來刷新就會看到待辦。</p>' +
        '<div class="cm-ts__cta-row">' +
        '<a class="cm-ts__cta-btn cm-ts__cta-btn--go" href="church_ministry/tools/ministry_handover/index.html" data-cm-ts-content="church_ministry/tools/ministry_handover/index.html">去寫崗位交接 · 一鍵載試用</a>' +
        '<a class="cm-ts__cta-btn cm-ts__cta-btn--sec" href="church_ministry/load_central_member_seed.html" data-cm-ts-content="church_ministry/load_central_member_seed.html">載入示範會友</a>' +
        '</div></div>'
      : '';

    var btn1Label = isEmpty
      ? '先載試用資料'
      : nAction > 0
        ? '去處理今日待辦'
        : '打開崗位交接';
    var btn1Href = nHandover > 0 || isEmpty
      ? 'church_ministry/tools/ministry_handover/index.html'
      : actionItems[0] && actionItems[0].href
        ? normalizeTodoHref(actionItems[0].href)
        : 'church_ministry/tools/ministry_handover/index.html';

    return (
      '<div class="cm-ts" id="cm-today-sightline-inner" data-b100-sightline="s1" data-b100-sightline-ui="b2">' +
      '<div class="cm-ts__head">' +
      '<div><h2 class="cm-ts__title">新手 3 步 · 今日視線</h2>' +
      '<p class="cm-ts__sub">先點下面三張大卡即可做事。同一屏：今天做什麼 · 寫交接 · 看會友／配對。AI 只建議，決定在你。</p></div>' +
      '<span class="cm-ts__badge">待辦 ' +
      total +
      '</span></div>' +
      emptyCta +
      '<div class="cm-ts__grid">' +
      '<div class="cm-ts__col cm-ts__col--1">' +
      '<span class="cm-ts__step">STEP 1</span>' +
      '<div class="cm-ts__col-h">今天要做什麼</div>' +
      '<p class="cm-ts__col-q">傳承紅燈、新人、關懷、門徒下一步——都在這裡。</p>' +
      '<p class="cm-ts__stat">待處理 <b>' +
      nAction +
      '</b> 項</p>' +
      renderList(
        actionItems,
        isEmpty ? '尚無待辦——請用上方綠色區或下方大鈕' : '目前沒有待辦提醒',
        4
      ) +
      '<a class="cm-ts__btn cm-ts__btn--1" href="' +
      esc(btn1Href) +
      '" data-cm-ts-content="' +
      esc(btn1Href) +
      '">' +
      esc(btn1Label) +
      '</a>' +
      '<div class="cm-ts__foot">' +
      '<a class="cm-ts__chip" href="church_ministry/tools/visitation_followup/list.html" data-cm-ts-content="church_ministry/tools/visitation_followup/list.html">探訪跟進</a>' +
      '<a class="cm-ts__chip" href="church_ministry/modules/education/education-integrated.html#tab-discipleship" data-cm-ts-content="church_ministry/modules/education/education-integrated.html#tab-discipleship">門訓桌</a>' +
      '</div></div>' +
      '<div class="cm-ts__col cm-ts__col--2">' +
      '<span class="cm-ts__step">STEP 2</span>' +
      '<div class="cm-ts__col-h">寫崗位交接</div>' +
      '<p class="cm-ts__col-q">把「代理人要知道的事」寫下來；可先用 AI 產草稿，人審後再存。</p>' +
      '<p class="cm-ts__stat">傳承紅燈 <b>' +
      nHandover +
      '</b></p>' +
      (nHandover > 0
        ? renderList((wb && wb.handover) || [], '', 3)
        : '<p class="cm-ts__empty">' +
          (isEmpty
            ? '還沒有崗位資料時，先點大鈕載試用'
            : '目前沒有缺交接備註的崗位') +
          '</p>') +
      '<a class="cm-ts__btn cm-ts__btn--2" href="church_ministry/tools/ministry_handover/index.html" data-cm-ts-content="church_ministry/tools/ministry_handover/index.html">' +
      (isEmpty || nHandover > 0 ? '去寫交接／載試用' : '打開交接頁') +
      '</a>' +
      '<div class="cm-ts__foot">' +
      '<a class="cm-ts__chip" href="ai_tools/tools/ai_workbench_integrated.html?scenario=post_handover_sop#tab-prompt" data-cm-ts-content="ai_tools/tools/ai_workbench_integrated.html?scenario=post_handover_sop#tab-prompt">AI 交接草稿</a>' +
      '</div></div>' +
      '<div class="cm-ts__col cm-ts__col--3">' +
      '<span class="cm-ts__step">STEP 3</span>' +
      '<div class="cm-ts__col-h">會友成長／配對</div>' +
      '<p class="cm-ts__col-q">看成長路徑、找適合的人做事（只推薦，不自動派工）。</p>' +
      '<p class="cm-ts__stat">規劃／弱項 <b>' +
      nPlan +
      '</b></p>' +
      renderList(planning, '尚無規劃風險項——可先看會友路徑或配對', 3) +
      '<a class="cm-ts__btn cm-ts__btn--3" href="church_ministry/modules/members/member-integrated.html?tab=growth&path=next" data-cm-ts-content="church_ministry/modules/members/member-integrated.html?tab=growth&path=next">看會友成長路徑</a>' +
      '<div class="cm-ts__foot">' +
      '<a class="cm-ts__chip" href="#" data-cm-ts-module="smart_ministry/sidebar.html|smart_ministry/talent_ministry_matching.html">事奉配對</a>' +
      '<a class="cm-ts__chip" href="#" data-cm-ts-module="smart_ministry/sidebar.html|smart_ministry/spiritual_gifts.html">恩賜發現</a>' +
      '<a class="cm-ts__chip" href="#" data-cm-ts-module="church_planning/sidebar_plan.html|church_planning/cta-os-war-room.html">戰情室</a>' +
      '</div></div>' +
      '</div>' +
      '<p class="cm-ts__note">邊界：建議≠決策；敏感資料留本機。下方「進階區」可展開看 KPI／舊捷徑。' +
      '<a href="ai_tools/pages/knife3_optional_horizon.html" data-cm-ts-content="ai_tools/pages/knife3_optional_horizon.html">刀 3 選配／遠境</a>（預設關）。</p>' +
      '</div>'
    );
  }

  function syncUiLang(el) {
    var loc = '';
    try {
      if (global.B100ChromeI18n && typeof global.B100ChromeI18n.getLocale === 'function') {
        loc = global.B100ChromeI18n.getLocale() || '';
      }
    } catch (e0) {}
    if (!loc && document.documentElement) loc = document.documentElement.lang || '';
    loc = String(loc || 'zh-Hant').toLowerCase();
    var short =
      loc.indexOf('zh') === 0
        ? 'zh'
        : loc.indexOf('vi') === 0
          ? 'vi'
          : loc.indexOf('id') === 0
            ? 'id'
            : loc.indexOf('en') === 0
              ? 'en'
              : 'zh';
    if (el) el.setAttribute('data-b100-ui-lang', short);
    if (document.body) document.body.setAttribute('data-b100-ui-lang', short);
    if (!el.getAttribute('data-b100-ui-variant')) {
      el.setAttribute('data-b100-ui-variant', 'steps');
    }
  }

  function mount(selectorOrEl) {
    ensureCss();
    var el =
      typeof selectorOrEl === 'string'
        ? document.querySelector(selectorOrEl)
        : selectorOrEl;
    if (!el) return false;

    var wb = { newcomer: [], care_risk: [], stage_promotion: [], planning: [], totals: {} };
    try {
      if (global.ChurchDataBridge && typeof ChurchDataBridge.getCrmWorkbenchTodos === 'function') {
        wb = ChurchDataBridge.getCrmWorkbenchTodos() || wb;
      }
    } catch (e) {}

    syncUiLang(el);
    el.innerHTML = buildHtml(wb);
    bindClicks(el);
    return true;
  }

  function autoMount() {
    var nodes = document.querySelectorAll('[data-cm-today-sightline]');
    if (!nodes.length) return;
    for (var i = 0; i < nodes.length; i++) mount(nodes[i]);
  }

  global.CmTodaySightline = { mount: mount, autoMount: autoMount };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoMount);
  } else {
    autoMount();
  }
})(typeof window !== 'undefined' ? window : this);
