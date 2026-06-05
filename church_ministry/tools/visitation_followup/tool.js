/**
 * visitation_followup · 探訪跟進（CRM 決策路徑 · 不自動通知）
 */
(function (global) {
  'use strict';

  var TOOL_ID = 'visitation_followup';
  var SOURCE_KEY = 'pastoralFollowupData.tasks';
  var DEMO_MARKER_KEY = 'visitation_followup_demo_loaded_at';
  var PRIVACY_LEVEL = 'pastoral_sensitive';

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
    var b = bridge();
    var count = 0;
    var demoRows = 0;
    var realRows = 0;
    var lastUpdated = '—';
    if (b && b.getPastoralFollowupData) {
      try {
        var store = b.getPastoralFollowupData();
        var tasks = store.tasks || [];
        count = tasks.length;
        tasks.forEach(function (t) {
          if (t.source === 'a2_demo_seed') demoRows += 1;
          else realRows += 1;
        });
        if (store.updated_at) lastUpdated = String(store.updated_at).slice(0, 16).replace('T', ' ');
      } catch (e0) {}
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
      source_label_zh: '探訪跟進',
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
      extra_note: '牧養敏感資料 · 儀表板不顯示完整 note · 不會自動通知 LINE/WhatsApp'
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
      el.className = 'cm-data-source';
      el.innerHTML = '資料：<code>' + esc(SOURCE_KEY) + '</code> · ' + esc(PRIVACY_LEVEL);
      return;
    }
    var opts = buildTrustOptions(extra);
    opts.mount = el;
    DataTrustBadge.renderDataTrustBadge(opts);
  }

  function truncateReason(text, max) {
    var s = String(text || '');
    var n = max != null ? max : 24;
    if (s.length <= n) return s;
    return s.slice(0, n) + '…';
  }

  function loadA2DemoData() {
    var b = bridge();
    if (!b || !b.savePastoralFollowup) {
      return { ok: false, error: 'ChurchDataBridge 未載入' };
    }
    var demoMembers = [
      { id: 801, memberId: 801, name: '張弟兄', fullName: '張弟兄（A2 demo）', _is_demo: true },
      { id: 802, memberId: 802, name: '林姊妹', fullName: '林姊妹（A2 demo）', _is_demo: true },
      { id: 803, memberId: 803, name: '黃姊妹', fullName: '黃姊妹（A2 demo）', _is_demo: true }
    ];
    if (b.getMemberSystemData && b.saveMemberSystemData) {
      var ms = b.getMemberSystemData() || { members: [] };
      if (!Array.isArray(ms.members)) ms.members = [];
      demoMembers.forEach(function (dm) {
        var sid = String(dm.memberId);
        var ix = ms.members.findIndex(function (m) {
          return String(m.memberId != null ? m.memberId : m.id) === sid;
        });
        if (ix >= 0) ms.members[ix] = Object.assign({}, ms.members[ix], dm);
        else ms.members.push(dm);
      });
      b.saveMemberSystemData(ms, { skipRbac: true });
    }

    var store = b.getPastoralFollowupData ? b.getPastoralFollowupData() : { tasks: [] };
    store.tasks = (store.tasks || []).filter(function (t) {
      return t.source !== 'a2_demo_seed';
    });

    var now = new Date().toISOString();
    var seeds = [
      {
        member_id: 801,
        member_name: '張弟兄',
        reason: '新人歡迎跟進',
        priority: 'urgent',
        due_date: todayYmd(),
        status: 'pending',
        source: 'a2_demo_seed',
        note: '（demo）請同工面談後再轉發關懷稿'
      },
      {
        member_id: 802,
        member_name: '林姊妹',
        reason: '久未出席',
        priority: 'high',
        due_date: addDaysYmd(5),
        status: 'pending',
        source: 'a2_demo_seed',
        note: '（demo）敏感內容僅在清單／表單完整顯示'
      },
      {
        member_id: 803,
        member_name: '黃姊妹',
        reason: '風險關懷已聯繫',
        priority: 'normal',
        due_date: addDaysYmd(-2),
        status: 'completed',
        source: 'a2_demo_seed',
        note: '（demo）已完成範例'
      }
    ];
    seeds.forEach(function (row) {
      try {
        b.savePastoralFollowup(row);
      } catch (eSave) {}
    });
    markDemoLoaded('a2');
    notifySync();
    return { ok: true, tasks: 3, marker: DEMO_MARKER_KEY };
  }

  function clearA2DemoData() {
    if (global.DataTrustBadge && DataTrustBadge.clearVisitationFollowupA2Demo) {
      var r = DataTrustBadge.clearVisitationFollowupA2Demo();
      notifySync();
      return r;
    }
    return { ok: false, error: 'DataTrustBadge.clearVisitationFollowupA2Demo 未載入' };
  }

  function renderToolNav(activePage) {
    var pages = [
      { id: 'index', href: 'index.html', label: '① 首頁' },
      { id: 'dashboard', href: 'dashboard.html', label: '② 儀表板' },
      { id: 'form', href: 'form.html', label: '③ 新增跟進' },
      { id: 'list', href: 'list.html', label: '④ 跟進清單' },
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

  function applyCrmIntentPrefill() {
    function apply(payload) {
      if (!payload || typeof payload !== 'object') return;
      var mid = payload.member_id;
      if (mid != null) {
        var sel = document.getElementById('fieldMemberId');
        if (sel) {
          fillMemberSelect(sel, mid);
          if (!sel.value) {
            var opt = document.createElement('option');
            opt.value = String(mid);
            opt.textContent = String(mid);
            opt.selected = true;
            sel.appendChild(opt);
          }
        }
      }
      if (payload.reason || payload.summary) {
        var r = document.getElementById('fieldReason');
        if (r) r.value = payload.reason || payload.summary || '';
      }
      if (payload.priority) {
        var pr = document.getElementById('fieldPriority');
        if (pr) pr.value = payload.priority;
      }
      if (payload.due_date || payload.date) {
        var d = document.getElementById('fieldDueDate');
        if (d) d.value = payload.due_date || payload.date;
      }
      if (payload.note || payload.visitation_note) {
        var n = document.getElementById('fieldNote');
        if (n) n.value = payload.note || payload.visitation_note || '';
      }
    }
    try {
      var params = new URLSearchParams(window.location.search || '');
      if (params.get('member_id')) {
        apply({ member_id: params.get('member_id'), reason: params.get('reason') || '', priority: params.get('priority') || 'normal' });
      }
    } catch (e0) {}
    global.addEventListener('message', function (ev) {
      if (!ev.data || ev.data.type !== 'CRM_INTENT_PREFILL') return;
      apply(ev.data.payload || {});
    });
  }

  global.VisitationFollowupTool = {
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
    truncateReason: truncateReason,
    renderToolNav: renderToolNav,
    copySnippet: copySnippet,
    fillMemberSelect: fillMemberSelect,
    loadA2DemoData: loadA2DemoData,
    clearA2DemoData: clearA2DemoData,
    applyCrmIntentPrefill: applyCrmIntentPrefill
  };
})(typeof window !== 'undefined' ? window : this);
