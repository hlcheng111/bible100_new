/**
 * finance_reconciliation · 奉獻與財務對帳（不自動發收據／不處理真付款）
 */
(function (global) {
  'use strict';

  var TOOL_ID = 'finance_reconciliation';
  var SOURCE_KEY = 'financeReconciliationData.records';
  var DEMO_MARKER_KEY = 'finance_reconciliation_demo_loaded_at';
  var PRIVACY_LEVEL = 'finance_sensitive';

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

  function addDaysYmd(n) {
    var d = new Date();
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
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

  function getToolDataStats() {
    var count = 0;
    var demoRows = 0;
    var realRows = 0;
    var lastUpdated = '—';
    var b = bridge();
    if (b && b.getFinanceReconciliationData) {
      try {
        var store = b.getFinanceReconciliationData();
        (store.records || []).forEach(function (r) {
          count += 1;
          if (r.source === 'a3_demo_seed') demoRows += 1;
          else realRows += 1;
        });
        if (store.updated_at) lastUpdated = String(store.updated_at).slice(0, 16).replace('T', ' ');
      } catch (e0) {}
    }
    if (global.DataTrustBadge && DataTrustBadge.financeReconciliationRowStats) {
      var rows = DataTrustBadge.financeReconciliationRowStats();
      if (rows.total > count) count = rows.total;
    }
    return {
      count: count,
      last_updated: lastUpdated,
      has_demo_rows: demoRows > 0 || isDemoLoaded(),
      has_real_rows: realRows > 0,
      demoFlag: isDemoLoaded()
    };
  }

  function buildTrustOptions(extra) {
    var stats = getToolDataStats();
    var o = {
      source_key: SOURCE_KEY,
      source_label_zh: '奉獻與財務對帳',
      storage: 'localStorage',
      count: stats.count,
      last_updated: stats.last_updated,
      demoFlag: stats.demoFlag,
      has_demo_rows: stats.has_demo_rows,
      has_real_rows: stats.has_real_rows,
      write_behavior: 'read_only',
      notify_behavior: 'none',
      privacy_level: PRIVACY_LEVEL,
      show_clear_demo: true,
      extra_note: '財務高敏 · 儀表板不顯示完整 note · 不會自動發收據／不處理線上付款'
    };
    if (extra && typeof extra === 'object') {
      Object.keys(extra).forEach(function (k) { o[k] = extra[k]; });
    }
    return o;
  }

  function renderTrustBadge(elementId, extra) {
    var el = document.getElementById(elementId || 'dataTrustMount');
    if (!el) return;
    if (!global.DataTrustBadge || !DataTrustBadge.renderDataTrustBadge) {
      el.innerHTML = '資料：<code>' + esc(SOURCE_KEY) + '</code>';
      return;
    }
    var opts = buildTrustOptions(extra);
    opts.mount = el;
    DataTrustBadge.renderDataTrustBadge(opts);
  }

  function truncateText(text, max) {
    var s = String(text || '');
    var n = max != null ? max : 24;
    if (s.length <= n) return s;
    return s.slice(0, n) + '…';
  }

  function loadA3DemoData() {
    var b = bridge();
    if (!b || !b.saveFinanceReconciliationRecord) {
      return { ok: false, error: 'ChurchDataBridge 未載入' };
    }
    if (global.DataTrustBadge && DataTrustBadge.clearFinanceReconciliationA3Demo) {
      DataTrustBadge.clearFinanceReconciliationA3Demo();
    }
    var seeds = [
      { member_id: 701, member_name: '陳弟兄', date: todayYmd(), amount: 500, fund: '建堂奉獻', method: 'bank_transfer', status: 'pending', receipt_status: 'pending', source: 'a3_demo_seed', note: '（demo）待對帳' },
      { member_id: 702, member_name: '吳姊妹', date: addDaysYmd(-3), amount: 1200, fund: '一般奉獻', method: 'cash', status: 'reconciled', receipt_status: 'copied', source: 'a3_demo_seed', note: '（demo）已對帳' },
      { member_id: 703, member_name: '黃弟兄', date: addDaysYmd(-1), amount: 88, fund: '慈惠基金', method: 'cheque', status: 'exception', receipt_status: 'pending', source: 'a3_demo_seed', note: '（demo）金額待核' }
    ];
    seeds.forEach(function (row) {
      try { b.saveFinanceReconciliationRecord(row); } catch (e) {}
    });
    markDemoLoaded('a3');
    notifySync();
    return { ok: true, records: 3, marker: DEMO_MARKER_KEY };
  }

  function clearA3DemoData() {
    if (global.DataTrustBadge && DataTrustBadge.clearFinanceReconciliationA3Demo) {
      var r = DataTrustBadge.clearFinanceReconciliationA3Demo();
      notifySync();
      return r;
    }
    return { ok: false, error: 'DataTrustBadge.clearFinanceReconciliationA3Demo 未載入' };
  }

  function renderToolNav(activePage) {
    var pages = [
      { id: 'index', href: 'index.html', label: '① 首頁' },
      { id: 'dashboard', href: 'dashboard.html', label: '② 儀表板' },
      { id: 'form', href: 'form.html', label: '③ 新增紀錄' },
      { id: 'list', href: 'list.html', label: '④ 對帳清單' },
      { id: 'setting', href: 'setting.html', label: '⑤ 設定' }
    ];
    return pages.map(function (p) {
      var cur = p.id === activePage ? ' aria-current="page"' : '';
      return '<a href="' + p.href + '"' + cur + '>' + p.label + '</a>';
    }).join('');
  }

  function copySnippet(text) {
    var t = String(text || '');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(t);
    }
    var ta = document.createElement('textarea');
    ta.value = t;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    return Promise.resolve();
  }

  function fillMemberSelect(sel, selectedId) {
    if (!sel) return;
    var b = bridge();
    var rows = [];
    if (b && b.getMembers) {
      rows = (b.getMembers() || []).map(function (m) {
        var id = String(m.memberId != null ? m.memberId : m.id);
        return { id: id, name: m.name || m.fullName || id };
      });
    }
    sel.innerHTML = '<option value="">— 選擇會友 —</option>' +
      rows.map(function (m) {
        var selAttr = selectedId != null && String(selectedId) === m.id ? ' selected' : '';
        return '<option value="' + esc(m.id) + '"' + selAttr + '>' + esc(m.name) + ' (' + esc(m.id) + ')</option>';
      }).join('');
  }

  global.FinanceReconciliationTool = {
    TOOL_ID: TOOL_ID,
    SOURCE_KEY: SOURCE_KEY,
    PRIVACY_LEVEL: PRIVACY_LEVEL,
    DEMO_MARKER_KEY: DEMO_MARKER_KEY,
    isDemoLoaded: isDemoLoaded,
    bridge: bridge,
    esc: esc,
    todayYmd: todayYmd,
    addDaysYmd: addDaysYmd,
    notifySync: notifySync,
    getToolDataStats: getToolDataStats,
    buildTrustOptions: buildTrustOptions,
    renderTrustBadge: renderTrustBadge,
    truncateText: truncateText,
    renderToolNav: renderToolNav,
    copySnippet: copySnippet,
    fillMemberSelect: fillMemberSelect,
    loadA3DemoData: loadA3DemoData,
    clearA3DemoData: clearA3DemoData
  };
})(typeof window !== 'undefined' ? window : this);
