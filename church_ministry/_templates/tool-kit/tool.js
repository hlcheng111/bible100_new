/**
 * {{TOOL_LABEL_ZH}} · 五頁工具共用（複製後保留 TOOL_ID / SOURCE_KEY 替換）
 */
(function (global) {
  'use strict';

  var TOOL_ID = '{{TOOL_ID}}';
  var SOURCE_KEY = '{{SOURCE_KEY}}';
  var SOURCE_LABEL_ZH = '{{TOOL_LABEL_ZH}}';
  var DEMO_MARKER_KEY = '{{TOOL_ID}}_demo_loaded_at';
  var PRIVACY_LEVEL = '{{PRIVACY_LEVEL}}';

  function bridge() {
    return global.ChurchDataBridge || null;
  }

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = s == null ? '' : String(s);
    return d.innerHTML;
  }

  function todayYmd() {
    return new Date().toISOString().slice(0, 10);
  }

  function notifySync() {
    try {
      global.parent.postMessage({ type: 'SYNC_OBSERVER_UPDATED', module: TOOL_ID }, '*');
    } catch (e) {}
  }

  function isDemoLoaded() {
    try {
      return !!(global.localStorage && global.localStorage.getItem(DEMO_MARKER_KEY));
    } catch (e) {
      return false;
    }
  }

  function markDemoLoaded(version) {
    try {
      if (global.localStorage) {
        global.localStorage.setItem(DEMO_MARKER_KEY, new Date().toISOString());
        if (version) global.localStorage.setItem(DEMO_MARKER_KEY + '_version', String(version));
      }
    } catch (e) {}
  }

  /**
   * 實作工具時覆寫：回傳 { count, last_updated, has_demo_rows, has_real_rows }
   */
  function getToolDataStats() {
    var count = 0;
    var lastUpdated = '';
    var hasDemo = isDemoLoaded();
    var b = bridge();
    if (b && b.getMembers) {
      try {
        count = (b.getMembers() || []).length;
      } catch (e0) {}
    }
    if (global.DataTrustBadge && DataTrustBadge.getDataFreshness && SOURCE_KEY.indexOf('（') < 0) {
      var fr = DataTrustBadge.getDataFreshness(SOURCE_KEY.split('.')[0]);
      if (fr && fr.last_updated) lastUpdated = fr.last_updated;
      if (fr && fr.count != null && fr.count > count) count = fr.count;
    }
    return {
      count: count,
      last_updated: lastUpdated || '—',
      has_demo_rows: hasDemo,
      has_real_rows: count > 0 && !hasDemo,
      demoFlag: hasDemo
    };
  }

  function buildTrustOptions(extra) {
    var stats = getToolDataStats();
    var dt = global.DataTrustBadge;
    var state = 'empty';
    if (dt && dt.classifyDataState) {
      state = dt.classifyDataState({
        key: SOURCE_KEY,
        count: stats.count,
        demoFlag: stats.demoFlag,
        has_demo_rows: stats.has_demo_rows,
        has_real_rows: stats.has_real_rows
      });
    } else if (stats.count > 0) {
      state = stats.demoFlag ? 'demo' : 'real';
    }
    var o = {
      source_key: SOURCE_KEY,
      source_label_zh: SOURCE_LABEL_ZH,
      count: stats.count,
      last_updated: stats.last_updated,
      demoFlag: stats.demoFlag,
      data_state: state,
      write_behavior: 'read_only',
      notify_behavior: 'none',
      privacy_level: PRIVACY_LEVEL,
      show_clear_demo: false,
      position: 'top'
    };
    if (extra && typeof extra === 'object') {
      Object.keys(extra).forEach(function (k) { o[k] = extra[k]; });
    }
    return o;
  }

  function renderTrustBadge(elementId, extra) {
    var elId = elementId || 'dataTrustMount';
    if (!global.DataTrustBadge || !DataTrustBadge.renderDataTrustBadge) {
      var el = document.getElementById(elId);
      if (!el) return;
      var stats = getToolDataStats();
      el.className = 'cm-data-source';
      el.setAttribute('role', 'note');
      el.innerHTML = '資料來源：<code>' + esc(SOURCE_KEY) + '</code> · 筆數 ' + esc(String(stats.count)) +
        ' · 請載入 data_trust_badge.js';
      return;
    }
    var opts = buildTrustOptions(extra);
    opts.mount = elId;
    DataTrustBadge.renderDataTrustBadge(opts);
  }

  function renderToolNav(activePage) {
    var pages = [
      { id: 'index', href: 'index.html', label: '① 首頁' },
      { id: 'dashboard', href: 'dashboard.html', label: '② 儀表板' },
      { id: 'form', href: 'form.html', label: '③ 新增紀錄' },
      { id: 'list', href: 'list.html', label: '④ 歷史清單' },
      { id: 'setting', href: 'setting.html', label: '⑤ 設定' }
    ];
    return pages.map(function (p) {
      var cur = p.id === activePage ? ' aria-current="page"' : '';
      return '<a href="' + p.href + '"' + cur + '>' + p.label + '</a>';
    }).join('');
  }

  global.ToolKit = {
    TOOL_ID: TOOL_ID,
    SOURCE_KEY: SOURCE_KEY,
    DEMO_MARKER_KEY: DEMO_MARKER_KEY,
    bridge: bridge,
    esc: esc,
    todayYmd: todayYmd,
    notifySync: notifySync,
    isDemoLoaded: isDemoLoaded,
    markDemoLoaded: markDemoLoaded,
    getToolDataStats: getToolDataStats,
    buildTrustOptions: buildTrustOptions,
    renderTrustBadge: renderTrustBadge,
    renderToolNav: renderToolNav
  };
})(typeof window !== 'undefined' ? window : this);
